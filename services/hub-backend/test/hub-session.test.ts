import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../src/index";

const hub = "https://live.significanthobbies.com/hub";
const withAuth = (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) =>
  ({ ...env, AUTH_SERVICE: { fetch } }) as unknown as Env;

describe("private Hub session entry", () => {
  it.each(["significanthobbies.com", "www.significanthobbies.com"])("moves %s to the fixed authenticated origin", async (host) => {
    const response = await worker.fetch(new Request(`https://${host}/hub?returnTo=https://evil.example`), env);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(hub);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it.each(["guest", "expired"])("preserves the Hub destination for %s sessions", async () => {
    const response = await worker.fetch(new Request(hub), withAuth(async () => new Response(null, { status: 401 })));
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://live.significanthobbies.com/login?callbackUrl=%2Fhub");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("does not loop when session verification is missing, unavailable or invalid", async () => {
    for (const authEnv of [env, withAuth(async () => new Response(null, { status: 503 })), withAuth(async () => { throw new Error("unavailable"); }), withAuth(async () => Response.json({}))]) {
      const response = await worker.fetch(new Request(hub), authEnv);
      expect([502, 503]).toContain(response.status);
      expect(response.headers.has("location")).toBe(false);
      expect(response.headers.get("cache-control")).toContain("no-store");
    }
  });
  it("forwards the session cookie and renders the authenticated account", async () => {
    const response = await worker.fetch(new Request(hub, { headers: { Cookie: "synthetic=session" } }), withAuth(async (input, init) => {
      const forwarded = new Request(input, init);
      if (forwarded.url.endsWith("/session")) {
        expect(forwarded.headers.get("cookie")).toBe("synthetic=session");
        return Response.json({ userId: "hub-session-synthetic" });
      }
      return Response.json({ domain: "live", status: "connected", activeCount: 0 });
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toContain("Private read-only Hub");
  });
});
