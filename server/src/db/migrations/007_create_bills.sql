CREATE TYPE bill_category AS ENUM (
  'electricity',
  'gas',
  'water',
  'internet',
  'council_tax',
  'insurance',
  'service_charge',
  'maintenance',
  'other'
);

CREATE TYPE bill_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'annually');

CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payee VARCHAR(200) NOT NULL,
  category bill_category NOT NULL DEFAULT 'other',
  amount INTEGER NOT NULL CHECK (amount > 0),
  paid_at DATE NOT NULL,
  due_date DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  frequency bill_frequency,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bills_recurring_frequency CHECK (
    (is_recurring AND frequency IS NOT NULL) OR (NOT is_recurring AND frequency IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS bills_property_id_idx ON bills (property_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS bills_created_by_id_idx ON bills (created_by_id);
