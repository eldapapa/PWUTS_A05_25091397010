# SIPEBAR - Sistem Peminjaman Barang Fakultas Vokasi

Tugas Mandiri Mahasiswa: layout responsif dengan navigasi Ajax, halaman konten interaktif, dan halaman form dengan validasi JavaScript/jQuery.

**Topik proposal:** Website tata kelola peminjaman barang di Fakultas Vokasi.

---

## 1. Ringkasan Pengerjaan

| Ketentuan tugas | Yang dikerjakan | File |
|---|---|---|
| Homepage layout responsif + navigasi Ajax | Header, menu, dan footer tetap; isi halaman berganti lewat `$.ajax` tanpa reload | `index.html`, `style.css`, `app.js`, `beranda.html` |
| Halaman konten interaktif (simulasi) | **Daftar Barang** dengan pencarian, filter kategori/status, dan **simulasi cek ketersediaan** | `konten.html`, `konten.js` |
| Halaman form + validasi JS/jQuery | **Form Peminjaman Barang** dengan 10 aturan validasi sebelum submit | `form.html`, `form.js` |
| Dokumentasi tambahan | Dokumen ini | `README.md` |

---

## 2. Cara Menjalankan

Ajax (`$.ajax`) tidak berjalan jika `index.html` dibuka langsung lewat `file://`. Jalankan lewat server lokal:

```bash
# Python 3
python -m http.server 8000
# lalu buka http://localhost:8000
```

Alternatif: ekstensi **Live Server** di VS Code (klik kanan `index.html` > *Open with Live Server*), atau XAMPP (taruh folder di `htdocs`).

Koneksi internet diperlukan hanya untuk memuat jQuery dari CDN.

---

## 3. Struktur Folder

```
sipebar-vokasi/
├── index.html      Layout utama (header, nav, footer, wadah #content)
├── beranda.html    Fragmen halaman beranda (dimuat via Ajax)
├── konten.html     Fragmen halaman Daftar Barang (dimuat via Ajax)
├── form.html       Fragmen halaman Form Peminjaman (dimuat via Ajax)
├── style.css       Gaya & responsif (mobile first)
├── data.js         Data contoh barang + fungsi bantu bersama
├── app.js          Navigasi Ajax + halaman beranda
├── konten.js       Logika filter & simulasi (halaman konten)
├── form.js         Validasi & simpan pengajuan (halaman form)
└── README.md
```

---

## 4. Rancangan Database (Asumsi)

Disesuaikan dengan proposal. Jika struktur di proposalmu berbeda, ubah `data.js` dan field di `form.html`/`form.js`.

**barang**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id_barang | VARCHAR(10), PK | Contoh: BRG-001 |
| nama_barang | VARCHAR(100) | |
| kategori | VARCHAR(50) | Elektronik, Multimedia, dll. |
| lokasi | VARCHAR(50) | Tempat penyimpanan |
| jumlah_total | INT | |
| jumlah_tersedia | INT | |
| kondisi | VARCHAR(20) | |

**peminjam**

| Kolom | Tipe | Keterangan |
|---|---|---|
| nim_nip | VARCHAR(18), PK | |
| nama | VARCHAR(60) | |
| prodi | VARCHAR(50) | |
| no_hp | VARCHAR(13) | |

**peminjaman**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id_peminjaman | VARCHAR(10), PK | Contoh: PMJ-123456 |
| nim_nip | VARCHAR(18), FK | Ke `peminjam` |
| id_barang | VARCHAR(10), FK | Ke `barang` |
| jumlah | INT | |
| tgl_pinjam | DATE | |
| tgl_kembali | DATE | |
| keperluan | VARCHAR(200) | |
| status | ENUM | Menunggu, Disetujui, Dipinjam, Dikembalikan, Ditolak |

Karena belum ada backend, data barang disimpan di `data.js` dan pengajuan disimpan di `localStorage` browser sebagai simulasi.

---

## 5. Penjelasan Fitur

### 5.1 Navigasi Ajax (`app.js`)
1. Menu memakai link hash (`#beranda`, `#inventaris`, `#form`).
2. Saat hash berubah, fungsi `loadPage()` memanggil `$.ajax` untuk mengambil fragmen HTML (`beranda.html`, `konten.html`, atau `form.html`).
3. Hasilnya dimasukkan ke `<main id="content">`, sehingga header dan footer tidak ikut dimuat ulang.
4. Setelah konten masuk, fungsi inisialisasi halaman (`PageInit.inventaris`, `PageInit.form`, dll.) dipanggil untuk memasang event.
5. Tombol Back/Forward browser dan refresh tetap bekerja karena posisi halaman disimpan di hash.
6. Bila Ajax gagal, muncul pesan error yang menjelaskan cara menjalankan server lokal.

### 5.2 Halaman Konten Interaktif (`konten.js`)
- **Pencarian** nama atau ID barang secara langsung saat mengetik.
- **Filter** kategori dan status stok (Tersedia / Terbatas / Habis).
- **Kartu barang** dengan bar stok berwarna. Tombol *Ajukan Pinjam* membawa barang terpilih ke halaman form lewat Ajax.
- **Simulasi cek ketersediaan:** pilih barang, jumlah, dan lama pinjam; sistem menampilkan apakah bisa dipinjam dan perkiraan tanggal kembali.

### 5.3 Halaman Form dan Validasi (`form.js`)

| Kolom | Aturan validasi |
|---|---|
| NIM/NIP | Wajib, hanya angka, 10-18 digit |
| Nama | Wajib, minimal 3 karakter, hanya huruf dan tanda baca umum |
| Program studi | Wajib dipilih |
| No. HP | Wajib, hanya angka, diawali `08`, 10-13 digit |
| Barang | Wajib dipilih, stok tidak boleh habis |
| Jumlah | Wajib, bilangan bulat >= 1, tidak melebihi stok |
| Tanggal pinjam | Wajib, tidak boleh sebelum hari ini |
| Tanggal kembali | Wajib, tidak sebelum tanggal pinjam, maksimal 7 hari |
| Keperluan | Wajib, minimal 10 karakter, ada penghitung karakter |
| Persetujuan | Checkbox wajib dicentang |

Perilaku validasi:
- Kolom dicek saat ditinggalkan (`focusout`). Jika sudah salah, dicek ulang secara langsung saat diperbaiki.
- Saat submit, `e.preventDefault()` menahan pengiriman. Jika ada yang salah, fokus pindah ke kolom pertama yang salah dan muncul pesan di bawah kolom tersebut.
- Jika valid, pengajuan disimpan (simulasi), stok barang berkurang, dan riwayat diperbarui.
- Teks dari pengguna di-escape sebelum ditampilkan untuk mencegah XSS.

---

## 6. Pengembangan Lanjutan

- Ganti penyimpanan `localStorage` dengan request ke server: pada `form.js`, ganti bagian simpan dengan `$.post('api/peminjaman.php', data)`.
- Muat data barang dari database dengan `$.getJSON('api/barang.php')`.
- Tambah halaman admin untuk menyetujui atau menolak pengajuan.
- Validasi di sisi server tetap wajib, karena validasi JavaScript mudah dilewati.

---

## 7. Teknologi

HTML5, CSS3 (Grid & Flexbox), JavaScript, jQuery 3.7.1 (CDN).
