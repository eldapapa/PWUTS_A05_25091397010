# Website Tata Kelola Peminjaman Barang Fakultas Vokasi

Website untuk mengelola peminjaman barang (proyektor, laptop, kamera, dan sejenisnya) di Fakultas Vokasi. Repositori ini saat ini memuat **Item 2.c: Halaman Form Transaksi dan Validasi**, yaitu formulir pengajuan peminjaman dengan validasi sisi klien menggunakan jQuery.

## Cakupan Item 2.c

| Persyaratan | Pemenuhan |
|---|---|
| Minimal 1 halaman HTML berisi formulir transaksi | `form-peminjaman.html` berisi formulir pengajuan peminjaman barang |
| Sistem validasi JavaScript/jQuery sebelum data dikirim ke server HTTP | Validasi dijalankan pada event `submit`. Jika ada isian yang salah, pengiriman dibatalkan |
| Menjadi bagian dari layout web utama | Header, navigasi, dan footer ada di halaman yang sama dan ditandai komentar `LAYOUT UTAMA` |

## Fitur

- Nomor peminjaman dibuat otomatis (format `PJM-TTTTBBHH-jjmmdd`).
- Pilihan barang menampilkan stok tersedia, dan jumlah pinjam dibatasi sesuai stok.
- Panel ringkasan diperbarui langsung: barang, jumlah, stok, dan lama pinjam.
- Validasi per kolom saat pengguna berpindah kolom, ditambah validasi menyeluruh saat tombol ajukan ditekan.
- Pesan error ditampilkan di bawah kolom terkait, dan daftar ringkasannya muncul di atas form.
- Tampilan responsif dan fokus keyboard terlihat jelas.

## Aturan validasi

| Kolom | Aturan |
|---|---|
| Status peminjam | Wajib dipilih |
| Nama lengkap | Wajib, minimal 3 karakter, hanya huruf, spasi, titik, apostrof, dan tanda hubung |
| NIM / NIP | Wajib, hanya angka, 8 sampai 18 digit |
| Program studi / unit | Wajib |
| Email | Wajib, format email valid |
| No. HP | Wajib, nomor Indonesia valid (contoh: `081234567890`) |
| Barang | Wajib dipilih |
| Jumlah | Wajib, bilangan bulat minimal 1, tidak melebihi stok |
| Tanggal pinjam | Wajib, tidak boleh sebelum hari ini |
| Tanggal kembali | Wajib, tidak boleh sebelum tanggal pinjam, maksimal 7 hari dari tanggal pinjam |
| Keperluan | Wajib, minimal 10 karakter, maksimal 200 karakter |
| Pernyataan tanggung jawab | Wajib dicentang |

## Struktur berkas

```
.
├── form-peminjaman.html   # Halaman Item 2.c (HTML, CSS, dan JavaScript dalam satu berkas)
└── README.md
```

Tautan navigasi di header (`index.html`, `daftar-barang.html`, `riwayat.html`) masih berupa placeholder dan belum dibuat.

## Cara menjalankan

1. Unduh `form-peminjaman.html`.
2. Buka langsung di browser, atau jalankan lewat server lokal, misalnya:
   ```bash
   python3 -m http.server 8000
   ```
   lalu buka `http://localhost:8000/form-peminjaman.html`.

Halaman memuat jQuery 3.7.1 dari cdnjs dan font Public Sans dari Google Fonts, sehingga memerlukan koneksi internet. Tanpa koneksi, font akan memakai font bawaan sistem. jQuery perlu diunduh dan disajikan secara lokal agar validasi tetap berjalan.

## Integrasi dengan server

Saat semua isian valid, form dikirim dengan metode `POST` ke:

```
proses_peminjaman.php
```

Ubah atribut `action` pada tag `<form id="formPinjam">` agar sesuai dengan endpoint yang digunakan. Berikut nama kolom yang dikirim:

`no_peminjaman`, `status_peminjam`, `nama`, `nomor_induk`, `prodi`, `email`, `telepon`, `barang`, `jumlah`, `tgl_pinjam`, `tgl_kembali`, `keperluan`, `setuju`, `durasi`

**Catatan penting:** validasi di browser hanya memperbaiki pengalaman pengguna dan bisa dilewati. Server tetap harus memeriksa ulang semua data, terutama ketersediaan stok, rentang tanggal, dan format input, sebelum menyimpannya ke basis data. Nomor peminjaman yang dibuat di browser sebaiknya diganti dengan nomor dari server.

## Kustomisasi

- **Daftar barang dan stok:** ubah elemen `<option>` pada `<select id="barang">` (atribut `data-stok`). Sebaiknya diisi dari tabel barang di basis data.
- **Batas lama pinjam:** ubah konstanta `MAX_HARI` di bagian script (default 7).
- **Aturan validasi:** ubah objek `rules` di bagian script. Setiap aturan mengembalikan pesan error, atau string kosong jika valid.
- **Layout utama:** jika proyek sudah memiliki layout sendiri, salin isi `<main>` beserta CSS dan script-nya ke layout tersebut, lalu hapus bagian header, navigasi, dan footer contoh.
- **Warna:** ubah variabel CSS di `:root`.

## Status

- [x] Formulir peminjaman dengan validasi jQuery (Item 2.c)
- [ ] Penyesuaian nama kolom dengan struktur basis data di proposal
- [ ] Halaman lain di navigasi (beranda, daftar barang, riwayat)
- [ ] Endpoint server dan validasi sisi server
- [ ] Pengujian di berbagai browser dan perangkat# PWUTS_A05_25091397010
