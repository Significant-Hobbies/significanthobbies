// App-Health endpoint telemetry: per-route method/status/duration to the
// ingest collector (health.sassmaker.com / ingest.sassmaker.com). Minimal
// inline client — this package uses npm, which refuses remote-tarball deps,
// so the ~1-request wire format is implemented directly instead of pulling
// @saas-maker/app-health. Silent no-op until APP_HEALTH_INGEST_KEY is set;
// telemetry can never fail a request. Paths are normalized to route
// templates — raw domain names, action ids, and slugs never leave the worker.

const INGEST_ENDPOINT = "https://ingest.sassmaker.com/v1/ingest";

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
        timestamp: new Date().toISOString(),
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
