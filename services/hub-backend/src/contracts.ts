export const DOMAINS = [
  "live",
  "journal",
  "habits",
  "setline",
  "kith",
  "anchor",
  "calorie",
] as const;

export type Domain = (typeof DOMAINS)[number];
export type MutationOperation = "upsert" | "delete";

export interface Mutation {
  id: string;
  idempotencyKey: string;
  operation: MutationOperation;
  baseVersion: number;
  occurredAt: string;
  record?: unknown;
}

export interface PushRequest {
  domain: Domain;
  deviceId: string;
  mutations: Mutation[];
}

export interface AppliedChange {
  id: string;
  idempotencyKey: string;
  status: "accepted" | "duplicate";
  version: number;
  cursor: number;
}

export interface ConflictChange {
  id: string;
  idempotencyKey: string;
  status: "conflict";
  expectedVersion: number;
  actualVersion: number | null;
}

export type PushResult = AppliedChange | ConflictChange;

export interface AuthenticatedUser {
  id: string;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export function isDomain(value: unknown): value is Domain {
  return typeof value === "string" && DOMAINS.includes(value as Domain);
}

export function requireObject(value: unknown, label = "body"): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "invalid_request", `${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

export function requireString(
  value: unknown,
  label: string,
  maximumLength = 10_000,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "invalid_request", `${label} must be a non-empty string`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maximumLength) {
    throw new HttpError(400, "invalid_request", `${label} is too long`);
  }
  return trimmed;
}

export function optionalString(
  value: unknown,
  label: string,
  maximumLength = 10_000,
): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return requireString(value, label, maximumLength);
}

export function requireIsoDate(value: unknown, label: string): string {
  const date = requireString(value, label, 64);
  const isoDate = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;
  if (!isoDate.test(date) || Number.isNaN(Date.parse(date))) {
    throw new HttpError(400, "invalid_request", `${label} must be an ISO-8601 date`);
  }
  return date;
}

export function optionalIsoDate(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return requireIsoDate(value, label);
}

export function requireInteger(
  value: unknown,
  label: string,
  minimum = 0,
  maximum?: number,
): number {
  const valid = Number.isInteger(value)
    && (value as number) >= minimum
    && (maximum === undefined || (value as number) <= maximum);
  if (!valid) {
    const expectation = maximum === undefined
      ? `an integer >= ${minimum}`
      : `an integer between ${minimum} and ${maximum}`;
    throw new HttpError(400, "invalid_request", `${label} must be ${expectation}`);
  }
  return value as number;
}

function requireEnum<T extends string>(
  value: unknown,
  label: string,
  choices: readonly T[],
): T {
  if (typeof value !== "string" || !choices.includes(value as T)) {
    throw new HttpError(400, "invalid_request", `${label} must be one of: ${choices.join(", ")}`);
  }
  return value as T;
}

export function validateDomainRecord(
  domain: Domain,
  value: unknown,
): Record<string, unknown> {
  const input = requireObject(value, "record");
  switch (domain) {
    case "live":
      return compact({
        title: requireString(input.title, "record.title", 240),
        status: requireEnum(input.status, "record.status", [
          "planned",
          "in_progress",
          "completed",
        ] as const),
        targetDate: optionalIsoDate(input.targetDate, "record.targetDate"),
        notes: optionalString(input.notes, "record.notes", 20_000),
      });
    case "journal":
      return compact({
        sourceId: optionalString(input.sourceId, "record.sourceId", 128),
        body: requireString(input.body, "record.body", 100_000),
        occurredOn: requireIsoDate(input.occurredOn, "record.occurredOn"),
        mood: optionalString(input.mood, "record.mood", 80),
        morningReflection: optionalString(
          input.morningReflection,
          "record.morningReflection",
          20_000,
        ),
        eveningReflection: optionalString(
          input.eveningReflection,
          "record.eveningReflection",
          20_000,
        ),
        newThing: optionalString(input.newThing, "record.newThing", 20_000),
      });
    case "habits":
      return compact({
        habitId: requireString(input.habitId, "record.habitId", 128),
        name: requireString(input.name, "record.name", 240),
        occurredOn: requireIsoDate(input.occurredOn, "record.occurredOn"),
        status: requireEnum(input.status, "record.status", [
          "completed",
          "skipped",
          "planned",
        ] as const),
      });
    case "setline": {
      if (input.recordType === undefined) {
        // Legacy activity summaries: pre-mirror pushes and the record_activity
        // action both write this shape.
        return compact({
          title: requireString(input.title, "record.title", 240),
          occurredOn: requireIsoDate(input.occurredOn, "record.occurredOn"),
          minutes: requireInteger(input.minutes, "record.minutes"),
          notes: optionalString(input.notes, "record.notes", 10_000),
        });
      }
      // Full-fidelity entity envelopes from the mirror runtime. The entity is
      // encoded exactly as the local store encodes it (including its numeric
      // timestamps), so the envelope carries an ISO occurredAt for reads. The
      // payload is kept whole rather than compacted into a summary shape.
      requireEnum(input.recordType, "record.recordType", [
        "template",
        "session",
        "goal",
        "programme",
      ] as const);
      requireString(input.entityId, "record.entityId", 128);
      requireIsoDate(input.occurredAt, "record.occurredAt");
      requireObject(input.data, "record.data");
      return input;
    }
    case "kith": {
      const recordType = requireEnum(input.recordType, "record.recordType", [
        "person",
        "interaction",
      ] as const);
      if (recordType === "person") {
        return compact({
          recordType,
          personId: requireString(input.personId, "record.personId", 128),
          personName: requireString(input.personName, "record.personName", 240),
          circle: requireString(input.circle, "record.circle", 80),
          closeness: requireInteger(input.closeness, "record.closeness", 1, 5),
          hue: requireString(input.hue, "record.hue", 80),
          birthday: optionalIsoDate(input.birthday, "record.birthday"),
          howWeMet: optionalString(input.howWeMet, "record.howWeMet", 20_000),
          standingNotes: optionalString(input.standingNotes, "record.standingNotes", 20_000),
          details: optionalPersonDetails(input.details),
          listItems: optionalPersonListItems(input.listItems),
          createdAt: requireIsoDate(input.createdAt, "record.createdAt"),
        });
      }
      return compact({
        recordType,
        personId: requireString(input.personId, "record.personId", 128),
        personName: requireString(input.personName, "record.personName", 240),
        kind: requireString(input.kind, "record.kind", 80),
        occurredAt: requireIsoDate(input.occurredAt, "record.occurredAt"),
        note: optionalString(input.note, "record.note", 20_000),
        followUpAt: optionalIsoDate(input.followUpAt, "record.followUpAt"),
      });
    }
    case "anchor":
      return validateAnchorRecord(input);
    case "calorie":
      return validateCalorieRecord(input);
  }
}

// Calorie syncs full-fidelity entities through the mirror runtime, so its
// records keep every field the app wrote. The contract still checks the fields
// that identify each entity, then returns the payload intact rather than
// compacting it down to a summary shape.
function validateCalorieRecord(input: Record<string, unknown>): Record<string, unknown> {
  const recordType = requireEnum(input.recordType, "record.recordType", [
    "food",
    "foodEntry",
    "waterEntry",
    "weightEntry",
    "routine",
    "checkIn",
    "profile",
    "goalCycle",
    "dailyNote",
    "cycleContext",
    "theme",
  ] as const);
  switch (recordType) {
    case "food":
      requireString(input.id, "record.id", 128);
      requireString(input.name, "record.name", 240);
      requireString(input.servingName, "record.servingName", 240);
      requireNutrients(input.nutrients);
      break;
    case "foodEntry":
      requireString(input.id, "record.id", 128);
      requireString(input.foodID, "record.foodID", 128);
      requireString(input.foodName, "record.foodName", 240);
      requireEnum(input.meal, "record.meal", [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snack",
      ] as const);
      requireIsoDate(input.timestamp, "record.timestamp");
      requireNumber(input.servings, "record.servings");
      requireNutrients(input.nutrients);
      break;
    case "waterEntry":
      requireString(input.id, "record.id", 128);
      requireIsoDate(input.timestamp, "record.timestamp");
      requireInteger(input.millilitres, "record.millilitres");
      break;
    case "weightEntry":
      requireString(input.id, "record.id", 128);
      requireIsoDate(input.date, "record.date");
      requireNumber(input.kilograms, "record.kilograms");
      break;
    case "routine":
      requireString(input.id, "record.id", 128);
      requireString(input.name, "record.name", 240);
      requireEnum(input.period, "record.period", [
        "Morning",
        "Evening",
        "Either",
      ] as const);
      break;
    case "checkIn":
      requireString(input.id, "record.id", 128);
      requireString(input.routineID, "record.routineID", 128);
      requireIsoDate(input.date, "record.date");
      break;
    case "profile":
      requireString(input.name, "record.name", 240);
      if (input.goal !== undefined) {
        requireEnum(input.goal, "record.goal", [
          "Maintain",
          "Gradual loss",
          "Gradual gain",
        ] as const);
      }
      if (input.activity !== undefined) {
        requireEnum(input.activity, "record.activity", [
          "Light",
          "Moderate",
          "High",
        ] as const);
      }
      break;
    case "goalCycle":
      requireString(input.id, "record.id", 128);
      requireEnum(input.kind, "record.kind", ["cut", "gain", "recomposition"] as const);
      requireString(input.goal, "record.goal", 240);
      requireIsoDate(input.startOn, "record.startOn");
      optionalIsoDate(input.endOn, "record.endOn");
      break;
    case "dailyNote":
      requireString(input.date, "record.date", 16);
      requireString(input.text, "record.text", 8_000);
      break;
    case "cycleContext":
      if (input.enabled !== undefined && typeof input.enabled !== "boolean") {
        throw new HttpError(400, "invalid_request", "record.enabled must be a boolean");
      }
      optionalIsoDate(input.latestPeriodStart, "record.latestPeriodStart");
      break;
    case "theme":
      requireEnum(input.theme, "record.theme", ["System", "Light", "Dark"] as const);
      break;
  }
  return input;
}

// Anchor mirrors its whole SwiftData document through the shared runtime, so
// recordType payloads preserve every field the app wrote. The legacy summary
// shape (no recordType) stays valid for already-deployed clients; both kinds
// validate identity fields and return the payload intact.
function validateAnchorRecord(input: Record<string, unknown>): Record<string, unknown> {
  if (input.recordType === undefined) {
    compact({
      title: requireString(input.title, "record.title", 240),
      startedAt: requireIsoDate(input.startedAt, "record.startedAt"),
      endedAt: optionalIsoDate(input.endedAt, "record.endedAt"),
      durationSeconds: requireInteger(input.durationSeconds, "record.durationSeconds"),
      interruptionCount: requireInteger(
        input.interruptionCount,
        "record.interruptionCount",
      ),
    });
    return input;
  }
  const recordType = requireEnum(input.recordType, "record.recordType", [
    "focusSession",
    "distraction",
    "goal",
    "project",
    "savedTag",
    "machineActivityDay",
    "preferences",
    "behaviorProfile",
    "scheduleTemplate",
    "habitCompletion",
    "dayPlanConfirmation",
    "planBlock",
    "divergenceEvent",
  ] as const);
  requireString(input.id, "record.id", 128);
  switch (recordType) {
    case "focusSession":
      requireIsoDate(input.startedAt, "record.startedAt");
      optionalIsoDate(input.endedAt, "record.endedAt");
      break;
    case "distraction":
      requireIsoDate(input.capturedAt, "record.capturedAt");
      if (input.note !== undefined || input.keywords !== undefined) {
        throw new HttpError(
          400,
          "invalid_request",
          "distraction notes and keywords never leave the device",
        );
      }
      break;
    case "goal":
      requireString(input.title, "record.title", 240);
      break;
    case "project":
      requireString(input.name, "record.name", 240);
      break;
    case "savedTag":
      requireString(input.name, "record.name", 240);
      break;
    case "machineActivityDay":
      requireIsoDate(input.day, "record.day");
      break;
    case "preferences":
      requireEnum(input.appearanceRaw, "record.appearanceRaw", [
        "system",
        "light",
        "dark",
      ] as const);
      break;
    case "behaviorProfile":
      break;
    case "scheduleTemplate":
      requireString(input.title, "record.title", 240);
      break;
    case "habitCompletion":
      requireString(input.habitID, "record.habitID", 128);
      requireIsoDate(input.day, "record.day");
      break;
    case "dayPlanConfirmation":
      requireIsoDate(input.day, "record.day");
      break;
    case "planBlock":
      requireString(input.title, "record.title", 240);
      requireIsoDate(input.plannedStart, "record.plannedStart");
      break;
    case "divergenceEvent":
      requireString(input.blockID, "record.blockID", 128);
      requireIsoDate(input.occurredAt, "record.occurredAt");
      break;
  }
  return input;
}

function requireNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpError(400, "invalid_request", `${label} must be a number`);
  }
  return value;
}

function requireNutrients(value: unknown): void {
  const nutrients = requireObject(value, "record.nutrients");
  requireNumber(nutrients.calories, "record.nutrients.calories");
  requireNumber(nutrients.protein, "record.nutrients.protein");
  requireNumber(nutrients.carbohydrates, "record.nutrients.carbohydrates");
  requireNumber(nutrients.fat, "record.nutrients.fat");
  requireNumber(nutrients.fibre, "record.nutrients.fibre");
}

// Kith emits person detail rows and list items in the order the person
// arranged them, and either may hold an empty string, so they validate by
// type and length rather than requireString's non-empty rule. The arrays get
// no manual cap: the request payload budget bounds the whole record.
function optionalPersonDetails(
  value: unknown,
): Array<{ key: string; value: string }> | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new HttpError(400, "invalid_request", "record.details must be an array");
  }
  return value.map((item, index) => {
    const detail = requireObject(item, `record.details[${index}]`);
    return {
      key: requireStringOrEmpty(detail.key, `record.details[${index}].key`),
      value: requireStringOrEmpty(detail.value, `record.details[${index}].value`),
    };
  });
}

function optionalPersonListItems(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new HttpError(400, "invalid_request", "record.listItems must be an array");
  }
  return value.map((item, index) =>
    requireStringOrEmpty(item, `record.listItems[${index}]`),
  );
}

function requireStringOrEmpty(
  value: unknown,
  label: string,
  maximumLength = 20_000,
): string {
  if (typeof value !== "string") {
    throw new HttpError(400, "invalid_request", `${label} must be a string`);
  }
  if (value.length > maximumLength) {
    throw new HttpError(400, "invalid_request", `${label} is too long`);
  }
  return value;
}

export function parsePushRequest(value: unknown): PushRequest {
  const input = requireObject(value);
  if (!isDomain(input.domain)) {
    throw new HttpError(400, "invalid_domain", "domain is not supported");
  }
  const domain = input.domain;
  const deviceId = requireString(input.deviceId, "deviceId", 128);
  if (!Array.isArray(input.mutations) || input.mutations.length === 0) {
    throw new HttpError(400, "invalid_request", "mutations must be a non-empty array");
  }
  if (input.mutations.length > 100) {
    throw new HttpError(400, "invalid_request", "a push can contain at most 100 mutations");
  }
  const mutations = input.mutations.map((value, index): Mutation => {
    const mutation = requireObject(value, `mutations[${index}]`);
    const operation = requireEnum(mutation.operation, `mutations[${index}].operation`, [
      "upsert",
      "delete",
    ] as const);
    return {
      id: requireString(mutation.id, `mutations[${index}].id`, 128),
      idempotencyKey: requireString(
        mutation.idempotencyKey,
        `mutations[${index}].idempotencyKey`,
        200,
      ),
      operation,
      baseVersion: requireInteger(mutation.baseVersion, `mutations[${index}].baseVersion`),
      occurredAt: requireIsoDate(mutation.occurredAt, `mutations[${index}].occurredAt`),
      record:
        operation === "upsert"
          ? validateDomainRecord(domain, mutation.record)
          : mutation.record,
    };
  });
  return { domain, deviceId, mutations };
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T;
}
