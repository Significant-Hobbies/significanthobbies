CREATE TABLE native_auth_handoffs (
  code_hash TEXT PRIMARY KEY NOT NULL,
  session_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX native_auth_handoffs_expiry_idx
  ON native_auth_handoffs(expires_at);

CREATE TABLE native_atlas_state (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
