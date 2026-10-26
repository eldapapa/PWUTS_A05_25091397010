/* =====================================================
   konten.js : halaman "Daftar Barang"
   Fitur interaktif: pencarian, filter kategori & status,
   dan simulasi cek ketersediaan.
   ===================================================== */
window.PageInit.inventaris = function () {

  const $grid = $('#gridBarang');

  /* ---------- Isi pilihan filter & simulasi ---------- */
  const kategori = window.BARANG
    .map(function (b) { return b.kategori; })
    .filter(function (k, i, arr) { return arr.indexOf(k) === i; });

  kategori.forEach(function (k) {
    $('#fKategori').append('<option value="' + window.esc(k) + '">' + window.esc(k) + '</option>');
  });

  window.BARANG.forEach(function (b) {
    $('#simBarang').append('<option value="' + b.id + '">' + window.esc(b.nama) + '</option>');
  });

  /* ---------- Render kartu barang ---------- */
  function render() {
    const q = $('#cari').val().trim().toLowerCase();
    const k = $('#fKategori').val();
    const s = $('#fStatus').val();

    const hasil = window.BARANG.filter(function (b) {
      const cocokCari = !q || b.nama.toLowerCase().indexOf(q) > -1 || b.id.toLowerCase().indexOf(q) > -1;
      const cocokKat = !k || b.kategori === k;
      const cocokStatus = !s || window.statusStok(b.id).label === s;
      return cocokCari && cocokKat && cocokStatus;
    });

    $('#hasilInfo').text('Menampilkan ' + hasil.length + ' dari ' + window.BARANG.length + ' barang.');

    if (hasil.length === 0) {
      $grid.html('<div class="empty">Tidak ada barang yang cocok dengan filter.</div>');
      return;
    }

    $grid.html(hasil.map(function (b) {
      const stok = window.getStok(b.id);
      const st = window.statusStok(b.id);
      const persen = Math.round((stok / b.total) * 100);
      return '' +
        '<article class="item">' +
          '<div class="item-top">' +
            '<span class="badge badge-kat">' + window.esc(b.kategori) + '</span>' +
            '<span class="badge badge-' + st.cls + '">' + st.label + '</span>' +
          '</div>' +
          '<h3>' + window.esc(b.nama) + '</h3>' +
          '<p class="muted">' + b.id + ' &middot; ' + window.esc(b.lokasi) + '</p>' +
          '<div class="stock-bar" aria-hidden="true"><span class="bar-' + st.cls + '" style="width:' + persen + '%"></span></div>' +
          '<p class="stock-text">Stok: <strong>' + stok + '</strong> / ' + b.total + ' unit &middot; Kondisi ' + window.esc(b.kondisi) + '</p>' +
          '<button type="button" class="btn btn-primary btn-block btn-pinjam" data-id="' + b.id + '"' +
            (stok === 0 ? ' disabled' : '') + '>' +
            (stok === 0 ? 'Stok Habis' : 'Ajukan Pinjam') +
          '</button>' +
        '</article>';
    }).join(''));
  }

  /* ---------- Simulasi ---------- */
  function hitungSimulasi() {
    const id = $('#simBarang').val();
    const jumlah = parseInt($('#simJumlah').val(), 10);
    const hari = parseInt($('#simHari').val(), 10);
    const $out = $('#simHasil').removeClass('ok warn bad');

    if (!jumlah || jumlah < 1 || !hari || hari < 1) {
      $out.addClass('warn').html('Masukkan jumlah dan lama pinjam yang valid (minimal 1).');
      return;
    }

    const b = window.BARANG.find(function (x) { return x.id === id; });
    const stok = window.getStok(id);
    const kembali = new Date();
    kembali.setDate(kembali.getDate() + hari);

    if (jumlah > stok) {
      $out.addClass('bad').html(
        '<strong>Belum bisa dipinjam.</strong> Kamu meminta ' + jumlah + ' unit, sedangkan stok <em>' +
        window.esc(b.nama) + '</em> tersisa ' + stok + ' unit.'
      );
    } else if (hari > 7) {
      $out.addClass('warn').html(
        '<strong>Melebihi batas.</strong> Lama pinjam maksimal 7 hari, sedangkan simulasi ini ' + hari + ' hari.'
      );
    } else {
      $out.addClass('ok').html(
        '<strong>Bisa dipinjam.</strong> ' + jumlah + ' unit ' + window.esc(b.nama) +
        ' tersedia. Jika dipinjam hari ini, kembalikan paling lambat <strong>' +
        window.formatTanggal(window.isoDate(kembali)) + '</strong>. ' +
        '<a href="#form" class="link-pinjam" data-id="' + id + '">Lanjut ke formulir &rarr;</a>'
      );
    }
  }

  /* ---------- Event ---------- */
  $('#cari').on('input', render);
  $('#fKategori, #fStatus').on('change', render);
  $('#btnReset').on('click', function () {
    $('#cari').val('');
    $('#fKategori, #fStatus').val('');
    render();
  });

  // Tombol "Ajukan Pinjam": simpan pilihan lalu pindah ke halaman form (Ajax)
  $grid.on('click', '.btn-pinjam', function () {
    try { sessionStorage.setItem('sipebar_pilih', $(this).data('id')); } catch (e) {}
    location.hash = 'form';
  });

  $('#simHasil').on('click', '.link-pinjam', function () {
    try { sessionStorage.setItem('sipebar_pilih', $(this).data('id')); } catch (e) {}
  });

  $('#simBarang, #simJumlah, #simHari').on('input change', hitungSimulasi);

  render();
  hitungSimulasi();
};
