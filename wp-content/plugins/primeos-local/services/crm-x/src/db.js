const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Every query in this service goes through this function.
// It sets the RLS tenant context inside the SAME transaction as the
// actual query, so it is structurally impossible to run a tenant-scoped
// query without the Postgres RLS policy also being in force.
async function tenantQuery(tenantId, text, params = []) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId]);
    const result = await client.query(text, params);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, tenantQuery };
