CREATE TABLE IF NOT EXISTS tenant_properties (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tenant_properties_unique UNIQUE (tenant_id, property_id)
);

CREATE INDEX IF NOT EXISTS tenant_properties_tenant_id_idx ON tenant_properties (tenant_id);
CREATE INDEX IF NOT EXISTS tenant_properties_property_id_idx ON tenant_properties (property_id);
