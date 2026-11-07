import { HttpError, requireInteger, requireObject, requireString } from "./contracts";
import { ANCHOR_FIELDS, ANCHOR_PREFIXES, COMMAND_ACTIONS, FOCUS_ACTIONS, PLANNER_ACTIONS, invalid, objectSchema, onlyKeys, projectAnchorRecord, recordName, recordSchema, validateAnchorDocument, validateCommand, validateUUID } from "./anchor-contracts";
import { ProductConnection, ProductTool } from "./product-mcp";
import { applyMutation, getRecord } from "./sync";

const string = { type: "string" };
const id = { type: "string", format: "uuid" };
const requestId = { type: "string", minLength: 1, maxLength: 200 };
const recordType = { type: "string", enum: Object.keys(ANCHOR_PREFIXES) };
const writableType = { type: "string", enum: Object.keys(ANCHOR_FIELDS) };
const version = { type: "integer", minimum: 0 };
type Args = Record<string, unknown>;
type Stored = { id: string; version: number; updated_at: string; payload_json: string; deleted_at?: string | null };

function tool(name: string, description: string, properties: Args, required: string[], call: ProductTool["call"], write = false, destructive = false): ProductTool {
  return { name: `anchor_${name}`, description, inputSchema: objectSchema(properties, required), call, write, destructive };
}
function bound(value: unknown, fallback: number, max: number, min = 0): number {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) invalid("invalid pagination or duration bound");
  return value;
}
function checkedType(value: unknown): string {
  if (typeof value !== "string" || !Object.hasOwn(ANCHOR_PREFIXES, value)) invalid("unsupported recordType");
  return value;
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => `${JSON.stringify(key)}:${canonical(v)}`).join(",")}}`;
  return JSON.stringify(value);
}
function rowResult(row: Stored) {
  return { id: row.id, version: row.version, updatedAt: row.updated_at, freshness: "Last account-sync snapshot; native state may have changed since this record was published.", record: projectAnchorRecord(JSON.parse(row.payload_json)) };
}
async function existing(env: Env, userId: string, type: unknown, identifier: unknown) {
  const name = recordName(type, identifier);
  const row = await getRecord(env, userId, "anchor", name);
  // Pre-mirror completed sessions used bare UUID wire names.
  const legacy = !row && type === "focusSession" ? await getRecord(env, userId, "anchor", String(identifier).toLowerCase()) : null;
  const result = row ?? legacy;
  if (!result || result.deleted_at) throw new HttpError(404, "not_found", "the account record was not found");
  return result;
}

/** Relationships always resolve within the verified tenant and to the expected
 * record kind. User-supplied owner fields never establish affiliation. */
async function relationships(env: Env, userId: string, record: Args) {
  const references: Record<string, string> = { goalID: "goal", projectID: "project", templateID: "scheduleTemplate", habitID: "scheduleTemplate", sessionID: "focusSession", planBlockID: "planBlock", blockID: "planBlock", distractionID: "distraction" };
  for (const [key, type] of Object.entries(references)) if (record[key] != null) {
    const row = await existing(env, userId, type, record[key]);
    if (key === "habitID" && JSON.parse(row.payload_json).isBehaviorHabit !== true) invalid("habitID must refer to a behavior habit");
  }
  if (Array.isArray(record.tagIDStrings)) for (const tag of record.tagIDStrings) await existing(env, userId, "savedTag", tag);
}

/** An action retry must replay the same operation and input. Existing generic
 * sync idempotency keys have a separate namespace and cannot authorize replay. */
async function replay(env: Env, userId: string, name: string, args: Args): Promise<unknown | undefined> {
  const key = actionKey(args);
  const row = await env.DB.prepare(`SELECT a.id, a.tool_name, a.input_json, c.record_id, c.version, c.cursor
    FROM pace_actions a JOIN sync_changes c ON c.user_id = a.user_id AND c.idempotency_key = a.idempotency_key
    WHERE a.user_id = ?1 AND a.idempotency_key = ?2 AND a.domain = 'anchor' AND c.domain = 'anchor'`).bind(userId, key).first<{ id: string; tool_name: string; input_json: string; record_id: string; version: number; cursor: number }>();
  if (!row) return undefined;
  if (row.tool_name !== name || canonical(JSON.parse(row.input_json)) !== canonical(args)) throw new HttpError(409, "request_id_reused", "requestId was already used with a different operation or input");
  const queued = name === "queue_focus_command" || name === "queue_planner_command";
  return { status: queued ? "queued" : "accepted", duplicate: true, actionId: row.id, change: { id: row.record_id, version: row.version, cursor: row.cursor }, ...(queued ? { commandId: row.record_id.slice("agentcommand-".length), deviceExecution: "read the command receipt; queued is not applied" } : {}) };
}
function actionKey(args: Args) { return `anchor-action:${requireString(args.requestId, "requestId", 200)}`; }
async function mutate(env: Env, userId: string, name: string, args: Args, wireName: string, record: Args | undefined, baseVersion: number) {
  const applied = await applyMutation(env, userId, "anchor", "agent-mcp", {
    id: wireName, idempotencyKey: actionKey(args), operation: record ? "upsert" : "delete", baseVersion, occurredAt: new Date().toISOString(), record,
  }, { id: crypto.randomUUID(), toolName: name, input: args, originalInstruction: `Anchor ${name}`, undoPayload: null });
  if (applied.result.status === "conflict") throw new HttpError(409, "conflict", "the record changed; read its latest version before editing", applied.result);
  if (applied.result.status === "duplicate") return await replay(env, userId, name, args) ?? invalid("requestId belongs to another operation");
  return { status: "accepted", duplicate: false, change: applied.result };
}

async function create(args: Args, env: Env, user: { id: string }) {
  onlyKeys(args, ["recordType", "requestId", "record"]);
  const repeated = await replay(env, user.id, "create_record", args);
  if (repeated) return repeated;
  const document = validateAnchorDocument(args.record, String(args.recordType));
  enforceHabitProgression(document);
  await relationships(env, user.id, document);
  await enforcePlannerState(env, user.id, document);
  return mutate(env, user.id, "create_record", args, recordName(document.recordType, document.id), document, 0);
}
async function update(args: Args, env: Env, user: { id: string }) {
  onlyKeys(args, ["recordType", "id", "requestId", "baseVersion", "changes"]);
  const repeated = await replay(env, user.id, "update_record", args);
  if (repeated) return repeated;
  const type = checkedType(args.recordType);
  if (!ANCHOR_FIELDS[type]) invalid("this record kind is read-only; live session changes require a device command");
  const current = await existing(env, user.id, type, args.id);
  const changes = requireObject(args.changes, "changes");
  if (changes.id !== undefined || changes.recordType !== undefined || changes.createdAt !== undefined) invalid("identity and creation time cannot be edited");
  const original = JSON.parse(current.payload_json) as Args;
  // Device integration fields remain untouched, but never become action inputs.
  const document = validateAnchorDocument({ ...projectAnchorRecord(original), ...changes }, type);
  enforceHabitProgression(document, original);
  await relationships(env, user.id, document);
  await enforcePlannerState(env, user.id, document, original);
  const payload = { ...original, ...document };
  return mutate(env, user.id, "update_record", args, current.id, payload, requireInteger(args.baseVersion, "baseVersion"));
}

/** HabitPolicy.canAdd currently permits every nonnegative count (no numerical
 * cap). Version/level/graduation transitions remain native-owned so remote CRUD
 * cannot assert seven-occurrence readiness or rewrite progression history. */
function enforceHabitProgression(document: Args, original?: Args) {
  if (document.recordType !== "scheduleTemplate") return;
  const fields = ["habitVersion", "graduatedAt", "habitLevelStartedAt", "lastProgressPromptedAt"];
  if (!original) {
    if (document.habitVersion !== 1 || fields.slice(1).some(key => document[key] != null)) invalid("new templates start at habit version one; progression is native-owned");
    return;
  }
  if (document.isBehaviorHabit !== original.isBehaviorHabit || fields.some(key => canonical(document[key] ?? null) !== canonical(original[key] ?? null))) invalid("habit identity and progression can only change through the native workflow");
  if (original.isBehaviorHabit && original.archivedAt != null && document.archivedAt == null) invalid("restore a behavior habit in the native app to reset its level start correctly");
}
async function remove(args: Args, env: Env, user: { id: string }) {
  onlyKeys(args, ["recordType", "id", "requestId", "baseVersion"]);
  const repeated = await replay(env, user.id, "delete_record", args);
  if (repeated) return repeated;
  const type = checkedType(args.recordType);
  if (!ANCHOR_FIELDS[type]) invalid("history, interruptions, presence and command receipts cannot be deleted through this connection");
  const current = await existing(env, user.id, type, args.id);
  const document = JSON.parse(current.payload_json) as Args;
  if (type === "planBlock" && (document.sessionID || document.stateRaw === "inProgress")) invalid("an active or observed plan block cannot be deleted remotely");
  const refs: Record<string, string[]> = { goal: ["goalID"], project: ["projectID"], savedTag: [], scheduleTemplate: ["templateID", "habitID"], planBlock: ["blockID", "planBlockID"] };
  for (const key of refs[type] ?? []) {
    const linked = await env.DB.prepare(`SELECT id FROM anchor_records WHERE user_id = ?1 AND deleted_at IS NULL AND lower(json_extract(payload_json, '$.${key}')) = ?2 LIMIT 1`).bind(user.id, validateUUID(args.id, "id")).first();
    if (linked) throw new HttpError(409, "record_in_use", "archive or unlink referenced records before deleting");
  }
  if (type === "savedTag") {
    const linked = await env.DB.prepare("SELECT r.id FROM anchor_records r, json_each(r.payload_json, '$.tagIDStrings') tag WHERE r.user_id = ?1 AND r.deleted_at IS NULL AND lower(tag.value) = ?2 LIMIT 1").bind(user.id, validateUUID(args.id, "id")).first();
    if (linked) throw new HttpError(409, "record_in_use", "unlink records using this tag before deleting");
  }
  return mutate(env, user.id, "delete_record", args, current.id, undefined, requireInteger(args.baseVersion, "baseVersion"));
}

async function enforcePlannerState(env: Env, userId: string, document: Args, original?: Args) {
  if (document.recordType !== "planBlock") return;
  // An observed/timed block is changed by FocusController. Cloud metadata edits
  // cannot invent observed time or take over an active native session.
  if (document.sessionID != null || document.stateRaw === "inProgress" || document.actualStartedAt != null || document.actualEndedAt != null || original?.sessionID != null || original?.actualStartedAt != null || original?.actualEndedAt != null) {
    if (!original || ["sessionID", "stateRaw", "actualStartedAt", "actualEndedAt"].some(key => canonical(document[key]) !== canonical(original[key]))) invalid("timed plan execution requires a device command");
  }
  if (original?.stateRaw === "inProgress" && canonical(document) !== canonical(projectAnchorRecord(original))) invalid("an active plan block cannot be edited remotely");
  void env; void userId;
}

async function queueCommand(args: Args, env: Env, user: { id: string }, planner = false) {
  onlyKeys(args, ["requestId", "action", "targetDeviceId", "expectedSessionID", "args", "expiresInSeconds"]);
  const name = planner ? "queue_planner_command" : "queue_focus_command";
  const actions: readonly string[] = planner ? PLANNER_ACTIONS : FOCUS_ACTIONS;
  if (typeof args.action !== "string" || !actions.includes(args.action)) invalid("action is not supported by this command tool");
  const repeated = await replay(env, user.id, name, args);
  if (repeated) return repeated;
  const commandId = crypto.randomUUID();
  const now = new Date();
  const document = validateCommand({ recordType: "agentCommand", id: commandId, requestId: requireString(args.requestId, "requestId", 200), action: args.action, targetDeviceId: validateUUID(args.targetDeviceId, "targetDeviceId"), expectedSessionID: args.expectedSessionID, args: args.args ?? {}, issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + bound(args.expiresInSeconds, 300, 900, 1) * 1000).toISOString(), status: "pending", result: null, error: null });
  await relationships(env, user.id, requireObject(document.args));
  const device = JSON.parse((await existing(env, user.id, "agentDevice", document.targetDeviceId)).payload_json) as Args;
  if (!(device.capabilities as unknown[]).includes(document.action)) invalid("the selected device does not support this action");
  if (!planner && String(device.activeSessionID).toLowerCase() !== String(document.expectedSessionID).toLowerCase()) throw new HttpError(409, "session_changed", "read the device's current session before queuing this action");
  const response = requireObject(await mutate(env, user.id, name, args, recordName("agentCommand", commandId), document, 0));
  if (response.duplicate) return response;
  return { ...response, status: "queued", commandId, deviceExecution: "pending; a connected target device must apply this command before it is complete" };
}

export const ANCHOR_CONNECTION: ProductConnection = {
  id: "anchor",
  instructions: "Access the connected account's explicitly shared Anchor records. Use versions and a stable requestId for edits. Queued focus commands are not applied until a target device publishes its receipt. Distraction note content and device integration identifiers stay local. Never infer missing data or claim device execution from a queued result.",
  tools: [
    tool("get_account", "Get the verified Anchor account identifier.", {}, [], async (args, _env, user) => { onlyKeys(args, []); return { accountId: user.id, product: "anchor" }; }),
    tool("get_capabilities", "Get registered target devices, their last published state, writable record schemas and remote/device limits.", {}, [], async (args, env, user) => {
      onlyKeys(args, []);
      const devices = await env.DB.prepare("SELECT id,version,updated_at,payload_json FROM anchor_records WHERE user_id = ?1 AND deleted_at IS NULL AND json_extract(payload_json,'$.recordType') = 'agentDevice' ORDER BY updated_at DESC LIMIT 50").bind(user.id).all<Stored>();
      return { product: "anchor", generatedAt: new Date().toISOString(), devices: devices.results.map(rowResult), writableRecordTypes: Object.keys(ANCHOR_FIELDS), recordSchemas: Object.fromEntries(Object.keys(ANCHOR_FIELDS).map(type => [type, recordSchema(type)])), commandActions: COMMAND_ACTIONS, commandReceipt: "read agentCommand by commandId; queued is not applied", sharedData: "only inventory approved in the native app; newly shared data arrives on its next sync", localOnly: ["distraction notes and keywords", "device calendar/reminder identifiers", "notification and capture-sheet execution"], limits: { page: 50, commandLifetimeSeconds: 900, atomicMutationRecords: 1 }, workflows: "Copy-day, day materialization and template reconciliation are remotely queued for native execution over approved account data. Habit progression remains native-owned; current HabitPolicy has no numeric active-habit cap." };
    }),
    tool("list_records", "List bounded shared Anchor records, optionally by type. Includes command receipts; no distraction notes.", { recordType, limit: { type: "integer", minimum: 1, maximum: 50, default: 20 }, offset: { type: "integer", minimum: 0, maximum: 1_000_000, default: 0 } }, [], async (args, env, user) => {
      onlyKeys(args, ["recordType", "limit", "offset"]);
      const type = args.recordType === undefined ? undefined : checkedType(args.recordType);
      const limit = bound(args.limit, 20, 50, 1); const offset = bound(args.offset, 0, 1_000_000);
      const where = `user_id = ?1 AND deleted_at IS NULL${type ? " AND json_extract(payload_json, '$.recordType') = ?2" : ""}`;
      const binds = type ? [user.id, type] : [user.id];
      const rows = await env.DB.prepare(`SELECT id,version,updated_at,payload_json FROM anchor_records WHERE ${where} ORDER BY updated_at DESC,id LIMIT ?${binds.length + 1} OFFSET ?${binds.length + 2}`).bind(...binds, limit + 1, offset).all<Stored>();
      return { items: rows.results.slice(0, limit).map(rowResult), nextOffset: rows.results.length > limit ? offset + limit : null };
    }),
    tool("get_record", "Read one account-scoped Anchor record and its current version, including a device command receipt.", { recordType, id }, ["recordType", "id"], async (args, env, user) => { onlyKeys(args, ["recordType", "id"]); return rowResult(await existing(env, user.id, args.recordType, args.id)); }),
    tool("create_record", "Create one complete native planner metadata record. Read capabilities for exact schemas. No live session fabrication.", { recordType: writableType, requestId, record: { oneOf: Object.keys(ANCHOR_FIELDS).map(recordSchema) } }, ["recordType", "requestId", "record"], create, true),
    tool("update_record", "Edit known planner fields with optimistic concurrency. Archive by setting archivedAt. Timed execution stays device-owned.", { recordType: writableType, id, baseVersion: version, requestId, changes: { type: "object" } }, ["recordType", "id", "baseVersion", "requestId", "changes"], update, true),
    tool("delete_record", "Delete one unused planner metadata record by current version. History and active execution cannot be deleted.", { recordType: writableType, id, baseVersion: version, requestId }, ["recordType", "id", "baseVersion", "requestId"], remove, true, true),
    tool("queue_focus_command", "Queue a focus action for an explicitly targeted native device. Start requires expectedSessionID null; all other focus commands require its exact active UUID. Capture opens the local sheet, never stores note content remotely.", { requestId, action: { type: "string", enum: FOCUS_ACTIONS }, targetDeviceId: { ...string, maxLength: 128 }, expectedSessionID: { anyOf: [id, { type: "null" }] }, args: { type: "object", description: "start_focus: intent,minutes, optional goalID,projectID,planBlockID,notes,tagIDStrings. end_focus: optional reason completed|endedEarly|abandoned. Other actions: empty object." }, expiresInSeconds: { type: "integer", minimum: 1, maximum: 900, default: 300 } }, ["requestId", "action", "targetDeviceId", "expectedSessionID"], (args, env, user) => queueCommand(args, env, user), true),
    tool("queue_planner_command", "Queue native copy-day, materialize-day or template reconciliation over explicitly shared data. A target device executes the existing planner service and publishes affected IDs; queued is not applied.", { requestId, action: { type: "string", enum: PLANNER_ACTIONS }, targetDeviceId: { ...id }, expectedSessionID: { type: "null" }, args: { oneOf: [objectSchema({ sourceDay: { type: "string", format: "date-time" }, targetDay: { type: "string", format: "date-time" }, timeZone: string }), objectSchema({ day: { type: "string", format: "date-time" }, timeZone: string }), objectSchema({ templateID: id, from: { type: "string", format: "date-time" }, timeZone: string })] }, expiresInSeconds: { type: "integer", minimum: 1, maximum: 900, default: 300 } }, ["requestId", "action", "targetDeviceId", "expectedSessionID", "args"], (args, env, user) => queueCommand(args, env, user, true), true),
  ],
};
