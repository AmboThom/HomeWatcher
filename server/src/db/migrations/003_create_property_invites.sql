CREATE TABLE IF NOT EXISTS property_invites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  code        VARCHAR(9)  NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  max_uses    INT         NOT NULL,
  uses_count  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS property_invites_code_idx ON property_invites (code);
CREATE INDEX IF NOT EXISTS property_invites_property_id_idx ON property_invites (property_id);
