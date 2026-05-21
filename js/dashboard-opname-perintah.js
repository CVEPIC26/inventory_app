// Perintah SO, Hasil SO, dan barcode bulk DOC

const PERINTAH_STATUS_LABEL = {
  menunggu: { text: 'Menunggu', className: 'status-wait' },
  proses: { text: 'Proses', className: 'status-process' },
  selesai: { text: 'Selesai', className: 'status-done' }
};

function initPerintahFormDefaults() {
  const tanggalInput = document.getElementById('perintahTanggal');
  if (tanggalInput && !tanggalInput.value) {
    const { startDate } = getOpnameRange();
    tanggalInput.value = startDate;
  }
}

async function loadPerintahList() {
  try {
    const { bulan, tahun } = getOpnameRange();
    const qs = new URLSearchParams({ bulan, tahun });
    state.perintahList = toArray(await fetchJson(`/api/opname-perintah?${qs.toString()}`));
    renderPerintahRecentList();
    renderHasilSoList();
  } catch (error) {
    console.error('Load perintah error:', error);
    showToast(error.message || 'Gagal memuat perintah SO', false);
  }
}

function renderPerintahRecentList() {
  const container = document.getElementById('perintahRecentList');
  if (!container) return;

  if (!state.perintahList.length) {
    container.innerHTML = '<p class="opname-help-text">Belum ada perintah pada periode ini.</p>';
    return;
  }

  container.innerHTML = `
    <h4 class="top-space">Perintah Periode Ini</h4>
    <div class="hasil-so-grid">
      ${state.perintahList.slice(0, 8).map(item => renderSoCard(item, 'perintah')).join('')}
    </div>
  `;
}

function renderHasilSoList() {
  const container = document.getElementById('hasilSoList');
  if (!container) return;

  if (!state.perintahList.length) {
    container.innerHTML = `
      <div class="opname-empty-state">
        <p>Belum ada perintah SO. SVP membuat perintah di tab <strong>Perintah SO</strong> terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.perintahList.map(item => renderSoCard(item, 'hasil')).join('');
  if (window.lucide) lucide.createIcons();
}

function renderSoCard(item, mode) {
  const status = PERINTAH_STATUS_LABEL[item.status] || PERINTAH_STATUS_LABEL.menunggu;
  const actionLabel = item.status === 'selesai'
    ? 'Lihat Hasil'
    : (item.status === 'proses' ? 'Lanjut Scan' : 'Mulai Scan');
  const clickHandler = mode === 'hasil'
    ? `onclick="handleHasilSoClick(${item.id})"`
    : '';

  return `
    <div class="hasil-so-card ${status.className}" ${clickHandler}>
      <div class="hasil-so-card__head">
        <strong>${escapeHtml(item.kode_so)}</strong>
        <span class="opname-pill ${status.className}">${status.text}</span>
      </div>
      <p class="hasil-so-card__meta">${formatDate(item.tanggal_perintah)} · SVP: ${escapeHtml(item.svp_nama || '-')}</p>
      <p class="hasil-so-card__meta">${escapeHtml(item.lokasi || 'Lokasi belum diisi')}</p>
      ${item.status === 'selesai'
        ? `<p class="hasil-so-card__stat">Item: ${formatNumber(item.total_item || 0)} · Selisih: ${formatNumber(item.total_selisih || 0)}</p>`
        : `<p class="hasil-so-card__action">${actionLabel} →</p>`
      }
    </div>
  `;
}

async function buatPerintahOpname() {
  const kodeSo = document.getElementById('perintahKodeSo')?.value?.trim();
  const tanggal = document.getElementById('perintahTanggal')?.value;
  const svpNama = document.getElementById('perintahSvpNama')?.value?.trim();
  const lokasi = document.getElementById('perintahLokasi')?.value?.trim();
  const keterangan = document.getElementById('perintahKeterangan')?.value?.trim();

  if (!kodeSo || !tanggal || !svpNama) {
    showToast('Kode SO, tanggal, dan nama SVP wajib diisi', false);
    return;
  }

  const { bulan, tahun } = getOpnameRange();
  showLoader();
  try {
    const data = await fetchJson('/api/opname-perintah', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kode_so: kodeSo,
        tanggal_perintah: tanggal,
        bulan,
        tahun,
        svp_nama: svpNama,
        lokasi,
        keterangan
      })
    });

    showToast(data.message || 'Perintah SO dibuat');
    document.getElementById('perintahKodeSo').value = '';
    document.getElementById('perintahKeterangan').value = '';
    await loadPerintahList();
    showOpnameTab(null, 'opnameHasil');
  } catch (error) {
    console.error('Buat perintah error:', error);
    showToast(error.message || 'Gagal membuat perintah SO', false);
  } finally {
    hideLoader();
  }
}

async function handleHasilSoClick(perintahId) {
  const perintah = state.perintahList.find(item => item.id === perintahId);
  if (!perintah) return;

  if (perintah.status === 'selesai' && perintah.opname_id) {
    await showHasilSoDetail(perintah);
    return;
  }

  await activatePerintahForScan(perintah);
}

async function activatePerintahForScan(perintah, options = {}) {
  showLoader();
  try {
    let active = perintah;
    if (perintah.status === 'menunggu') {
      active = await fetchJson('/api/opname-perintah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          perintah_id: perintah.id,
          checker: document.getElementById('opnameChecker')?.value?.trim() || null
        })
      });
    }

    state.activePerintah = active;
    updateOpnameInputVisibility();

    const checkerEl = document.getElementById('opnameChecker');
    const gudangEl = document.getElementById('opnameGudang');
    if (checkerEl && !checkerEl.value) checkerEl.value = active.checker || '';
    if (gudangEl) gudangEl.value = active.lokasi || '';

    if (!options.skipLoad) {
      await loadStokSistem();
    }

    if (!options.skipTab) {
      showOpnameTab(null, 'opnameInput');
    }

    showToast(`Perintah ${active.kode_so} aktif. Silakan scan barang.`);
    await loadPerintahList();
  } catch (error) {
    console.error('Activate perintah error:', error);
    showToast(error.message || 'Gagal mengaktifkan perintah SO', false);
  } finally {
    hideLoader();
  }
}

function updateOpnameInputVisibility() {
  const locked = document.getElementById('opnameInputLocked');
  const active = document.getElementById('opnameInputActive');
  const hasPerintah = Boolean(state.activePerintah?.id);

  if (locked) locked.style.display = hasPerintah ? 'none' : 'flex';
  if (active) active.style.display = hasPerintah ? 'block' : 'none';

  setText('activeSoKode', state.activePerintah?.kode_so || '-');
  const meta = state.activePerintah
    ? `SVP: ${state.activePerintah.svp_nama || '-'} · ${formatDate(state.activePerintah.tanggal_perintah)} · ${state.activePerintah.lokasi || '-'}`
    : '';
  setText('activeSoMeta', meta);
}

function clearActivePerintah() {
  stopOpnameScanner();
  state.activePerintah = null;
  state.opnameScan = {};
  updateOpnameInputVisibility();
  updateOpnameScanSummary();
  refreshOpnameMetrics();
  showToast('Perintah SO ditutup');
}

async function showHasilSoDetail(perintah) {
  showLoader();
  try {
    let details = [];
    if (perintah.opname_id) {
      const data = await fetchJson(`/api/opname-export?opname_id=${perintah.opname_id}`);
      details = data.details || [];
      window._currentHasilData = {
        header: { ...data.header, kode_so: perintah.kode_so, svp_nama: perintah.svp_nama },
        details,
        kode_so: perintah.kode_so
      };
    } else {
      window._currentHasilData = { header: perintah, details: [], kode_so: perintah.kode_so };
    }

    const { header } = window._currentHasilData;
    document.getElementById('hasilDetailKode').textContent = perintah.kode_so;
    document.getElementById('hasilDetailDate').textContent = formatDate(header.tanggal || perintah.tanggal_perintah);
    document.getElementById('hasilDetailSvp').textContent = escapeHtml(perintah.svp_nama || '-');
    document.getElementById('hasilDetailChecker').textContent = escapeHtml(header.checker || perintah.checker || '-');
    document.getElementById('hasilDetailLokasi').textContent = escapeHtml(header.lokasi || perintah.lokasi || '-');

    const hasVariance = Number(header.total_item_selisih ?? header.total_selisih ?? 0) > 0;
    const badge = document.getElementById('hasilDetailStatusBadge');
    if (badge) {
      badge.textContent = hasVariance ? 'Ada Selisih' : 'Seimbang';
      badge.className = `opname-pill ${hasVariance ? 'status-wait' : 'status-done'}`;
    }

    const tbody = document.getElementById('hasilDetailBody');
    tbody.innerHTML = details.length
      ? details.map(d => `
        <tr>
          <td>${escapeHtml(d.sku)}</td>
          <td>${escapeHtml(d.nama_produk || '-')}</td>
          <td style="text-align:right">${formatNumber(d.stok_sistem)}</td>
          <td style="text-align:right">${formatNumber(d.stok_fisik)}</td>
          <td style="text-align:right">${formatNumber(d.selisih)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5">Belum ada detail hasil.</td></tr>';

    const scanBtn = document.getElementById('hasilMulaiScanBtn');
    if (scanBtn) scanBtn.style.display = perintah.status === 'selesai' ? 'none' : 'inline-flex';

    document.getElementById('opnameHasilList').style.display = 'none';
    document.getElementById('opnameHasilDetail').style.display = 'block';
  } catch (error) {
    console.error('Detail hasil SO error:', error);
    showToast(error.message || 'Gagal memuat detail hasil', false);
  } finally {
    hideLoader();
  }
}

function goBackHasilSoList() {
  document.getElementById('opnameHasilDetail').style.display = 'none';
  document.getElementById('opnameHasilList').style.display = 'block';
  window._currentHasilData = null;
}

function mulaiScanDariHasil() {
  const perintah = state.perintahList.find(item => item.kode_so === window._currentHasilData?.kode_so)
    || state.perintahList.find(item => item.id === state.activePerintah?.id);
  if (perintah) {
    goBackHasilSoList();
    activatePerintahForScan(perintah);
  }
}

function exportHasilSOcsv() {
  if (!window._currentHasilData?.details?.length) {
    showToast('Tidak ada data untuk diekspor', false);
    return;
  }
  const { header, details, kode_so } = window._currentHasilData;
  downloadCsv(
    `${kode_so}_hasil.csv`,
    ['Tanggal', 'SVP', 'PIC', 'Lokasi', 'SKU', 'Produk', 'Qty Sistem', 'Qty Fisik', 'Selisih'],
    details.map(d => [
      formatDate(header.tanggal || header.tanggal_perintah),
      header.svp_nama || '',
      header.checker || '',
      header.lokasi || '',
      d.sku,
      d.nama_produk || '',
      d.stok_sistem,
      d.stok_fisik,
      d.selisih
    ])
  );
}

function guardOpnameScanTab() {
  if (!state.activePerintah?.id) {
    updateOpnameInputVisibility();
    return false;
  }
  updateOpnameInputVisibility();
  return true;
}

// --- Barcode bulk DOC (A5, 3 kolom x 10 baris, label 5cm x 2cm) ---

function buildBarcodeImgDataUrl(value) {
  if (!window.JsBarcode) return '';

  const canvas = document.createElement('canvas');
  try {
    JsBarcode(canvas, String(value), {
      format: 'CODE128',
      displayValue: false,
      width: 2,
      height: 55,
      margin: 4,
      background: '#ffffff',
      lineColor: '#000000'
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.warn('Barcode generate failed:', value, error);
    return '';
  }
}

function buildBarcodeDocHtml(produkList) {
  const labelsPerPage = 30;
  const pages = [];
  for (let i = 0; i < produkList.length; i += labelsPerPage) {
    pages.push(produkList.slice(i, i + labelsPerPage));
  }
  if (!pages.length) pages.push([]);

  const pageHtml = pages.map(pageItems => {
    const cells = [];
    for (let i = 0; i < labelsPerPage; i += 1) {
      const p = pageItems[i];
      if (!p) {
        cells.push('<td class="label-cell label-cell--empty"></td>');
        continue;
      }
      const imgSrc = buildBarcodeImgDataUrl(p.sku);
      const barcodeHtml = imgSrc
        ? `<img src="${imgSrc}" alt="${escapeHtml(p.sku)}" class="label-barcode-img" />`
        : `<div class="label-barcode-fallback">${escapeHtml(p.sku)}</div>`;
      cells.push(`
        <td class="label-cell">
          <div class="label-name">${escapeHtml(p.nama_produk)}</div>
          <div class="label-barcode">${barcodeHtml}</div>
          <div class="label-code">${escapeHtml(p.sku)}</div>
        </td>
      `);
    }
    const rows = [];
    for (let r = 0; r < 10; r += 1) {
      rows.push(`<tr>${cells.slice(r * 3, r * 3 + 3).join('')}</tr>`);
    }
    return `<table class="label-sheet"><tbody>${rows.join('')}</tbody></table><div class="page-break"></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>Barcode Produk</title>
<style>
@page Section1 {
  size: 148mm 210mm;
  margin: 8mm 6mm;
}
div.Section1 { page: Section1; }
body { font-family: Arial, sans-serif; margin: 0; color: #000; }
.label-sheet { width: 100%; border-collapse: collapse; table-layout: fixed; }
.label-cell {
  width: 50mm;
  height: 20mm;
  border: 1px solid #ccc;
  text-align: center;
  vertical-align: middle;
  padding: 1mm 1mm;
  overflow: hidden;
  color: #000;
}
.label-cell--empty { border-color: #f5f5f5; }
.label-name {
  font-size: 7pt;
  font-weight: bold;
  line-height: 1.1;
  max-height: 5mm;
  overflow: hidden;
  margin-bottom: 0.5mm;
  color: #000;
}
.label-barcode {
  height: 9mm;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.label-barcode-img {
  width: 46mm;
  max-width: 100%;
  height: 9mm;
  object-fit: contain;
}
.label-barcode-fallback {
  font-size: 8pt;
  font-weight: bold;
  color: #000;
}
.label-code {
  font-size: 7pt;
  font-weight: bold;
  margin-top: 0.5mm;
  color: #000;
}
.page-break { page-break-after: always; height: 0; }
</style>
</head>
<body><div class="Section1">${pageHtml}</div></body>
</html>`;
}

async function downloadAllBarcodeDoc() {
  showLoader();
  try {
    const produkList = state.produkOptions.length
      ? state.produkOptions
      : toArray(await fetchJson('/api/produk-list'));
    if (!produkList.length) {
      showToast('Tidak ada produk untuk digenerate', false);
      return;
    }
    const html = buildBarcodeDocHtml(produkList);
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcode_semua_produk_${getTahun()}_${getBulan()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`DOC barcode ${produkList.length} produk diunduh`);
  } catch (error) {
    console.error('Download barcode doc error:', error);
    showToast(error.message || 'Gagal membuat dokumen barcode', false);
  } finally {
    hideLoader();
  }
}

async function previewAllBarcodeDoc() {
  showLoader();
  try {
    const produkList = state.produkOptions.length
      ? state.produkOptions
      : toArray(await fetchJson('/api/produk-list'));
    const preview = document.getElementById('barcodeDocPreview');
    if (!preview) return;
    const blob = new Blob([buildBarcodeDocHtml(produkList)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    preview.innerHTML = `<iframe style="width:100%;height:480px;border:1px solid #eed8cc;border-radius:12px;" src="${url}"></iframe>`;
    showToast('Preview barcode ditampilkan');
  } catch (error) {
    showToast(error.message || 'Gagal preview barcode', false);
  } finally {
    hideLoader();
  }
}
