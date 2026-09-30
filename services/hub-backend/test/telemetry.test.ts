import { afterEach, describe, expect, it, vi } from "vitest";
import { observeRequest } from "../src/telemetry";

describe("App Health endpoint telemetry", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends the event timestamp as integer milliseconds", async () => {
    const timestamp = 1_790_740_800_123;
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const fetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(null, { status: 202 }),
    );
    vi.stubGlobal("fetch", fetch);
    let background: Promise<unknown> | undefined;

    observeRequest(
      new Request("https://personal-platform.test/health"),
      new Response("ok", { status: 200 }),
      timestamp - 17,
      { APP_HEALTH_INGEST_KEY: "test-key" } as unknown as Env,
      { waitUntil: (promise) => { background = promise; } } as ExecutionContext,
    );
    await background;

    const payload = JSON.parse(String(fetch.mock.calls[0]?.[1]?.body));
    expect(payload.events[0].timestamp).toBe(timestamp);
    expect(Number.isInteger(payload.events[0].timestamp)).toBe(true);
    expect(payload.events[0].duration_ms).toBe(17);
  });
});
