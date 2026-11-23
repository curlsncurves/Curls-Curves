CREATE TABLE IF NOT EXISTS consultations (
  reference uuid PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  topic text NOT NULL,
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS request_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL CHECK (attempts BETWEEN 1 AND 5),
  expires bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS request_limits_expiry_idx ON request_limits (expires);
CREATE INDEX IF NOT EXISTS consultations_created_at_idx ON consultations (created_at DESC);
