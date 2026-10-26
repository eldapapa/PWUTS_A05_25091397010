/* =====================================================
   app.js : navigasi Ajax (tanpa refresh halaman)
   - Klik menu -> ubah hash (#beranda / #inventaris / #form)
   - Hash berubah -> konten halaman diambil dengan $.ajax
     lalu dimasukkan ke <main id="content">
   ===================================================== */
$(function () {

  const PAGES = {
    beranda:    { url: 'beranda.html', title: 'Beranda' },
    inventaris: { url: 'konten.html',  title: 'Daftar Barang' },
    form:       { url: 'form.html',    title: 'Ajukan Peminjaman' }
  };

  let requestToken = 0; // mencegah respons lama menimpa respons baru bila klik cepat

  function setActive(name) {
    $('#mainNav a').removeClass('active').removeAttr('aria-current');
    $('#mainNav a[data-page="' + name + '"]').addClass('active').attr('aria-current', 'page');
  }

  function loadPage(name) {
    if (!PAGES[name]) { name = 'beranda'; }
    const page = PAGES[name];
    const token = ++requestToken;

    $('#content').addClass('loading').attr('aria-busy', 'true');

    $.ajax({ url: page.url, dataType: 'html', cache: false })
      .done(function (html) {
        if (token !== requestToken) { return; }
        $('#content').html(html);
        document.title = page.title + ' | SIPEBAR Fakultas Vokasi';
        setActive(name);
        if (typeof window.PageInit[name] === 'function') {
          window.PageInit[name]();
        }
        window.scrollTo(0, 0);
      })
      .fail(function () {
        if (token !== requestToken) { return; }
        $('#content').html(
          '<div class="alert alert-error">' +
          '<strong>Halaman gagal dimuat.</strong> ' +
          'Ajax tidak bisa berjalan jika file dibuka langsung (file://). ' +
          'Jalankan lewat server lokal, misalnya: <code>python -m http.server 8000</code> ' +
          'lalu buka <code>http://localhost:8000</code>.' +
          '</div>'
        );
      })
      .always(function () {
        if (token === requestToken) {
          $('#content').removeClass('loading').removeAttr('aria-busy');
        }
      });
  }

  /* ---------- Halaman Beranda ---------- */
  window.PageInit.beranda = function () {
    const jenis = window.BARANG.length;
    const totalUnit = window.BARANG.reduce(function (s, b) { return s + b.total; }, 0);
    const tersedia = window.BARANG.reduce(function (s, b) { return s + window.getStok(b.id); }, 0);
    const menunggu = window.getPeminjaman().filter(function (p) { return p.status === 'Menunggu'; }).length;

    const items = [
      { angka: jenis,     label: 'Jenis Barang' },
      { angka: totalUnit, label: 'Total Unit' },
      { angka: tersedia,  label: 'Unit Tersedia' },
      { angka: menunggu,  label: 'Pengajuan Menunggu' }
    ];

    $('#stats').html(items.map(function (i) {
      return '<div class="stat"><span class="stat-num">' + i.angka + '</span>' +
             '<span class="stat-label">' + i.label + '</span></div>';
    }).join(''));
  };

  /* ---------- Event ---------- */
  $(window).on('hashchange', function () {
    loadPage(location.hash.slice(1));
  });

  // Menu mobile
  function tutupMenu() {
    $('#mainNav').removeClass('open');
    $('#menuToggle').attr('aria-expanded', 'false');
  }
  $('#menuToggle').on('click', function () {
    const buka = !$('#mainNav').hasClass('open');
    $('#mainNav').toggleClass('open', buka);
    $(this).attr('aria-expanded', buka ? 'true' : 'false');
  });
  $('#mainNav a, .brand').on('click', tutupMenu);

  // Muat halaman pertama sesuai hash (default: beranda)
  loadPage(location.hash.slice(1));
});
