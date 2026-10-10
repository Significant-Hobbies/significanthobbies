// App-Health endpoint telemetry: per-route method/status/duration to the
// ingest collector (health.sassmaker.com / ingest.sassmaker.com). Minimal
// inline client — this package uses npm, which refuses remote-tarball deps,
// so the ~1-request wire format is implemented directly instead of pulling
// @saas-maker/app-health. Silent no-op until APP_HEALTH_INGEST_KEY is set;
// telemetry can never fail a request. Paths are normalized to route
// templates — raw domain names, action ids, and slugs never leave the worker.

const INGEST_ENDPOINT = "https://ingest.sassmaker.com/v1/ingest";

// Optional operator settings, separate from Wrangler's generated bindings.
declare global {
  interface Env {
    APP_HEALTH_INGEST_KEY?: string;
    APP_HEALTH_STAGE_SAMPLE_RATE?: string;
  }
}

type Stage = "auth_ms" | "d1_ms" | "ext_live_ms" | "ext_calorie_ms";
export interface StageTiming {
  route: "/v1/life/today" | "/v1/sync/push" | "/v1/sync/pull";
  startedAt: number;
  stages: Partial<Record<Stage, number>>;
}

function milliseconds(value: number): number {
  return Number.isNaN(value) ? 0 : Math.round(Math.min(600_000, Math.max(0, value)));
}

export function startStageTiming(request: Request, env: Env, startedAt: number): StageTiming | undefined {
  try {
    if (!env.APP_HEALTH_INGEST_KEY?.trim()) return;
    const setting = env.APP_HEALTH_STAGE_SAMPLE_RATE;
    const parsed = setting?.trim() ? Number(setting) : NaN;
    const rate = Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0.1;
    if (rate === 0 || Math.random() >= rate) return;
    const path = new URL(request.url).pathname;
    const route = request.method === "GET" && path === "/v1/life/today" ? "/v1/life/today"
      : request.method === "GET" && path === "/v1/sync/pull" ? "/v1/sync/pull"
      : request.method === "POST" && path === "/v1/sync/push" ? "/v1/sync/push" : null;
    if (route) return { route, startedAt, stages: {} };
  } catch {
    // Telemetry must never affect routing.
  }
}

export async function timeStage<T>(
  timing: StageTiming | undefined,
  stage: Stage,
  operation: () => Promise<T>,
): Promise<T> {
  if (!timing) return operation();
  let startedAt: number;
  try {
    startedAt = Date.now();
  } catch {
    return operation();
  }
  try {
    return await operation();
  } finally {
    try {
      timing.stages[stage] = milliseconds(Date.now() - startedAt);
    } catch {
      // Preserve the operation's result or error.
    }
  }
}

export function observeStageTiming(
  request: Request,
  response: Response,
  timing: StageTiming | undefined,
  env: Env,
  ctx?: ExecutionContext,
): void {
  try {
    const key = env.APP_HEALTH_INGEST_KEY?.trim();
    if (!timing || !key || !ctx) return;
    const colo = request.cf?.colo;
    const batch = {
      schema_version: "v1",
      batch_id: crypto.randomUUID(),
      logs: [{
        log_id: crypto.randomUUID(),
        timestamp: Date.now(),
        event: "api.stage_timing",
        level: "debug",
        props: {
          route: timing.route,
          status: response.status,
          total_ms: milliseconds(Date.now() - timing.startedAt),
          edge_cache: "NONE",
          inner_cache: "NONE",
          colo: typeof colo === "string" && /^[A-Za-z0-9]{1,8}$/.test(colo) ? colo : "unknown",
          ...timing.stages,
        },
      }],
    };
    ctx.waitUntil(fetch("https://ingest.sassmaker.com/v1/logs", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify(batch),
    }).catch(() => undefined));
  } catch {
    // Includes synchronous fetch and waitUntil failures.
  }
}

function routeFor(pathname: string): string | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (/^\/v1\/actions\/[^/]+\/undo$/.test(p)) return "/v1/actions/:id/undo";
  const domain = p.match(/^\/v1\/domains\/([^/]+)\/(summary|records|actions)(?:\/([^/]+))?$/);
  if (domain) return `/v1/domains/:domain/${domain[2]}${domain[3] ? "/:action" : ""}`;
  const exact = [
    "/",
    "/hub",
    "/health",
    "/mcp",
    "/v1/sync/push",
    "/v1/sync/pull",
    "/v1/life/today",
    "/v1/life/events",
    "/v1/activity",
    "/llms.txt",
    "/index.md",
    "/robots.txt",
    "/sitemap.xml",
  ];
  return exact.includes(p) ? p : null;
}

export function observeRequest(
  request: Request,
  response: Response,
  startedAt: number,
  env: Env,
  ctx?: ExecutionContext,
): void {
  const envRecord = env as unknown as Record<string, unknown>;
  const key =
    typeof envRecord.APP_HEALTH_INGEST_KEY === "string"
      ? envRecord.APP_HEALTH_INGEST_KEY.trim()
      : "";
  const route = routeFor(new URL(request.url).pathname);
  if (!key || !route) return;
  const batch = {
    batch_id: crypto.randomUUID(),
    schema_version: "v1",
    runtime: "worker",
    environment: "production",
    events: [
      {
        event_id: crypto.randomUUID(),
        timestamp: Date.now(),
        method: request.method,
        route,
        status_code: response.status,
        duration_ms: Math.max(0, Math.round(Date.now() - startedAt)),
      },
    ],
  };
  const send = fetch(INGEST_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(batch),
  }).catch(() => undefined);
  ctx?.waitUntil(send);
}
