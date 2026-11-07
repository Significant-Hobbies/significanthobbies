import { HttpError, requireObject } from "./contracts";

type Field = { schema: Record<string, unknown>; check(value: unknown): boolean; optional?: boolean };
const field = (schema: Record<string, unknown>, check: Field["check"]): Field => ({ schema, check });
const text = (max = 10_000, min = 0) => field({ type: "string", minLength: min, maxLength: max }, v => typeof v === "string" && v.length >= min && v.length <= max);
const num = (min = 0, max = 1_000_000_000, integer = false) => field({ type: integer ? "integer" : "number", minimum: min, maximum: max }, v => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max && (!integer || Number.isInteger(v)));
const bool = field({ type: "boolean" }, v => typeof v === "boolean");
const enumeration = (...values: string[]) => field({ type: "string", enum: values }, v => typeof v === "string" && values.includes(v));
export const uuid = field({ type: "string", format: "uuid" }, v => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(v));
const date = field({ type: "string", format: "date-time" }, v => typeof v === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$/u.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 19) === v.slice(0, 19));
const optional = (f: Field): Field => ({ ...f, schema: { anyOf: [f.schema, { type: "null" }] }, optional: true, check: v => v === null || f.check(v) });
const array = (f: Field, max = 50) => field({ type: "array", items: f.schema, maxItems: max }, v => Array.isArray(v) && v.length <= max && v.every(f.check));
const pattern = enumeration("television", "streaming", "films", "shortVideo", "socialFeeds", "newsScroll", "webBrowsing", "rabbitHoles", "consoleGaming", "handheldGaming", "music", "podcasts", "snacking", "takeaway", "sweets", "coffee", "alcohol", "onlineShopping", "windowShopping", "napping", "lyingIn", "texting", "videoCalls", "hangingOut");
const direction = enumeration("sleep", "presence", "relationships", "creativity", "movement", "calm", "focus", "selfTrust");
const kind = enumeration("focus", "routine", "commitment", "rest", "enjoyment");
const flexibility = enumeration("fixed", "flexible", "optional");
const theme = enumeration("building", "writing", "learning", "planning", "communication", "admin", "creative", "other");
const common = { id: uuid };

/** Complete native Codable envelopes. These stricter action schemas do not
 * rewrite the compatibility validator for old deployed sync clients. */
export const ANCHOR_FIELDS: Record<string, Record<string, Field>> = {
  goal: { ...common, title: text(240, 1), notes: text(), createdAt: date, archivedAt: optional(date), symbolName: text(100), tintIndex: num(0, 100, true), themeRaw: optional(theme), keywords: array(text(100)) },
  project: { ...common, name: text(240, 1), notes: text(), createdAt: date, archivedAt: optional(date), symbolName: text(100), tintIndex: num(0, 100, true), hourlyRate: num(), currencyCode: text(3, 3) },
  savedTag: { ...common, name: text(240, 1), createdAt: date, archivedAt: optional(date), tintIndex: num(0, 100, true) },
  preferences: { ...common, appearanceRaw: enumeration("system", "light", "dark"), updatedAt: date },
  behaviorProfile: { ...common, selectedPatternRawValues: array(pattern), desiredDirectionRawValues: array(direction), updatedAt: date },
  scheduleTemplate: { ...common, projectID: optional(uuid), title: text(240, 1), details: text(), createdAt: date, updatedAt: date, archivedAt: optional(date), startMinutesFromMidnight: num(0, 1439, true), plannedSeconds: num(60, 86_400, true), weekdayMask: num(0, 127, true), kindRaw: kind, flexibilityRaw: flexibility, behaviorPatternRaw: optional(pattern), lifeDirectionRaw: optional(direction), isBehaviorHabit: bool, habitUsesSuggestedTime: bool, habitVersion: num(1, 1_000_000, true), graduatedAt: optional(date), habitLevelStartedAt: optional(date), lastProgressPromptedAt: optional(date) },
  habitCompletion: { ...common, habitID: uuid, day: date, isCompleted: bool, completedAt: optional(date), createdAt: date, updatedAt: date },
  dayPlanConfirmation: { ...common, day: date, decisionRaw: enumeration("usual", "adjusted", "later"), baselineRevision: text(100_000), confirmedAt: optional(date), deferredAt: optional(date), updatedAt: date },
  planBlock: { ...common, templateID: optional(uuid), templateOccurrenceDay: optional(date), isTemplateOverride: bool, sessionID: optional(uuid), projectID: optional(uuid), title: text(240, 1), details: text(), plannedStart: date, plannedSeconds: num(60, 86_400, true), actualStartedAt: optional(date), actualEndedAt: optional(date), stateRaw: enumeration("planned", "inProgress", "completed", "skipped", "moved"), kindRaw: kind, flexibilityRaw: flexibility, behaviorPatternRaw: optional(pattern), lifeDirectionRaw: optional(direction), createdAt: date, updatedAt: date },
};
export const HISTORY_EDIT_FIELDS: Record<string, Record<string, Field>> = {
  focusSession: { intent: text(), notes: text(), projectID: optional(uuid), tagIDStrings: array(uuid) },
  distraction: { kindRaw: enumeration("message", "notification", "person", "meeting", "email", "wanderingThought", "rabbitHole", "socialFeed", "entertainment", "otherWork", "chore", "bodily", "environment", "other"), tagIDStrings: array(uuid) },
};
export function validateHistoryChanges(type: string, value: unknown): Record<string, unknown> {
  const changes = requireObject(value, "changes");
  const fields = Object.hasOwn(HISTORY_EDIT_FIELDS, type) ? HISTORY_EDIT_FIELDS[type] : undefined;
  if (!fields) invalid("unsupported history metadata recordType");
  onlyKeys(changes, Object.keys(fields));
  for (const [name, v] of Object.entries(changes)) if (!fields[name]?.check(v)) invalid(`changes.${name} is invalid`);
  return Object.fromEntries(Object.entries(changes).map(([key, v]) => [key, key === "tagIDStrings" ? (v as string[]).map(id => id.toUpperCase()) : ["intent", "notes"].includes(key) ? String(v).trim() : v]));
}

export const ANCHOR_PREFIXES: Record<string, string> = {
  goal: "goal-", project: "project-", savedTag: "savedtag-", preferences: "prefs-", behaviorProfile: "behavior-", scheduleTemplate: "schedule-", habitCompletion: "habit-", dayPlanConfirmation: "dayplan-", planBlock: "planblock-", divergenceEvent: "divergence-", focusSession: "session-", distraction: "distraction-", machineActivityDay: "machineday-", agentCommand: "agentcommand-", agentDevice: "agentdevice-",
};
export const FOCUS_ACTIONS = ["start_focus", "pause_focus", "resume_focus", "end_focus", "capture_distraction"] as const;
export const PLANNER_ACTIONS = ["copy_day", "materialize_day", "reconcile_template"] as const;
export const COMMAND_ACTIONS = [...FOCUS_ACTIONS, ...PLANNER_ACTIONS] as const;

export function objectSchema(properties: Record<string, unknown>, required = Object.keys(properties)) {
  return { type: "object", properties, required, additionalProperties: false };
}
export function recordSchema(type: string) {
  const fields = ANCHOR_FIELDS[type];
  if (!Object.hasOwn(ANCHOR_FIELDS, type) || !fields) invalid("unsupported writable recordType");
  return objectSchema({ recordType: { const: type }, ...Object.fromEntries(Object.entries(fields).map(([name, f]) => [name, f.schema])) }, ["recordType", ...Object.entries(fields).filter(([, f]) => !f.optional).map(([name]) => name)]);
}
export function onlyKeys(input: Record<string, unknown>, keys: readonly string[]) {
  if (Object.keys(input).some(key => !keys.includes(key))) invalid("unknown fields are not allowed");
}
export function invalid(message: string): never { throw new HttpError(400, "invalid_input", message); }
export function validateUUID(value: unknown, label: string): string {
  if (!uuid.check(value)) invalid(`${label} must be a UUID`);
  return String(value).toLowerCase();
}
export function recordName(type: unknown, id: unknown): string {
  if (typeof type !== "string" || !Object.hasOwn(ANCHOR_PREFIXES, type)) invalid("unsupported recordType");
  return ANCHOR_PREFIXES[type] + validateUUID(id, "id");
}
export function validateAnchorDocument(value: unknown, expectedType?: string): Record<string, unknown> {
  const input = requireObject(value, "record");
  const type = input.recordType;
  if (typeof type !== "string" || !Object.hasOwn(ANCHOR_FIELDS, type) || (expectedType && type !== expectedType)) invalid("unsupported writable recordType");
  const fields = Object.hasOwn(ANCHOR_FIELDS, type) ? ANCHOR_FIELDS[type] : undefined;
  if (!fields) invalid("unsupported writable recordType");
  onlyKeys(input, ["recordType", ...Object.keys(fields)]);
  for (const [name, f] of Object.entries(fields)) {
    if (input[name] === undefined && f.optional) continue;
    if (!f.check(input[name])) invalid(`record.${name} is missing or invalid`);
  }
  if (type === "goal" && (input.keywords as unknown[]).length !== 0) invalid("goal keywords stay local; send an empty keywords array");
  if (type === "habitCompletion" && input.isCompleted !== !!input.completedAt) invalid("completedAt must agree with isCompleted");
  if (type === "planBlock" && input.actualEndedAt && input.actualStartedAt && Date.parse(String(input.actualEndedAt)) < Date.parse(String(input.actualStartedAt))) invalid("actualEndedAt precedes actualStartedAt");
  return input;
}

export function validateCommand(value: unknown): Record<string, unknown> {
  const input = requireObject(value, "command");
  onlyKeys(input, ["recordType", "id", "requestId", "action", "targetDeviceId", "consentGeneration", "issuedAt", "expiresAt", "expectedSessionID", "status", "args", "result", "error"]);
  if (input.consentGeneration !== undefined && !optional(uuid).check(input.consentGeneration)) invalid("invalid command consent generation");
  if (input.recordType !== "agentCommand" || !uuid.check(input.id) || !text(200, 1).check(input.requestId) || !text(128, 1).check(input.targetDeviceId)
      || !COMMAND_ACTIONS.includes(input.action as typeof COMMAND_ACTIONS[number]) || !date.check(input.issuedAt) || !date.check(input.expiresAt)
      || !["pending", "applied", "failed"].includes(String(input.status)) || !optional(uuid).check(input.expectedSessionID)) invalid("invalid agent command envelope");
  const duration = Date.parse(String(input.expiresAt)) - Date.parse(String(input.issuedAt));
  if (duration <= 0 || duration > 900_000) invalid("command lifetime must be at most fifteen minutes");
  const planner = PLANNER_ACTIONS.includes(input.action as typeof PLANNER_ACTIONS[number]);
  if ((input.action === "start_focus" || planner) !== (input.expectedSessionID === null)) invalid("expectedSessionID must be null for start/planner actions and an exact UUID for other focus actions");
  const args = requireObject(input.args, "command.args");
  if (input.action === "start_focus") {
    onlyKeys(args, ["intent", "minutes", "goalID", "projectID", "planBlockID", "notes", "tagIDStrings"]);
    if (!text(240, 1).check(args.intent) || !num(0, 1440, true).check(args.minutes)) invalid("start requires intent and bounded minutes");
    for (const key of ["goalID", "projectID", "planBlockID"]) if (args[key] !== undefined && !optional(uuid).check(args[key])) invalid(`invalid ${key}`);
    if (args.notes !== undefined && !text().check(args.notes)) invalid("invalid session notes");
    if (args.tagIDStrings !== undefined && !array(uuid).check(args.tagIDStrings)) invalid("invalid session tags");
  } else if (planner) {
    const keys = input.action === "copy_day" ? ["sourceDay", "targetDay", "timeZone"] : input.action === "materialize_day" ? ["day", "timeZone"] : ["templateID", "from", "timeZone"];
    onlyKeys(args, keys);
    for (const key of keys.filter(key => !["timeZone", "templateID"].includes(key))) if (!date.check(args[key])) invalid(`invalid planner ${key}`);
    if (input.action === "reconcile_template" && !uuid.check(args.templateID)) invalid("invalid templateID");
    if (!text(100, 1).check(args.timeZone)) invalid("planner timeZone is required");
    try { new Intl.DateTimeFormat("en-US", { timeZone: String(args.timeZone) }); }
    catch { invalid("timeZone must name an IANA time zone"); }
  } else if (input.action === "end_focus") {
    onlyKeys(args, ["reason"]);
    if (args.reason !== undefined && !enumeration("completed", "endedEarly", "abandoned").check(args.reason)) invalid("invalid end reason");
  } else onlyKeys(args, []);
  if (input.result !== null) {
    const result = requireObject(input.result, "command.result");
    onlyKeys(result, ["sessionID", "state", "capturePresented", "affectedRecordIDs", "affectedRecordCount"]);
    if (!optional(uuid).check(result.sessionID) || !enumeration("idle", "running", "paused", "finished").check(result.state) || !bool.check(result.capturePresented)) invalid("invalid command receipt");
    if (result.affectedRecordIDs !== undefined && !array(uuid, 500).check(result.affectedRecordIDs)) invalid("invalid affected record IDs");
    if (result.affectedRecordCount !== undefined && !num(0, 100_000, true).check(result.affectedRecordCount)) invalid("invalid affected record count");
  }
  if (input.error !== null && !text(500, 1).check(input.error)) invalid("invalid command error");
  if (input.status === "pending" && (input.result !== null || input.error !== null)) invalid("pending commands cannot claim a result");
  if (input.status === "applied" && (input.result === null || input.error !== null)) invalid("applied commands require a successful receipt");
  if (input.status === "failed" && (input.error === null || input.result !== null)) invalid("failed commands require an error without a success receipt");
  // SavedTag.storageID is UUID.uuidString in Swift, whose string spelling is
  // uppercase. Return a copy so requestId replay still compares the original
  // caller arguments, while the device receives native-matchable tag IDs.
  return input.action === "start_focus" && Array.isArray(args.tagIDStrings)
    ? { ...input, args: { ...args, tagIDStrings: args.tagIDStrings.map(id => String(id).toUpperCase()) } }
    : input;
}

export function validateDevice(value: unknown): Record<string, unknown> {
  const input = requireObject(value, "device");
  onlyKeys(input, ["recordType", "id", "deviceId", "consentGeneration", "platform", "updatedAt", "observedAt", "activeSessionID", "state", "session", "capturePresented", "capabilities"]);
  if (input.consentGeneration !== undefined && !optional(uuid).check(input.consentGeneration)) invalid("invalid device consent generation");
  if (input.recordType !== "agentDevice" || !uuid.check(input.id) || !uuid.check(input.deviceId) || !enumeration("macOS", "iOS").check(input.platform)
      || !date.check(input.updatedAt) || !optional(uuid).check(input.activeSessionID) || !enumeration("idle", "running", "paused").check(input.state)
      || !bool.check(input.capturePresented) || !array(enumeration(...COMMAND_ACTIONS)).check(input.capabilities)) invalid("invalid device capability record");
  if (validateUUID(input.deviceId, "deviceId") !== validateUUID(input.id, "device id")) invalid("device identity does not match its stable identifier");
  if (input.observedAt !== undefined && !date.check(input.observedAt)) invalid("invalid device observation time");
  if (input.session !== undefined && input.session !== null) {
    const session = requireObject(input.session, "device.session");
    onlyKeys(session, ["id", "intent", "goalID", "projectID", "plannedSeconds", "startedAt", "bankedSeconds", "runningSince", "state"]);
    if (!uuid.check(session.id) || !uuid.check(input.activeSessionID) || String(session.id).toLowerCase() !== String(input.activeSessionID).toLowerCase() || !text(240).check(session.intent) || !optional(uuid).check(session.goalID)
        || !optional(uuid).check(session.projectID) || !num(0, 86_400, true).check(session.plannedSeconds) || !date.check(session.startedAt)
        || !num().check(session.bankedSeconds) || !optional(date).check(session.runningSince) || !enumeration("running", "paused").check(session.state)
        || session.state !== input.state) invalid("invalid device session snapshot");
  }
  return input;
}

/** Never return unknown legacy fields or device integration identifiers. */
export function projectAnchorRecord(value: Record<string, unknown>): Record<string, unknown> {
  const type = String(value.recordType);
  const fields = Object.hasOwn(ANCHOR_FIELDS, type) ? ANCHOR_FIELDS[type] : undefined;
  const readFields: Record<string, string[]> = {
    focusSession: ["id", "startedAt", "endedAt", "plannedSeconds", "bankedSeconds", "runningSince", "stateRaw", "endReasonRaw", "pausedAt", "intent", "notes", "tagIDStrings", "hourlyRate", "currencyCode", "computerActiveSeconds", "computerAwaySeconds", "goalID", "projectID"],
    distraction: ["id", "capturedAt", "kindRaw", "kindConfidence", "kindIsUserSet", "offsetSeconds", "didReturnToFocus", "handledAt", "sessionID", "tagIDStrings"],
    machineActivityDay: ["id", "day", "activeSeconds", "trackedSeconds", "createdAt"],
    divergenceEvent: ["id", "blockID", "sessionID", "distractionID", "occurredAt", "kindRaw", "evidenceRaw", "userConfirmed"],
    agentCommand: ["id", "requestId", "action", "targetDeviceId", "consentGeneration", "issuedAt", "expiresAt", "expectedSessionID", "status", "args", "result", "error"],
    agentDevice: ["id", "deviceId", "consentGeneration", "platform", "updatedAt", "observedAt", "activeSessionID", "state", "session", "capturePresented", "capabilities"],
  };
  // Full command validation prevents hidden text from leaking inside args or receipts.
  if (type === "agentCommand") validateCommand(value);
  if (type === "agentDevice") validateDevice(value);
  const keys = fields ? Object.keys(fields) : readFields[type] ?? ["title", "startedAt", "endedAt", "durationSeconds", "interruptionCount"];
  return Object.fromEntries(["recordType", ...keys].filter(key => value[key] !== undefined).map(key => [key, type === "goal" && key === "keywords" ? [] : value[key]]));
}
