// ==========================================
// cart.js – Manajemen Keranjang & Checkout
// ==========================================

const REKENING = (typeof DATABASE_REKENING !== 'undefined') ? DATABASE_REKENING : {};

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
            harga: hargaFinal,
            hargaAsli: hargaAsli || hargaFinal,
            diskon: diskon || 0,
            foto: foto,
            kategori: kategori,
            quantity: 1
        });
    }
    simpanKeranjang(keranjang);
    perbaruiBadgeKatalog();
    tampilkanToast(`"${nama}" ditambahkan ke keranjang.`, 'success');
}

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

// ============ POP-UP METODE PEMBAYARAN ============
let kategoriBayarTerpilih = '';
let metodeTerpilih = '';

function bukaPopupPembayaran() {
    const nama = document.getElementById('nama_pelanggan').value.trim();
    const email = document.getElementById('email_pelanggan').value.trim();
    const wa = document.getElementById('nomor_whatsapp').value.trim();
    
    if (!nama || !email || !wa) {
        tampilkanToast("Lengkapi data pelanggan terlebih dahulu.", "error");
        return;
    }

    const popupHTML = `
    <div id="popup-pembayaran-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div class="flex items-center justify-between mb-5">
                <h3 class="text-base font-extrabold text-slate-900">Pilih Metode Pembayaran</h3>
                <button onclick="tutupPopupPembayaran()" class="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg">
                    <span class="material-icons-round text-[18px]">close</span>
                </button>
            </div>

            <div class="flex gap-2 mb-4">
                <button onclick="pilihTabPopup('e-wallet')" id="tab-e-wallet" class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-orange-600 text-white">E-Wallet</button>
                <button onclick="pilihTabPopup('transfer bank')" id="tab-transfer-bank" class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">Transfer Bank</button>
            </div>

            <div id="popup-daftar-metode" class="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                ${renderDaftarMetode('e-wallet')}
            </div>

            <div class="mt-5 pt-4 border-t border-slate-100 flex gap-3">
                <button onclick="tutupPopupPembayaran()" class="flex-1 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100">Batal</button>
                <button onclick="konfirmasiPembayaran()" id="btn-konfirmasi-popup" class="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-orange-600 disabled:opacity-50" disabled>Pilih Metode</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    document.body.style.overflow = 'hidden';
}

function tutupPopupPembayaran() {
    const popup = document.getElementById('popup-pembayaran-overlay');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
}

function pilihTabPopup(kategori) {
    const tabEwallet = document.getElementById('tab-e-wallet');
    const tabBank = document.getElementById('tab-transfer-bank');
    const daftarMetode = document.getElementById('popup-daftar-metode');

    if (kategori === 'e-wallet') {
        tabEwallet.className = "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-orange-600 text-white";
        tabBank.className = "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-600";
    } else {
        tabBank.className = "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-orange-600 text-white";
        tabEwallet.className = "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-600";
    }

    daftarMetode.innerHTML = renderDaftarMetode(kategori);
    metodeTerpilih = '';
    document.getElementById('btn-konfirmasi-popup').disabled = true;
    document.getElementById('btn-konfirmasi-popup').innerText = 'Pilih Metode';
}

function renderDaftarMetode(kategori) {
    const list = kategori === 'e-wallet' 
        ? ['Dana','Ovo','ShopeePay','Gopay','LinkAja'] 
        : ['Bank BCA','Bank Mandiri','Bank BRI','Bank BSI'];

    return list.map(metode => {
        const rek = REKENING[metode];
        const isAvailable = rek && rek.nomor && rek.nomor.trim() !== '';
        const icon = kategori === 'e-wallet' ? 'account_balance_wallet' : 'account_balance';
        
        return `
        <div onclick="${isAvailable ? `pilihMetodePopup('${metode}', '${kategori}')` : ''}" 
             class="flex items-center gap-3 p-3 rounded-xl border ${isAvailable ? 'cursor-pointer hover:border-orange-300' : 'cursor-not-allowed opacity-60'} ${metodeTerpilih === metode ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100">
                <span class="material-icons-round text-[20px]">${icon}</span>
            </div>
            <div class="flex-1">
                <p class="text-sm font-bold">${metode}</p>
                <p class="text-[10px] text-slate-400">${isAvailable ? rek.nomor : 'Tidak tersedia'}</p>
            </div>
            ${isAvailable ? '<span class="material-icons-round text-slate-300">chevron_right</span>' : '<span class="text-[9px] text-red-400 bg-red-50 px-2 py-0.5 rounded">Nonaktif</span>'}
        </div>`;
    }).join('');
}

function pilihMetodePopup(metode, kategori) {
    const rek = REKENING[metode];
    if (!rek || !rek.nomor || rek.nomor.trim() === '') return;
    
    metodeTerpilih = metode;
    kategoriBayarTerpilih = kategori;
    
    document.querySelectorAll('#popup-daftar-metode > div').forEach(el => {
        el.classList.remove('border-orange-500', 'bg-orange-50');
    });
    
    const items = document.querySelectorAll('#popup-daftar-metode > div');
    items.forEach(el => {
        const onclickAttr = el.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${metode}'`)) {
            el.classList.add('border-orange-500', 'bg-orange-50');
        }
    });
    
    const btnKonfirmasi = document.getElementById('btn-konfirmasi-popup');
    btnKonfirmasi.disabled = false;
    btnKonfirmasi.innerText = `Bayar via ${metode}`;
}

function konfirmasiPembayaran() {
    if (!metodeTerpilih) return;
    
    const select = document.getElementById('pilihan_metode');
    // Buat option sesuai metode yang dipilih
    select.innerHTML = `<option value="${metodeTerpilih}" selected>${metodeTerpilih}</option>`;
    
    document.getElementById('opsi-spesifik-bayar').classList.remove('hidden');
    perbaruiInfoRekening();
    tutupPopupPembayaran();
    tampilkanToast(`Metode ${metodeTerpilih} dipilih.`, 'success');
}

function perbaruiInfoRekening() {
    const metode = document.getElementById('pilihan_metode').value;
    const rek = REKENING[metode];
    if (rek) {
        document.getElementById('txt-nomor-rekening').innerText = rek.nomor;
        document.getElementById('txt-atas-nama').innerText = rek.nama;
        document.getElementById('txt-label-metode').innerText = metode;
    }
}

function salinNomorRekening() {
    const nomor = document.getElementById('txt-nomor-rekening').innerText;
    if (!nomor || nomor.trim() === '') {
        tampilkanToast("Nomor tidak tersedia.", "error");
        return;
    }
    navigator.clipboard.writeText(nomor).then(() => {
        tampilkanToast("Nomor disalin!", "success");
    });
}

// ============ PROSES TRANSAKSI ============
async function prosesTransaksi() {
    const nama = document.getElementById('nama_pelanggan').value.trim();
    const email = document.getElementById('email_pelanggan').value.trim();
    const wa = document.getElementById('nomor_whatsapp').value.trim();
    const metode = document.getElementById('pilihan_metode').value;

    // Validasi form
    if (!nama || !email || !wa) { tampilkanToast("Lengkapi data pelanggan.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { tampilkanToast("Format email tidak valid.", "error"); return; }
    if (!/^[0-9]{10,14}$/.test(wa.replace(/\D/g, ''))) { tampilkanToast("Nomor WA hanya angka 10-14 digit.", "error"); return; }
    if (!kategoriBayarTerpilih || !metode) {
        bukaPopupPembayaran();
        return;
    }

    const rekening = REKENING[metode];
    if (!rekening || !rekening.nomor || rekening.nomor.trim() === '') {
        tampilkanModal("Metode Tidak Tersedia", `Maaf, ${metode} belum tersedia. Silakan pilih metode lain.`, "info", () => bukaPopupPembayaran());
        return;
    }

    const btn = document.querySelector('#footer-checkout button');
    // Jika tombol sudah disabled, hentikan (cegah klik ganda)
    if (!btn || btn.disabled) return;

    // Tampilkan popup loading SEBELUM menonaktifkan tombol
    tampilkanModal("Memproses", "Mengirim transaksi Anda...", "process");

    // Nonaktifkan tombol
    btn.disabled = true;

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

        // Simpan checkout & kosongkan keranjang
        localStorage.setItem('checkout_terakhir', JSON.stringify({
            id_invoice: payload.id_order,
            tanggal: new Date().toLocaleString(),
            total: payload.total_bayar,
            items: keranjang
        }));
        simpanKeranjang([]);

        // Tutup popup loading
        const modal = document.getElementById('custom-modal');
        if (modal) modal.classList.add('opacity-0', 'pointer-events-none');

        // Tampilkan popup sukses
        tampilkanModal("Pembayaran Terkirim", "Pesanan Anda berhasil dicatat.", "success", () => {
            window.location.href = 'sukses.html';
        });

    } catch (err) {
        // Tutup popup loading
        const modal = document.getElementById('custom-modal');
        if (modal) modal.classList.add('opacity-0', 'pointer-events-none');

        // Aktifkan kembali tombol
        btn.disabled = false;
        tampilkanToast("Gagal: " + err.message, "error");
    }
}