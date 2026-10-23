import { env } from "cloudflare:test";
import { expect, it } from "vitest";
import worker from "../src/index";

it("projects Anchor summaries while preserving explicit sensitive reads and sync restore", async () => {
  const marker = "synthetic-private-detail";
  const record = {
    recordType: "focusSession",
    id: "summary-privacy-focus",
    title: "Synthetic focus",
    startedAt: "2026-10-23T10:00:00.000Z",
    durationSeconds: 1500,
    interruptionCount: 1,
    details: marker,
    futurePrivateField: { note: marker },
  };
  const request = (path: string, body?: unknown) => worker.fetch(
    new Request(`https://personal-platform.test${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: "Bearer test-token",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    env,
  );
  const push = await request("/v1/sync/push", {
    domain: "anchor",
    deviceId: "synthetic-device",
    mutations: [{
      id: record.id,
      idempotencyKey: "summary-privacy-focus-v1",
      operation: "upsert",
      baseVersion: 0,
      occurredAt: record.startedAt,
      record,
    }],
  });
  expect(push.status).toBe(200);
  for (const path of ["/v1/life/today", "/v1/domains/anchor/summary", "/v1/domains/anchor/records"]) {
    const response = await request(path);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("Synthetic focus");
    expect(text).toContain("1500");
    expect(text).not.toContain(marker);
    expect(text).not.toContain("futurePrivateField");
  }
  for (const path of ["/v1/domains/anchor/records?includeSensitive=true", "/v1/sync/pull?domain=anchor&cursor=0"]) {
    const response = await request(path);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain(marker);
    expect(text).toContain("futurePrivateField");
  }
});
