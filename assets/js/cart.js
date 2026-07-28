// ==========================================
// cart.js – Manajemen Keranjang & Checkout
// (Tanpa Upload Bukti, Data Rekening dari config.js)
// ==========================================

// --- Konversi Link Google Drive (sama seperti di api.js) ---
function convertDriveLink(url) {
    if (!url || typeof url !== 'string') return '';
    let id = '';
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) id = match[1];
    if (!id) {
        match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) id = match[1];
    }
    if (!id) {
        match = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) id = match[1];
    }
    if (id) return `https://drive.usercontent.google.com/download?id=${id}&export=view`;
    return url;
}

// --- Data Rekening (dari config.js) ---
const databaseRekening = DATABASE_REKENING;

// --- Keranjang ---
function ambilKeranjang() {
    return JSON.parse(localStorage.getItem('keranjang_bumona')) || [];
}

function simpanKeranjang(keranjang) {
    localStorage.setItem('keranjang_bumona', JSON.stringify(keranjang));
}

function perbaruiBadgeKatalog() {
    const keranjang = ambilKeranjang();
    const total = keranjang.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badge = document.querySelector('#btn-keranjang span:last-child');
    if (badge) badge.innerText = total;
}

// --- Tambah ke Keranjang (dari katalog / detail) ---
function tambahKeKeranjang(event, id, nama, hargaFinal, foto, kategori, hargaAsli = null, diskon = 0) {
    event.preventDefault();
    event.stopPropagation();
    let keranjang = ambilKeranjang();
    const index = keranjang.findIndex(item => item.id_produk === id);
    if (index > -1) {
        keranjang[index].quantity = (keranjang[index].quantity || 1) + 1;
    } else {
        keranjang.push({
            id_produk: id,
            nama: nama,
            harga: hargaFinal,                     // harga setelah diskon
            hargaAsli: hargaAsli || hargaFinal,    // harga sebelum diskon
            diskon: diskon || 0,                   // persentase diskon
            foto: convertDriveLink(foto),
            kategori: kategori,
            quantity: 1
        });
    }
    simpanKeranjang(keranjang);
    perbaruiBadgeKatalog();
    tampilkanToast(`"${nama}" ditambahkan ke keranjang.`, 'success');
}

// --- Tampilkan Halaman Keranjang ---
function muatHalamanKeranjang() {
    const keranjang = ambilKeranjang();
    const kontainer = document.getElementById('kontainer-keranjang');
    const kosong = document.getElementById('keranjang-kosong');
    const form = document.getElementById('form-transaksi');
    const footer = document.getElementById('footer-checkout');
    if (keranjang.length === 0) {
        kontainer.innerHTML = '';
        form.classList.add('hidden');
        footer.classList.add('hidden');
        kosong.classList.remove('hidden');
        return;
    }
    kosong.classList.add('hidden');
    form.classList.remove('hidden');
    footer.classList.remove('hidden');
    let html = '';
    let totalHargaAsli = 0;
    let totalHargaFinal = 0;

    keranjang.forEach((item, index) => {
        const qty = item.quantity || 1;
        const hargaAsliSatuan = item.hargaAsli || item.harga;
        const hargaFinalSatuan = item.harga;
        const subTotalAsli = hargaAsliSatuan * qty;
        const subTotalFinal = hargaFinalSatuan * qty;
        totalHargaAsli += subTotalAsli;
        totalHargaFinal += subTotalFinal;
        const gambar = item.foto || 'https://placehold.co/100x100?text=Digital';

        html += `
        <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-4 items-center">
            <img src="${gambar}" alt="${item.nama}" onerror="this.src='https://placehold.co/100x100?text=Digital'" class="w-16 h-16 rounded-xl object-cover bg-slate-50 flex-shrink-0">
            <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-slate-900 truncate">${item.nama}</h3>
                <p class="text-xs font-semibold text-slate-400 mt-0.5">${item.kategori}</p>
                <div class="flex items-center justify-between mt-2">
                    <div>
                        ${hargaAsliSatuan > hargaFinalSatuan ? `<span class="text-xs text-slate-400 line-through mr-1">${formatRupiah(hargaAsliSatuan)}</span>` : ''}
                        <span class="text-sm font-extrabold text-slate-900">${formatRupiah(hargaFinalSatuan)}</span>
                    </div>
                    <div class="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                        <button onclick="ubahQty(${index}, -1)" class="material-icons-round text-xs text-slate-500 hover:text-slate-800 cursor-pointer">remove</button>
                        <span class="text-xs font-bold text-slate-800 px-1">${qty}</span>
                        <button onclick="ubahQty(${index}, 1)" class="material-icons-round text-xs text-slate-500 hover:text-slate-800 cursor-pointer">add</button>
                    </div>
                </div>
            </div>
            <button onclick="hapusItem(${index})" class="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                <span class="material-icons-round text-xl">delete_outline</span>
            </button>
        </div>`;
    });

    kontainer.innerHTML = html;

    const totalDiskon = totalHargaAsli - totalHargaFinal;
    if (footer) {
        footer.innerHTML = `
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div class="flex flex-col gap-1">
                <span class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Pembayaran</span>
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-lg font-extrabold text-orange-600">${formatRupiah(totalHargaFinal)}</span>
                    ${totalDiskon > 0 ? `
                        <span class="text-xs text-slate-400 line-through">${formatRupiah(totalHargaAsli)}</span>
                        <span class="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">Hemat ${formatRupiah(totalDiskon)}</span>
                    ` : ''}
                </div>
            </div>
            <button onclick="prosesTransaksi()" class="bg-orange-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-sm hover:bg-orange-700 transition-all active:scale-[0.98] cursor-pointer w-full sm:w-auto">
                Verifikasi & Bayar
            </button>
        </div>`;
    }
}

// --- Ubah Kuantitas / Hapus Item ---
function ubahQty(index, delta) {
    let keranjang = ambilKeranjang();
    keranjang[index].quantity = (keranjang[index].quantity || 1) + delta;
    if (keranjang[index].quantity < 1) keranjang.splice(index, 1);
    simpanKeranjang(keranjang);
    muatHalamanKeranjang();
}

function hapusItem(index) {
    let keranjang = ambilKeranjang();
    keranjang.splice(index, 1);
    simpanKeranjang(keranjang);
    muatHalamanKeranjang();
}

// --- Metode Pembayaran ---
let kategoriBayarTerpilih = '';

function pilihKategoriBayar(kategori) {
    kategoriBayarTerpilih = kategori;
    const opsi = document.getElementById('opsi-spesifik-bayar');
    const select = document.getElementById('pilihan_metode');
    opsi.classList.remove('hidden');
    select.innerHTML = '';
    const list = kategori === 'e-wallet' ? ['Dana','Ovo','ShopeePay','Gopay','LinkAja'] : ['Bank BCA','Bank Mandiri','Bank BRI','Bank BNI'];
    list.forEach(o => select.innerHTML += `<option value="${o}">${o}</option>`);
    perbaruiInfoRekening();
}

function perbaruiInfoRekening() {
    const metode = document.getElementById('pilihan_metode').value;
    if (databaseRekening[metode]) {
        document.getElementById('txt-nomor-rekening').innerText = databaseRekening[metode].nomor;
        document.getElementById('txt-atas-nama').innerText = databaseRekening[metode].nama;
    }
}

function salinNomorRekening() {
    const nomor = document.getElementById('txt-nomor-rekening').innerText;
    navigator.clipboard.writeText(nomor).then(() => {
        tampilkanToast("Nomor rekening disalin!", "success");
        document.getElementById('icon-copy').innerText = "check";
        setTimeout(() => { document.getElementById('icon-copy').innerText = "content_copy"; }, 2000);
    });
}

async function prosesTransaksi() {
    const nama = document.getElementById('nama_pelanggan').value.trim();
    const email = document.getElementById('email_pelanggan').value.trim();
    const wa = document.getElementById('nomor_whatsapp').value.trim();
    const metode = document.getElementById('pilihan_metode').value;

    // Validasi
    if (!nama || !email || !wa) { tampilkanToast("Lengkapi data pelanggan.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { tampilkanToast("Format email tidak valid.", "error"); return; }
    if (!/^[0-9]{10,14}$/.test(wa.replace(/\D/g, ''))) { tampilkanToast("Nomor WA hanya angka 10-14 digit.", "error"); return; }
    if (!kategoriBayarTerpilih) { tampilkanToast("Pilih kategori pembayaran.", "error"); return; }

    // === CEGAH KLIK GANDA & TAMPILKAN POPUP LOADING ===
    const btn = document.querySelector('#footer-checkout button');
    if (!btn || btn.disabled) return;
    btn.disabled = true;

    // Tampilkan popup loading
    tampilkanModal("Memproses", "Transaksi Anda sedang dikirim. Mohon tunggu sebentar...", "process");

    const keranjang = ambilKeranjang();
    const payload = {
        id_order: "ORD-" + Date.now(),
        nama_pelanggan: nama,
        email_pelanggan: email,
        nomor_whatsapp: wa,
        item_belanja: keranjang.map(i => `${i.nama} (x${i.quantity})`).join(", "),
        total_bayar: keranjang.reduce((sum, i) => sum + (i.harga * i.quantity), 0),
        metode_pembayaran: `${kategoriBayarTerpilih.toUpperCase()} - ${metode}`
    };

    try {
        await kirimTransaksi(payload);
        // Tutup popup loading
        document.getElementById('custom-modal').classList.add('opacity-0', 'pointer-events-none');
        localStorage.setItem('checkout_terakhir', JSON.stringify({
            id_invoice: payload.id_order,
            tanggal: new Date().toLocaleString(),
            total: payload.total_bayar,
            items: keranjang
        }));
        simpanKeranjang([]);
        tampilkanModal("Pembayaran Terkirim", "Pesanan Anda berhasil dicatat.", "success", () => {
            window.location.href = 'sukses.html';
        });
    } catch (err) {
        // Tutup popup loading
        document.getElementById('custom-modal').classList.add('opacity-0', 'pointer-events-none');
        btn.disabled = false;
        tampilkanToast("Gagal: " + err.message, "error");
    }
}