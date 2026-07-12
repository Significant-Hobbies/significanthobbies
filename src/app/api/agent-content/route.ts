import { renderAgentContent } from "~/lib/agent-content";
import { isAgentReadablePath } from "~/lib/agent-routes";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = request.headers.get("x-agent-path") ?? url.searchParams.get("path") ?? "";
  if (!isAgentReadablePath(pathname)) return new Response("Not found", { status: 404 });

  const markdown = renderAgentContent(pathname);
  if (!markdown) return new Response("Not found", { status: 404 });

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Content-Signal": "search=yes, ai-train=no, use=reference",
      "Link": `<https://significanthobbies.com${pathname === "/" ? "" : pathname}>; rel="canonical"`,
      "Vary": "Accept",
    },
  });
}
