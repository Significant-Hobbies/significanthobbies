import { authenticateSession, ensureUser } from "./auth";
import { getCalorieToday } from "./calorie";
import { getToday } from "./domains";
import { getLiveSummary } from "./live";

const PRODUCTS = [
  ["live", "Live", "A lifelong catalog for places, hobbies, side quests, and experiences.", "https://live.significanthobbies.com", "#fff09a"],
  ["journal", "Journal", "A private page for morning, evening, and everything worth remembering.", "https://journal.significanthobbies.com", "#eadcf6"],
  ["habits", "Habits", "Keep what helps and remember the choices you made.", "https://habits.significanthobbies.com", "#dceeff"],
  ["calorie", "Calorie", "A private food, water, medicine, and weight journal.", "https://calorie.significanthobbies.com", "#e4efd9"],
  ["setline", "Setline", "A personal record for practice and progress.", "https://setline.significanthobbies.com", "#f5e2d2"],
  ["kith", "Kith", "A private place for the people you want to keep close.", "https://kith.significanthobbies.com", "#f6e1d4"],
  ["anchor", "Anchor", "See where your time went, including interruptions.", "https://anchor.significanthobbies.com", "#dce8f0"],
] as const;

export async function handleHub(request: Request, env: Env): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  if (pathname === "/") return html(page(null));
  const user = await authenticateSession(request, env);
  if (!user) return Response.redirect(new URL("/login?returnTo=%2Fhub", request.url).toString(), 302);
  await ensureUser(env, user);
  const [platform, live, calorie] = await Promise.all([
    getToday(env, user.id),
    getLiveSummary(request, env, user),
    getCalorieToday(request, env, user),
  ]);
  const entries = [...platform.summaries, live, calorie] as Array<Record<string, unknown>>;
  const summaries = new Map<string, Record<string, unknown>>(
    entries.map((summary) => [String(summary.domain), summary]),
  );
  return html(page(summaries), { "Cache-Control": "private, no-store" });
}

function page(summaries: Map<string, Record<string, unknown>> | null): string {
  const cards = PRODUCTS.map(([id, name, description, href, color]) => {
    const summary = summaries?.get(id);
    const count = typeof summary?.activeCount === "number" ? `${summary.activeCount} records` : null;
    const state = summaries ? count ?? (summary?.status === "unavailable" ? "Unavailable" : "Connected") : "Open app";
    const updated = typeof summary?.lastUpdatedAt === "string" ? ` · updated ${escapeHtml(summary.lastUpdatedAt.slice(0, 10))}` : "";
    return `<a class="card" href="${href}" style="--tone:${color}"><span class="mark">${name[0]}</span><h2>${name}</h2><p>${description}</p><small>${state}${updated}</small></a>`;
  }).join("");
  const action = summaries
    ? '<span class="pill">Private read-only dashboard</span>'
    : '<a class="dashboard" href="/hub">Open the read-only dashboard →</a>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Significant Hobbies — Personal Apps</title><meta name="description" content="Seven focused personal apps and one privacy-safe Hub."><style>${CSS}</style></head><body><main><header><p class="kicker">Significant Hobbies</p><h1>Your personal apps,<br>in one place.</h1><p class="lede">Seven focused products. Each remains useful and owns its own data.</p>${action}</header><section aria-label="Personal apps">${cards}</section><footer>Each product owns its interface and data. The Hub shows privacy-safe summaries only.</footer></main></body></html>`;
}

function html(body: string, extra: HeadersInit = {}): Response {
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300", ...extra } });
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

const CSS = `:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#171713;background:#f6f4ed}*{box-sizing:border-box}body{margin:0}main{max-width:1120px;margin:auto;padding:72px 24px 40px}.kicker{font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.75rem}h1{font-family:Georgia,serif;font-size:clamp(3rem,8vw,6.8rem);line-height:.9;letter-spacing:-.05em;margin:24px 0}.lede{font-size:1.15rem;max-width:560px;line-height:1.6;color:#57574f}.dashboard{display:inline-block;margin-top:18px;color:inherit;font-weight:700}.pill{display:inline-block;margin-top:18px;padding:9px 13px;border:1px solid #aaa;border-radius:999px;font-size:.82rem}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:64px}.card{min-height:250px;padding:22px;border:1px solid #d6d3c9;border-radius:20px;background:linear-gradient(145deg,var(--tone),#fff 72%);color:inherit;text-decoration:none;display:flex;flex-direction:column}.card:hover{transform:translateY(-2px);box-shadow:0 14px 35px #24241012}.mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid #1d1d1888;border-radius:12px;font-weight:800}.card h2{font-family:Georgia,serif;font-size:1.8rem;margin:auto 0 8px}.card p{color:#53534c;line-height:1.45;margin:0 0 18px}.card small{font-weight:700}footer{margin-top:40px;padding-top:24px;border-top:1px solid #d6d3c9;color:#68685f;font-size:.9rem}@media(max-width:600px){main{padding-top:42px}section{margin-top:42px}}`;
