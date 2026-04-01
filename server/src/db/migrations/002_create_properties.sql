CREATE TABLE IF NOT EXISTS properties (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  address     TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS properties_landlord_id_idx ON properties (landlord_id);
