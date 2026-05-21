import pool from "../services/db.js";

let cachedColumns = null;

export async function getStokOpnameColumns() {
  if (cachedColumns) return cachedColumns;

  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'stok_opname'
      AND column_name = ANY($1::text[])
  `, [["created_at", "updated_at", "total_item_selisih", "total_selisih_net"]]);

  cachedColumns = new Set(result.rows.map((row) => row.column_name));
  return cachedColumns;
}

export function clearStokOpnameColumnsCache() {
  cachedColumns = null;
}
