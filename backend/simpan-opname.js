import pool from "../services/db.js";

export default async function handler(req, res) {
  const client = await pool.connect();
  try {
    const { tanggal, items, checker, lokasi, keterangan } = req.body;

    if (!tanggal || !Array.isArray(items)) {
      return res.status(400).json({ error: "Payload tidak valid" });
    }

    await client.query("BEGIN");

    // 1) HEADER
    const header = await client.query(`
      INSERT INTO stok_opname (tanggal, total_item, total_selisih, checker, lokasi, keterangan)
      VALUES ($1, $2, 0, $3, $4, $5)
      RETURNING id
    `, [tanggal, items.length, checker || null, lokasi || null, keterangan || null]);

    const opnameId = header.rows[0].id;

    let totalSelisih = 0;

    // 2) DETAIL opname fisik saja, tanpa otomatis menyesuaikan stok.
    for (const it of items) {
      const sku = it.sku;
      const sistem = Number(it.sistem || 0);
      const fisik  = Number(it.fisik  || 0);
      const selisih = fisik - sistem;

      totalSelisih += Math.abs(selisih);

      // simpan detail fisik opname
      await client.query(`
        INSERT INTO stok_opname_detail
        (opname_id, sku, stok_sistem, stok_fisik, selisih, input_at)
        VALUES ($1,$2,$3,$4,$5,NOW())
      `, [opnameId, sku, sistem, fisik, selisih]);
    }

    // update total selisih di header
    await client.query(`
      UPDATE stok_opname
      SET total_selisih = $1
      WHERE id = $2
    `, [totalSelisih, opnameId]);

    await client.query("COMMIT");

    res.json({ message: "Opname fisik tersimpan", opname_id: opnameId });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("SIMPAN OPNAME ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}