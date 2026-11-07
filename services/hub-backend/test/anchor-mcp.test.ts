import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../src/index";
import { validateDomainRecord } from "../src/contracts";

const now = "2026-11-08T10:00:00Z";
const goal = (id = crypto.randomUUID()) => ({ recordType: "goal", id, title: "Build", notes: "A deliberate day", createdAt: now, symbolName: "flag", tintIndex: 1, keywords: [] });
const plan = (id = crypto.randomUUID()) => ({ recordType: "planBlock", id, isTemplateOverride: true, title: "Build", details: "", plannedStart: now, plannedSeconds: 1800, stateRaw: "planned", kindRaw: "focus", flexibilityRaw: "flexible", createdAt: now, updatedAt: now });

function testEnv(userId: string, writable = true, verify?: (url: URL, scope: string | null, auth: string | null) => void): Env {
  return { ...env, AUTH_SERVICE: { fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input)); const headers = new Headers(init?.headers);
    const scope = headers.get("X-Personal-MCP-Scope");
    verify?.(url, scope, headers.get("Authorization"));
    if (!writable && scope === "anchor.write") return new Response(null, { status: 403 });
    return Response.json({ userId });
  }, connect() { throw new Error("sockets are not used by the identity fixture"); } } };
}
async function rpc(name: string, args: Record<string, unknown>, userId: string, writable = true, customEnv?: Env) {
  return worker.fetch(new Request("https://personal-platform.test/anchor/mcp", { method: "POST", headers: { Authorization: "Bearer original-product-token", "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) }), customEnv ?? testEnv(userId, writable));
}
async function call(name: string, args: Record<string, unknown>, userId: string) {
  const response = await rpc(name, args, userId);
  expect(response.status).toBe(200);
  const body = await response.json() as { result: { structuredContent: Record<string, unknown>; isError: boolean } };
  return body.result;
}
async function syncRecord(userId: string, record: Record<string, unknown>, name: string, baseVersion = 0) {
  const response = await worker.fetch(new Request("https://personal-platform.test/v1/sync/push", { method: "POST", headers: { Authorization: "Bearer native-token", "Content-Type": "application/json" }, body: JSON.stringify({ domain: "anchor", deviceId: "native-test", mutations: [{ id: name, idempotencyKey: crypto.randomUUID(), operation: "upsert", baseVersion, occurredAt: now, record }] }) }), testEnv(userId));
  expect(response.status).toBe(200);
  return response.json();
}

describe("Anchor product connection", () => {
  it("emits backend-created complete native envelopes for cross-runtime qualification", async () => {
    const records = [goal("10000000-0000-4000-8000-000000000001"), plan("10000000-0000-4000-8000-000000000002"),
      { recordType: "preferences", id: "10000000-0000-4000-8000-000000000003", appearanceRaw: "dark", updatedAt: now },
      { recordType: "scheduleTemplate", id: "10000000-0000-4000-8000-000000000004", title: "Usual focus", details: "", createdAt: now, updatedAt: now, startMinutesFromMidnight: 540, plannedSeconds: 1800, weekdayMask: 31, kindRaw: "focus", flexibilityRaw: "flexible", isBehaviorHabit: false, habitUsesSuggestedTime: true, habitVersion: 1 },
    ];
    const emitted = [];
    for (const record of records) {
      const created = await call("anchor_create_record", { recordType: record.recordType, record, requestId: crypto.randomUUID() }, "cross-runtime-fixture");
      expect(created.isError).toBe(false);
      const read = await call("anchor_get_record", { recordType: record.recordType, id: record.id }, "cross-runtime-fixture");
      expect(read.isError).toBe(false);
      emitted.push({ name: read.structuredContent.id, version: read.structuredContent.version, payload: read.structuredContent.record });
    }
    // Actual Worker output, retained as a consumer fixture for native decoding.
    await expect(JSON.stringify({ generatedBy: "Anchor Worker create/get tools", records: emitted }, null, 2) + "\n").toMatchFileSnapshot("./fixtures/anchor-native.json");
  });
  it("resolves the original bearer at the identity authority and requests independent write scope", async () => {
    const seen: string[] = [];
    const customEnv = testEnv("scope-user", true, (url, scope, auth) => {
      expect(url.pathname).toBe("/api/personal-platform/session");
      expect(url.searchParams.get("mcpProduct")).toBe("anchor");
      expect(auth).toBe("Bearer original-product-token");
      seen.push(scope!);
    });
    const record = goal();
    const response = await rpc("anchor_create_record", { recordType: "goal", record, requestId: "scope-create" }, "scope-user", true, customEnv);
    expect(response.status).toBe(200);
    expect(seen).toEqual(["anchor.read", "anchor.write"]);
  });

  it("blocks write grants independently before touching storage", async () => {
    const record = goal();
    const response = await rpc("anchor_create_record", { recordType: "goal", record, requestId: "no-write" }, "read-user", false);
    expect(response.status).toBe(403);
    const absent = await call("anchor_get_record", { recordType: "goal", id: record.id }, "read-user");
    expect(absent.isError).toBe(true);
  });

  it("rejects inherited record type names at every public lookup", async () => {
    for (const recordType of ["__proto__", "constructor", "toString"]) {
      const read = await call("anchor_list_records", { recordType }, "prototype-user");
      expect(read.structuredContent).toMatchObject({ error: { code: "invalid_input" } });
      const create = await call("anchor_create_record", { recordType, requestId: crypto.randomUUID(), record: { ...goal(), recordType } }, "prototype-user");
      expect(create.structuredContent).toMatchObject({ error: { code: "invalid_input" } });
    }
  });

  it("protects mixed-case UUID references and used tags, then durably deletes an unused record", async () => {
    const record = goal();
    const tag = { recordType: "savedTag", id: crypto.randomUUID(), name: "Work", createdAt: now, tintIndex: 1 };
    await call("anchor_create_record", { recordType: "goal", record, requestId: "in-use-goal" }, "delete-user");
    await call("anchor_create_record", { recordType: "savedTag", record: tag, requestId: "in-use-tag" }, "delete-user");
    const sessionId = crypto.randomUUID();
    await syncRecord("delete-user", { recordType: "focusSession", id: sessionId, goalID: record.id.toUpperCase(), tagIDStrings: [tag.id.toUpperCase()], startedAt: now, endedAt: now }, `session-${sessionId}`);
    for (const [recordType, id] of [["goal", record.id], ["savedTag", tag.id]]) {
      const rejected = await call("anchor_delete_record", { recordType, id, baseVersion: 1, requestId: `delete-${recordType}` }, "delete-user");
      expect(rejected.structuredContent).toMatchObject({ error: { code: "record_in_use" } });
    }
    const unused = goal();
    await call("anchor_create_record", { recordType: "goal", record: unused, requestId: "unused-goal" }, "delete-user");
    const args = { recordType: "goal", id: unused.id, baseVersion: 1, requestId: "delete-unused" };
    expect((await call("anchor_delete_record", args, "delete-user")).isError).toBe(false);
    expect((await call("anchor_delete_record", args, "delete-user")).structuredContent).toMatchObject({ duplicate: true });
    expect((await call("anchor_get_record", { recordType: "goal", id: unused.id }, "delete-user")).isError).toBe(true);
  });

  it("preserves native-only plan links while rejecting them as action inputs", async () => {
    const record = { ...plan(), reminderExternalIdentifier: "private-local-reminder", externalEventKey: "private-local-event", reminderLastSyncedAt: now };
    await syncRecord("links-user", record, `planblock-${record.id}`);
    const edited = await call("anchor_update_record", { recordType: "planBlock", id: record.id, requestId: "rename-linked", baseVersion: 1, changes: { title: "Renamed" } }, "links-user");
    expect(edited.isError).toBe(false);
    const stored = await env.DB.prepare("SELECT payload_json FROM anchor_records WHERE user_id=?1 AND id=?2").bind("links-user", `planblock-${record.id}`).first<{ payload_json: string }>();
    expect(JSON.parse(stored!.payload_json)).toMatchObject({ title: "Renamed", reminderExternalIdentifier: "private-local-reminder", externalEventKey: "private-local-event" });
    const read = await call("anchor_get_record", { recordType: "planBlock", id: record.id }, "links-user");
    expect(JSON.stringify(read)).not.toContain("private-local");
    const rejected = await call("anchor_update_record", { recordType: "planBlock", id: record.id, requestId: "bad-native-link", baseVersion: 2, changes: { externalEventKey: "override" } }, "links-user");
    expect(rejected.isError).toBe(true);
  });

  it("isolates accounts, validates fields, preserves full records and exposes no private keywords", async () => {
    const record = goal();
    const created = await call("anchor_create_record", { recordType: "goal", record, requestId: "create-isolated" }, "account-a");
    expect(created.isError).toBe(false);
    const other = await call("anchor_get_record", { recordType: "goal", id: record.id }, "account-b");
    expect(other.isError).toBe(true);
    const read = await call("anchor_get_record", { recordType: "goal", id: record.id }, "account-a");
    expect(read.structuredContent.record).toMatchObject(record);
    for (const bad of [{ ...goal(), secret: "unexpected" }, { ...goal(), tintIndex: -1 }, { ...goal(), keywords: ["private"] }, { ...goal(), createdAt: "yesterday" }]) {
      const rejected = await call("anchor_create_record", { recordType: "goal", record: bad, requestId: crypto.randomUUID() }, "account-a");
      expect(rejected.isError).toBe(true);
    }
  });

  it("durably replays lost responses, rejects changed request IDs and stale edits", async () => {
    const record = goal();
    const args = { recordType: "goal", record, requestId: "same-create" };
    expect((await call("anchor_create_record", args, "replay-user")).isError).toBe(false);
    const retry = await call("anchor_create_record", args, "replay-user");
    expect(retry.structuredContent).toMatchObject({ status: "accepted", duplicate: true, change: { version: 1 } });
    const mismatch = await call("anchor_create_record", { ...args, record: { ...record, title: "Different" } }, "replay-user");
    expect(mismatch.structuredContent).toMatchObject({ error: { code: "request_id_reused" } });
    const edit = { recordType: "goal", id: record.id, baseVersion: 1, requestId: "same-edit", changes: { title: "Ship" } };
    expect((await call("anchor_update_record", edit, "replay-user")).isError).toBe(false);
    expect((await call("anchor_update_record", edit, "replay-user")).structuredContent).toMatchObject({ duplicate: true, change: { version: 2 } });
    const stale = await call("anchor_update_record", { ...edit, requestId: "stale-edit", changes: { title: "Lost change" } }, "replay-user");
    expect(stale.structuredContent).toMatchObject({ error: { code: "conflict" } });
    const read = await call("anchor_get_record", { recordType: "goal", id: record.id }, "replay-user");
    expect(read.structuredContent.record).toMatchObject({ title: "Ship" });
  });

  it("resolves relationships only in the same account and refuses remote timing fabrication", async () => {
    const project = { recordType: "project", id: crypto.randomUUID(), name: "Client", notes: "", createdAt: now, symbolName: "folder", tintIndex: 1, hourlyRate: 0, currencyCode: "USD" };
    await call("anchor_create_record", { recordType: "project", record: project, requestId: "foreign-project" }, "relation-a");
    const foreign = await call("anchor_create_record", { recordType: "planBlock", record: { ...plan(), projectID: project.id }, requestId: "foreign-plan" }, "relation-b");
    expect(foreign.isError).toBe(true);
    const active = await call("anchor_create_record", { recordType: "planBlock", record: { ...plan(), stateRaw: "inProgress", actualStartedAt: now }, requestId: "fake-active" }, "relation-a");
    expect(active.isError).toBe(true);
    const record = plan();
    await call("anchor_create_record", { recordType: "planBlock", record, requestId: "safe-plan" }, "relation-a");
    const read = await call("anchor_get_record", { recordType: "planBlock", id: record.id }, "relation-a");
    expect(read.structuredContent.record).toMatchObject(record);
  });

  it("queues exactly one targeted command and waits for a native receipt", async () => {
    const deviceId = crypto.randomUUID();
    await syncRecord("command-user", { recordType: "agentDevice", id: deviceId, deviceId, platform: "macOS", updatedAt: now, activeSessionID: null, state: "idle", capturePresented: false, capabilities: ["start_focus", "pause_focus", "resume_focus", "end_focus", "capture_distraction"] }, `agentdevice-${deviceId}`);
    const args = { requestId: "remote-start", action: "start_focus", targetDeviceId: deviceId, expectedSessionID: null, args: { intent: "Write", minutes: 25 } };
    const [queued, retry] = await Promise.all([call("anchor_queue_focus_command", args, "command-user"), call("anchor_queue_focus_command", args, "command-user")]);
    expect(queued.structuredContent.status).toBe("queued");
    expect(retry.structuredContent).toMatchObject({ status: "queued", commandId: queued.structuredContent.commandId });
    expect([queued, retry].filter(result => result.structuredContent.duplicate === true)).toHaveLength(1);
    const commandId = queued.structuredContent.commandId as string;
    const pending = await call("anchor_get_record", { recordType: "agentCommand", id: commandId }, "command-user");
    const record = pending.structuredContent.record as Record<string, unknown>;
    expect(record).toMatchObject({ status: "pending", result: null, error: null });
    const sessionID = crypto.randomUUID();
    await syncRecord("command-user", { ...record, status: "applied", result: { sessionID, state: "running", capturePresented: false } }, `agentcommand-${commandId}`, 1);
    const applied = await call("anchor_get_record", { recordType: "agentCommand", id: commandId }, "command-user");
    expect(applied.structuredContent.record).toMatchObject({ status: "applied", result: { sessionID } });
    const foreign = await call("anchor_queue_focus_command", { ...args, requestId: "foreign-command" }, "command-other");
    expect(foreign.isError).toBe(true);
    const invalid = await call("anchor_queue_focus_command", { ...args, requestId: "private-command", args: { ...args.args, note: "Never leave device" } }, "command-user");
    expect(invalid.isError).toBe(true);
  });

  it("hides private legacy distraction fields and rejects nested command note payloads", async () => {
    const id = crypto.randomUUID();
    await call("anchor_get_account", {}, "privacy-user");
    // Retained records can predate strict actions. Read projections still exclude text.
    await env.DB.prepare("INSERT INTO anchor_records (id,user_id,created_at,updated_at,version,origin_device_id,sync_token,payload_json) VALUES (?1,?2,?3,?3,1,'test','test',?4)")
      .bind(`distraction-${id}`, "privacy-user", now, JSON.stringify({ recordType: "distraction", id, capturedAt: now, note: "private note", keywords: ["private keyword"] })).run();
    const read = await call("anchor_get_record", { recordType: "distraction", id }, "privacy-user");
    expect(JSON.stringify(read)).not.toContain("private note");
    expect(JSON.stringify(read)).not.toContain("private keyword");
    expect(() => validateDomainRecord("anchor", { recordType: "agentCommand", id: crypto.randomUUID(), requestId: "bad", action: "capture_distraction", targetDeviceId: "device", issuedAt: now, expiresAt: "2026-11-08T10:05:00Z", expectedSessionID: crypto.randomUUID(), status: "pending", args: { note: "no" }, result: null, error: null })).toThrow();
  });
});
