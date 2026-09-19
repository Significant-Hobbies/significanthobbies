-- Issue #158: Calorie joins the shared sync plane as a first-class domain.
-- Same record-table shape as the other domain tables; payloads carry
-- full-fidelity CalorieCore entities stamped with a recordType discriminator.
-- Calorie's own Worker and D1 remain the read authority through the typed
-- connector until its data migrates (tracked in #158).

CREATE TABLE calorie_records (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL CHECK (version > 0),
  origin_device_id TEXT NOT NULL,
  sync_token TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX calorie_records_freshness ON calorie_records(user_id, updated_at DESC);
