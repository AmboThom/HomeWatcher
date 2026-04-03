CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved');

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id          UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID                 NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id   UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255)         NOT NULL,
  description TEXT                 NOT NULL,
  priority    maintenance_priority NOT NULL,
  status      maintenance_status   NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS maintenance_requests_property_id_idx ON maintenance_requests (property_id);
CREATE INDEX IF NOT EXISTS maintenance_requests_tenant_id_idx ON maintenance_requests (tenant_id);
