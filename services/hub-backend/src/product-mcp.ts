import { optionalFetcher, ensureUser } from "./auth";
import { AuthenticatedUser, HttpError, requireObject, requireString } from "./contracts";
import { json, readJson } from "./http";

export interface ProductTool {
  name: string;
  description: string;
  write?: boolean;
  destructive?: boolean;
  inputSchema: Record<string, unknown>;
  call(args: Record<string, unknown>, env: Env, user: AuthenticatedUser): Promise<unknown>;
}

export interface ProductConnection {
  id: string;
  audience: string;
  instructions: string;
  tools: readonly ProductTool[];
}

/** The identity authority independently verifies the original bearer, audience,
 * scope and provider account. Neither gateway headers nor a supplied user ID
 * can select the tenant. The product registry owns the scope being requested. */
export async function authenticateProductMcp(
  request: Request, env: Env, product: string, audience: string, write = false,
): Promise<AuthenticatedUser> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length > 16_384) {
    throw new HttpError(401, "unauthorized", "a product OAuth bearer is required");
  }
  const authority = optionalFetcher(env, "AUTH_SERVICE");
  if (!authority) throw new HttpError(503, "auth_not_configured", "account verification is unavailable");
  const url = new URL("https://personal-auth.internal/api/personal-platform/session");
  url.searchParams.set("mcpProduct", product);
  const scope = `${product}.${write ? "write" : "read"}`;
  const response = await authority.fetch(url, {
    headers: { Authorization: authorization, "X-Personal-MCP-Scope": scope },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 401 || response.status === 403) {
    throw new HttpError(response.status, "unauthorized", "the account or required product permission could not be verified");
  }
  if (!response.ok) throw new HttpError(503, "identity_unavailable", "account verification is unavailable");
  const body = requireObject(await response.json(), "identity response");
  // Old authority deployments return userId for native bearers while ignoring
  // the product/scope request. Require the versioned verified authorization
  // contract, so mixed deployment order fails closed rather than downgrading.
  if (body.mcpProduct !== product || body.scope !== scope || body.audience !== audience || body.authorizationVersion !== 1) {
    throw new HttpError(503, "identity_contract_unavailable", "the identity authority has not verified this product authorization contract");
  }
  return { id: requireString(body.userId, "verified userId", 256) };
}

/** Reusable transport for independently owned product connections. The legacy
 * cross-app /mcp remains unchanged. Authorization happens before listing or
 * execution, and write tools receive a second independently verified grant. */
export async function handleProductMcp(request: Request, env: Env, product: ProductConnection): Promise<Response> {
  if (request.method !== "POST") throw new HttpError(405, "method_not_allowed", "use POST for MCP");
  const body = requireObject(await readJson(request));
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    throw new HttpError(400, "invalid_request", "invalid JSON-RPC request");
  }
  let user = await authenticateProductMcp(request, env, product.id, product.audience);
  await ensureUser(env, user);
  const result = (value: unknown) => json({ jsonrpc: "2.0", id: body.id ?? null, result: value });
  if (body.method === "notifications/initialized") return new Response(null, { status: 202 });
  if (body.method === "initialize") return result({
    protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: false } },
    serverInfo: { name: `${product.id}-account`, version: "1.0.0" }, instructions: product.instructions,
  });
  if (body.method === "ping") return result({});
  if (body.method === "tools/list") return result({ tools: product.tools.map((tool) => ({
    name: tool.name, description: tool.description, inputSchema: tool.inputSchema,
    annotations: { readOnlyHint: !tool.write, destructiveHint: !!tool.destructive, idempotentHint: true, openWorldHint: false },
    securitySchemes: [{ type: "oauth2", scopes: [`${product.id}.read`, ...(tool.write ? [`${product.id}.write`] : [])] }],
  })) });
  if (body.method !== "tools/call") return json({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32601, message: "Method not found" } });
  const params = requireObject(body.params, "params");
  const tool = product.tools.find((candidate) => candidate.name === params.name);
  if (!tool) throw new HttpError(404, "unknown_tool", "tool is not available on this product connection");
  // Never execute a write as the identity from the read check if account
  // resolution changes between requests to the identity authority.
  if (tool.write) {
    const granted = await authenticateProductMcp(request, env, product.id, product.audience, true);
    if (granted.id !== user.id) throw new HttpError(401, "account_changed", "the connected account changed");
    user = granted;
  }
  try {
    const value = await tool.call(requireObject(params.arguments ?? {}, "arguments"), env, user);
    return result({ content: [{ type: "text", text: JSON.stringify(value) }], structuredContent: value, isError: false });
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
    const value = { ok: false, error: { code: error.code, message: error.message, ...(error.details === undefined ? {} : { details: error.details }) } };
    return result({ content: [{ type: "text", text: JSON.stringify(value) }], structuredContent: value, isError: true });
  }
}
