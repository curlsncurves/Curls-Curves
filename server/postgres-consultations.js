const insert = `
  WITH expired AS (
    DELETE FROM request_limits WHERE expires <= $4 AND key <> $1
  ),
  reserved AS (
    INSERT INTO request_limits (key, attempts, expires) VALUES ($1, 1, $2)
    ON CONFLICT (key) DO UPDATE SET attempts = request_limits.attempts + 1
      WHERE request_limits.attempts < 5
    RETURNING key
  )
  INSERT INTO consultations (reference, name, phone, topic, email, created_at)
  SELECT $3::uuid, $5, $6, $7, $8, to_timestamp($4::double precision / 1000)
  FROM reserved
  RETURNING reference
`;

export function postgresStore(query) {
  return async ({ reference, name, phone, topic, email, now, expires, key }) => {
    const rows = await query(insert, [key, expires, reference, now, name, phone, topic, email]);
    return rows.length === 1;
  };
}
