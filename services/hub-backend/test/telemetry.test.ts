import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "cloudflare:test";
import worker from "../src/index";
import { observeRequest, observeStageTiming, startStageTiming, timeStage } from "../src/telemetry";

describe("App Health endpoint telemetry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

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

describe("App Health stage timing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const stageEnv = () => ({
    ...env,
    APP_HEALTH_INGEST_KEY: "test-key",
    APP_HEALTH_STAGE_SAMPLE_RATE: "1",
  });
  const request = (path = "/v1/life/today?private=never-log-this", method = "GET") =>
    new Request(`https://personal-platform.test${path}`, {
      method,
      headers: { Authorization: "Bearer test-token" },
    });

  it.each([
    ["/v1/life/today?private=never-log-this", "GET", 200, ["auth_ms", "d1_ms", "ext_live_ms", "ext_calorie_ms"]],
    ["/v1/sync/pull?domain=live&cursor=0", "GET", 200, ["auth_ms"]],
    ["/v1/sync/push", "POST", 415, ["auth_ms"]],
  ] as const)("emits one valid log for %s", async (path, method, status, stages) => {
    const fetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetch);
    const background: Promise<unknown>[] = [];
    const response = await worker.fetch(request(path, method), stageEnv(), {
      waitUntil: (promise) => { background.push(promise); },
    } as ExecutionContext);
    await Promise.all(background);
    expect(response.status).toBe(status);
    const calls = fetch.mock.calls.filter(([url]) => url === "https://ingest.sassmaker.com/v1/logs");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer test-key" },
    });
    const body = String(calls[0]?.[1]?.body);
    const payload = JSON.parse(body);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(payload.schema_version).toBe("v1");
    expect(payload.batch_id).toMatch(uuid);
    expect(payload.logs).toHaveLength(1);
    const log = payload.logs[0];
    expect(log.log_id).toMatch(uuid);
    expect(Number.isInteger(log.timestamp)).toBe(true);
    expect(log).toMatchObject({ event: "api.stage_timing", level: "debug" });
    expect(log.props).toMatchObject({
      route: path.split("?")[0], status, edge_cache: "NONE", inner_cache: "NONE", colo: "unknown",
    });
    expect(Object.keys(log.props).sort()).toEqual([
      "route", "status", "total_ms", "edge_cache", "inner_cache", "colo", ...stages,
    ].sort());
    for (const key of ["total_ms", ...stages]) {
      expect(key).toMatch(/^[a-z][a-z0-9_]{0,31}_ms$/);
      expect(Number.isInteger(log.props[key])).toBe(true);
      expect(log.props[key]).toBeGreaterThanOrEqual(0);
      expect(log.props[key]).toBeLessThanOrEqual(600_000);
    }
    expect(body).not.toContain("never-log-this");
    expect(body).not.toContain("test-user");
    expect(body).not.toContain("test-token");
  });

  it.each([
    { APP_HEALTH_INGEST_KEY: undefined, APP_HEALTH_STAGE_SAMPLE_RATE: "1" },
    { APP_HEALTH_INGEST_KEY: "test-key", APP_HEALTH_STAGE_SAMPLE_RATE: "0" },
  ])("does not fetch when disabled: %j", (settings) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const testEnv = { ...env, ...settings };
    const req = request();
    const timing = startStageTiming(req, testEnv, Date.now());
    observeStageTiming(req, new Response(), timing, testEnv, { waitUntil: vi.fn() } as unknown as ExecutionContext);
    expect(timing).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([undefined, "", "invalid", "-1", "1.1", "Infinity"])("defaults invalid sampling %s to 0.1", (rate) => {
    const testEnv = { ...stageEnv(), APP_HEALTH_STAGE_SAMPLE_RATE: rate };
    vi.spyOn(Math, "random").mockReturnValue(0.09);
    expect(startStageTiming(request(), testEnv, Date.now())).toBeDefined();
    vi.mocked(Math.random).mockReturnValue(0.1);
    expect(startStageTiming(request(), testEnv, Date.now())).toBeUndefined();
  });

  it.each(["sync", "async"])("preserves the request when fetch throws (%s)", async (mode) => {
    vi.stubGlobal("fetch", vi.fn((url: RequestInfo | URL) => {
      if (url !== "https://ingest.sassmaker.com/v1/logs") return Promise.resolve(new Response(null, { status: 202 }));
      if (mode === "sync") throw new Error("unavailable");
      return Promise.reject(new Error("unavailable"));
    }));
    const background: Promise<unknown>[] = [];
    const response = await worker.fetch(request(), stageEnv(), {
      waitUntil: (promise) => { background.push(promise); },
    } as ExecutionContext);
    await Promise.all(background);
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty("summaries");
  });

  it("rounds and clamps stage timings while preserving operation errors", async () => {
    const timing = startStageTiming(request(), stageEnv(), Date.now())!;
    for (const [elapsed, expected] of [[-5, 0], [1.6, 2], [700_000, 600_000]]) {
      vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(100 + elapsed!);
      await expect(timeStage(timing, "d1_ms", async () => { throw new Error("operation"); }))
        .rejects.toThrow("operation");
      expect(timing.stages.d1_ms).toBe(expected);
      vi.restoreAllMocks();
    }
  });

  it.each(["BOM", "invalid-colo", "ABCDEFGHI"])("validates colo %s and clamps total time", async (colo) => {
    const fetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response());
    vi.stubGlobal("fetch", fetch);
    const req = new Request(request(), { cf: { colo } });
    const testEnv = stageEnv();
    const timing = startStageTiming(req, testEnv, Date.now() - 700_000);
    let background: Promise<unknown> | undefined;
    observeStageTiming(req, new Response(), timing, testEnv, {
      waitUntil: (promise) => { background = promise; },
    } as ExecutionContext);
    await background;
    expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body)).logs[0].props).toMatchObject({
      colo: colo === "BOM" ? "BOM" : "unknown", total_ms: 600_000,
    });
  });
});
