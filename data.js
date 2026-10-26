/* =====================================================
   data.js : data contoh + fungsi bantu yang dipakai bersama
   (menggantikan database selama belum ada backend)
   ===================================================== */

// Tempat semua fungsi inisialisasi halaman (diisi oleh konten.js, form.js, app.js)
window.PageInit = {};

// Tabel "barang" (contoh)
window.BARANG = [
  { id: 'BRG-001', nama: 'Proyektor Epson EB-X06',    kategori: 'Elektronik',  lokasi: 'Gudang Sarpras Lt.1', total: 6,  tersedia: 4, kondisi: 'Baik' },
  { id: 'BRG-002', nama: 'Laptop Asus Vivobook 14',   kategori: 'Elektronik',  lokasi: 'Gudang Sarpras Lt.1', total: 10, tersedia: 7, kondisi: 'Baik' },
  { id: 'BRG-003', nama: 'Kamera Mirrorless Sony A6000', kategori: 'Multimedia', lokasi: 'Studio Multimedia',  total: 3,  tersedia: 1, kondisi: 'Baik' },
  { id: 'BRG-004', nama: 'Tripod Kamera',             kategori: 'Multimedia',  lokasi: 'Studio Multimedia',   total: 5,  tersedia: 5, kondisi: 'Baik' },
  { id: 'BRG-005', nama: 'Microphone Wireless Shure', kategori: 'Multimedia',  lokasi: 'Studio Multimedia',   total: 4,  tersedia: 0, kondisi: 'Baik' },
  { id: 'BRG-006', nama: 'Kabel HDMI 10 meter',       kategori: 'Aksesoris',   lokasi: 'Gudang Sarpras Lt.1', total: 12, tersedia: 9, kondisi: 'Baik' },
  { id: 'BRG-007', nama: 'Terminal Kabel (Roll)',     kategori: 'Aksesoris',   lokasi: 'Gudang Sarpras Lt.1', total: 15, tersedia: 12, kondisi: 'Baik' },
  { id: 'BRG-008', nama: 'Multimeter Digital',        kategori: 'Alat Praktikum', lokasi: 'Lab Teknik',       total: 8,  tersedia: 3, kondisi: 'Baik' },
  { id: 'BRG-009', nama: 'Solder Station',            kategori: 'Alat Praktikum', lokasi: 'Lab Teknik',       total: 6,  tersedia: 2, kondisi: 'Baik' },
  { id: 'BRG-010', nama: 'Layar Proyektor Portabel',  kategori: 'Elektronik',  lokasi: 'Gudang Sarpras Lt.2', total: 4,  tersedia: 4, kondisi: 'Baik' },
  { id: 'BRG-011', nama: 'Speaker Portabel',          kategori: 'Elektronik',  lokasi: 'Gudang Sarpras Lt.2', total: 5,  tersedia: 1, kondisi: 'Baik' },
  { id: 'BRG-012', nama: 'Kursi Lipat (Paket 10)',    kategori: 'Perlengkapan Acara', lokasi: 'Gudang Sarpras Lt.2', total: 6, tersedia: 6, kondisi: 'Baik' }
];

window.PRODI = [
  'D3 Teknik Informatika',
  'D3 Akuntansi',
  'D4 Manajemen Bisnis',
  'D3 Perhotelan',
  'D4 Teknik Mesin',
  'D3 Administrasi Perkantoran',
  'Lainnya'
];

window.STORAGE_KEY = 'sipebar_peminjaman';

/* ---------- Penyimpanan pengajuan (localStorage) ---------- */
window.getPeminjaman = function () {
  try {
    return JSON.parse(localStorage.getItem(window.STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
};

window.simpanPeminjaman = function (list) {
  try {
    localStorage.setItem(window.STORAGE_KEY, JSON.stringify(list));
  } catch (e) { /* abaikan jika storage diblokir */ }
};

/* ---------- Stok & status ---------- */
// Stok efektif = stok tersedia - jumlah yang sedang berstatus "Menunggu"
window.getStok = function (id) {
  const b = window.BARANG.find(function (x) { return x.id === id; });
  if (!b) return 0;
  const dipesan = window.getPeminjaman()
    .filter(function (p) { return p.idBarang === id && p.status === 'Menunggu'; })
    .reduce(function (sum, p) { return sum + p.jumlah; }, 0);
  return Math.max(0, b.tersedia - dipesan);
};

window.statusStok = function (id) {
  const b = window.BARANG.find(function (x) { return x.id === id; });
  const s = window.getStok(id);
  if (!b || s === 0) return { label: 'Habis', cls: 'bad' };
  if (s / b.total <= 0.34) return { label: 'Terbatas', cls: 'warn' };
  return { label: 'Tersedia', cls: 'ok' };
};

/* ---------- Utilitas ---------- */
window.esc = function (s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

// Date -> "YYYY-MM-DD" (waktu lokal)
window.isoDate = function (d) {
  const z = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
};

window.formatTanggal = function (iso) {
  if (!iso) return '-';
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const p = iso.split('-');
  return parseInt(p[2], 10) + ' ' + bulan[parseInt(p[1], 10) - 1] + ' ' + p[0];
};
