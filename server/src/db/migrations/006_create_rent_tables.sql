CREATE TABLE IF NOT EXISTS rent_assignments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER     NOT NULL CHECK (amount > 0),
  due_day     INTEGER     NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT rent_assignments_unique UNIQUE (property_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS rent_assignments_property_id_idx ON rent_assignments (property_id);
CREATE INDEX IF NOT EXISTS rent_assignments_tenant_id_idx ON rent_assignments (tenant_id);

CREATE TABLE IF NOT EXISTS rent_payments (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id  UUID        NOT NULL REFERENCES rent_assignments(id) ON DELETE CASCADE,
  amount         INTEGER     NOT NULL CHECK (amount > 0),
  paid_at        TIMESTAMPTZ NOT NULL,
  notes          TEXT,
  recorded_by_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rent_payments_assignment_id_idx ON rent_payments (assignment_id);
