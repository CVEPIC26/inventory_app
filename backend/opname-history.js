import pool from "../services/db.js";

export default async function handler(req, res) {
  try {

    const { bulan, tahun, detail } = req.query;
    const includeDetails = String(detail).toLowerCase() === 'true';

    const summaryResult = await pool.query(`
      SELECT 
        id,
        tanggal,
        checker,
        lokasi,
        created_at,
        total_item,
        total_selisih
      FROM stok_opname
      WHERE EXTRACT(MONTH FROM tanggal) = $1
      AND EXTRACT(YEAR FROM tanggal) = $2
      ORDER BY tanggal DESC
    `, [bulan, tahun]);

    if (includeDetails) {
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
          h.created_at
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