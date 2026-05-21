import pool from "../services/db.js";
import { getStokOpnameColumns } from "./opname-db-utils.js";

export default async function handler(req, res) {
  try {
    const { bulan, tahun, detail } = req.query;
    const includeDetails = String(detail).toLowerCase() === "true";
    const columns = await getStokOpnameColumns();
    const createdAtSelect = columns.has("created_at") ? "created_at" : "tanggal AS created_at";
    const orderBy = columns.has("created_at") ? "tanggal DESC, created_at DESC" : "tanggal DESC, id DESC";

    const summaryResult = await pool.query(`
      SELECT 
        id,
        tanggal,
        checker,
        lokasi,
        ${createdAtSelect},
        total_item,
        total_selisih
      FROM stok_opname
      WHERE EXTRACT(MONTH FROM tanggal) = $1
      AND EXTRACT(YEAR FROM tanggal) = $2
      ORDER BY ${orderBy}
    `, [bulan, tahun]);

    if (includeDetails) {
      const detailCreatedAt = columns.has("created_at") ? "h.created_at" : "h.tanggal AS created_at";
      const detailsResult = await pool.query(`
        SELECT
          d.opname_id,
          p.nama_produk,
          d.sku,
          d.stok_sistem,
          d.stok_fisik,
          d.selisih,
          d.input_at,
          h.tanggal,
          h.checker,
          h.lokasi,
          ${detailCreatedAt}
        FROM stok_opname_detail d
        JOIN stok_opname h ON d.opname_id = h.id
        LEFT JOIN produk p ON p.sku = d.sku
        WHERE EXTRACT(MONTH FROM h.tanggal) = $1
        AND EXTRACT(YEAR FROM h.tanggal) = $2
        ORDER BY h.tanggal DESC, d.id ASC
      `, [bulan, tahun]);

      res.status(200).json({ summary: summaryResult.rows, details: detailsResult.rows });
      return;
    }

    res.status(200).json(summaryResult.rows);
  } catch (err) {
    console.error("ERROR HISTORY:", err);
    res.status(500).json({ error: err.message });
  }
}
