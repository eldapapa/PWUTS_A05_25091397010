/* =====================================================
   form.js : halaman "Form Peminjaman"
   Validasi Javascript/jQuery sebelum data dikirim (submit):
   - kolom wajib tidak boleh kosong
   - NIM/NIP & No. HP: hanya angka dengan panjang tertentu
   - jumlah tidak boleh melebihi stok
   - tanggal pinjam tidak boleh lewat, tanggal kembali >= tanggal pinjam,
     maksimal 7 hari
   ===================================================== */
window.PageInit.form = function () {

  const $f = $('#formPinjam');
  const MAKS_HARI = 7;

  /* ---------- Isi pilihan select ---------- */
  window.PRODI.forEach(function (p) {
    $('#prodi').append('<option value="' + window.esc(p) + '">' + window.esc(p) + '</option>');
  });

  function isiPilihanBarang(pilihan) {
    const $b = $('#barang');
    $b.find('option:not(:first)').remove();
    window.BARANG.forEach(function (b) {
      const stok = window.getStok(b.id);
      $b.append(
        '<option value="' + b.id + '"' + (stok === 0 ? ' disabled' : '') + '>' +
        window.esc(b.nama) + ' (sisa ' + stok + ')</option>'
      );
    });
    if (pilihan) { $b.val(pilihan); }
  }

  isiPilihanBarang();

  // Batas tanggal paling awal = hari ini
  const hariIni = window.isoDate(new Date());
  $('#tglPinjam, #tglKembali').attr('min', hariIni);

  // Pilihan barang dari halaman Daftar Barang
  let dipilih = null;
  try {
    dipilih = sessionStorage.getItem('sipebar_pilih');
    sessionStorage.removeItem('sipebar_pilih');
  } catch (e) {}
  if (dipilih) { $('#barang').val(dipilih); }

  /* ---------- Aturan validasi (return '' jika valid) ---------- */
  function nilai(id) {
    return id === 'setuju' ? $('#setuju').is(':checked') : $.trim($('#' + id).val());
  }

  function selisihHari(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  const rules = {
    nim: function (v) {
      if (!v) return 'NIM/NIP wajib diisi.';
      if (!/^\d+$/.test(v)) return 'NIM/NIP hanya boleh berisi angka.';
      if (v.length < 10 || v.length > 18) return 'NIM/NIP harus 10-18 digit (sekarang ' + v.length + ' digit).';
      return '';
    },
    nama: function (v) {
      if (!v) return 'Nama lengkap wajib diisi.';
      if (v.length < 3) return 'Nama minimal 3 karakter.';
      if (!/^[A-Za-z .,'\-]+$/.test(v)) return 'Nama hanya boleh berisi huruf dan tanda baca umum.';
      return '';
    },
    prodi: function (v) {
      return v ? '' : 'Silakan pilih program studi.';
    },
    hp: function (v) {
      if (!v) return 'Nomor HP wajib diisi.';
      if (!/^\d+$/.test(v)) return 'Nomor HP hanya boleh berisi angka.';
      if (!/^08\d{8,11}$/.test(v)) return 'Nomor HP harus diawali 08 dan berjumlah 10-13 digit.';
      return '';
    },
    barang: function (v) {
      if (!v) return 'Silakan pilih barang yang akan dipinjam.';
      if (window.getStok(v) === 0) return 'Stok barang ini sedang habis.';
      return '';
    },
    jumlah: function (v) {
      if (!v) return 'Jumlah wajib diisi.';
      if (!/^\d+$/.test(v) || parseInt(v, 10) < 1) return 'Jumlah harus bilangan bulat minimal 1.';
      const id = nilai('barang');
      if (id) {
        const stok = window.getStok(id);
        if (parseInt(v, 10) > stok) return 'Jumlah melebihi stok tersedia (' + stok + ' unit).';
      }
      return '';
    },
    tglPinjam: function (v) {
      if (!v) return 'Tanggal pinjam wajib diisi.';
      if (v < hariIni) return 'Tanggal pinjam tidak boleh sebelum hari ini.';
      return '';
    },
    tglKembali: function (v) {
      if (!v) return 'Tanggal kembali wajib diisi.';
      const pinjam = nilai('tglPinjam');
      if (v < hariIni) return 'Tanggal kembali tidak boleh sebelum hari ini.';
      if (pinjam) {
        if (v < pinjam) return 'Tanggal kembali tidak boleh sebelum tanggal pinjam.';
        if (selisihHari(pinjam, v) > MAKS_HARI) return 'Lama peminjaman maksimal ' + MAKS_HARI + ' hari.';
      }
      return '';
    },
    keperluan: function (v) {
      if (!v) return 'Keperluan wajib diisi.';
      if (v.length < 10) return 'Keperluan minimal 10 karakter (sekarang ' + v.length + ').';
      return '';
    },
    setuju: function (v) {
      return v ? '' : 'Kamu harus menyetujui pernyataan ini.';
    }
  };

  const urutanField = ['nim', 'nama', 'prodi', 'hp', 'barang', 'jumlah', 'tglPinjam', 'tglKembali', 'keperluan', 'setuju'];

  function setError(id, pesan) {
    $('.error[data-for="' + id + '"]').text(pesan);
    $('#' + id).toggleClass('invalid', !!pesan).attr('aria-invalid', pesan ? 'true' : 'false');
  }

  function validasiField(id) {
    const pesan = rules[id](nilai(id));
    setError(id, pesan);
    return !pesan;
  }

  function validasiSemua() {
    let pertamaSalah = null;
    urutanField.forEach(function (id) {
      if (!validasiField(id) && !pertamaSalah) { pertamaSalah = id; }
    });
    return pertamaSalah; // null jika semua valid
  }

  /* ---------- Info stok & penghitung karakter ---------- */
  function updateInfoStok() {
    const id = nilai('barang');
    if (!id) { $('#stokInfo').text(''); $('#jumlah').removeAttr('max'); return; }
    const stok = window.getStok(id);
    $('#stokInfo').text('Stok tersedia: ' + stok + ' unit');
    $('#jumlah').attr('max', stok);
  }

  function updateHitung() {
    $('#hitungKarakter').text($('#keperluan').val().length);
  }

  /* ---------- Event validasi ---------- */
  // Validasi saat meninggalkan kolom
  $f.on('focusout', 'input[id], select[id], textarea[id]', function () {
    if (rules[this.id] && this.type !== 'checkbox') { validasiField(this.id); }
  });

  // Jika kolom sudah ditandai salah, cek ulang langsung saat diperbaiki
  $f.on('input change', 'input[id], select[id], textarea[id]', function () {
    const id = this.id;
    if (!rules[id]) return;
    if ($(this).hasClass('invalid') || this.type === 'checkbox') { validasiField(id); }

    if (id === 'barang') {
      updateInfoStok();
      if (nilai('jumlah')) { validasiField('jumlah'); }
    }
    if (id === 'tglPinjam') {
      if (nilai('tglPinjam')) { $('#tglKembali').attr('min', nilai('tglPinjam')); }
      if (nilai('tglKembali')) { validasiField('tglKembali'); }
    }
    if (id === 'keperluan') { updateHitung(); }
  });

  /* ---------- Submit ---------- */
  $f.on('submit', function (e) {
    e.preventDefault();               // cegah kirim sebelum valid
    $('#alertBox').empty();

    const salah = validasiSemua();
    if (salah) {
      $('#alertBox').html('<div class="alert alert-error"><strong>Pengajuan belum bisa dikirim.</strong> Periksa kolom yang ditandai merah.</div>');
      $('#' + salah).trigger('focus');
      return;
    }

    const idBarang = nilai('barang');
    const b = window.BARANG.find(function (x) { return x.id === idBarang; });
    const daftar = window.getPeminjaman();

    const data = {
      id: 'PMJ-' + String(Date.now()).slice(-6),
      nim: nilai('nim'),
      nama: nilai('nama'),
      prodi: nilai('prodi'),
      hp: nilai('hp'),
      idBarang: idBarang,
      namaBarang: b.nama,
      jumlah: parseInt(nilai('jumlah'), 10),
      tglPinjam: nilai('tglPinjam'),
      tglKembali: nilai('tglKembali'),
      keperluan: nilai('keperluan'),
      status: 'Menunggu',
      dibuat: new Date().toISOString()
    };

    /* Di sini data seharusnya dikirim ke server, contoh:
       $.post('api/peminjaman.php', data).done(...);
       Untuk simulasi, data disimpan ke localStorage. */
    daftar.unshift(data);
    window.simpanPeminjaman(daftar);

    $('#alertBox').html(
      '<div class="alert alert-ok"><strong>Pengajuan terkirim.</strong> ' +
      'Nomor pengajuan <code>' + data.id + '</code> untuk ' + data.jumlah + ' unit ' +
      window.esc(data.namaBarang) + ' berstatus <em>Menunggu</em>.</div>'
    );

    $f[0].reset();
    urutanField.forEach(function (id) { setError(id, ''); });
    $('#tglKembali').attr('min', hariIni);
    isiPilihanBarang();
    updateInfoStok();
    updateHitung();
    renderRiwayat();
    window.scrollTo(0, 0);
  });

  $('#btnKosongkan').on('click', function () {
    setTimeout(function () {
      urutanField.forEach(function (id) { setError(id, ''); });
      $('#alertBox').empty();
      $('#tglKembali').attr('min', hariIni);
      updateInfoStok();
      updateHitung();
    }, 0);
  });

  /* ---------- Riwayat ---------- */
  function renderRiwayat() {
    const daftar = window.getPeminjaman();
    const $body = $('#riwayatBody');
    if (daftar.length === 0) {
      $body.html('<tr><td colspan="6" class="empty-cell">Belum ada pengajuan.</td></tr>');
      return;
    }
    $body.html(daftar.map(function (p) {
      return '<tr>' +
        '<td data-label="ID">' + window.esc(p.id) + '</td>' +
        '<td data-label="Peminjam">' + window.esc(p.nama) + '<br><small class="muted">' + window.esc(p.nim) + '</small></td>' +
        '<td data-label="Barang">' + window.esc(p.namaBarang) + '</td>' +
        '<td data-label="Jml">' + p.jumlah + '</td>' +
        '<td data-label="Periode">' + window.formatTanggal(p.tglPinjam) + ' &ndash; ' + window.formatTanggal(p.tglKembali) + '</td>' +
        '<td data-label="Status"><span class="badge badge-warn">' + window.esc(p.status) + '</span></td>' +
      '</tr>';
    }).join(''));
  }

  $('#btnHapusRiwayat').on('click', function () {
    if (!window.getPeminjaman().length) return;
    if (window.confirm('Hapus semua riwayat pengajuan simulasi?')) {
      window.simpanPeminjaman([]);
      isiPilihanBarang(nilai('barang'));
      updateInfoStok();
      renderRiwayat();
    }
  });

  updateInfoStok();
  updateHitung();
  renderRiwayat();
};
