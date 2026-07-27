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

function tambahKeKeranjang(event, id, nama, harga, foto, kategori) {
    event.preventDefault();
    event.stopPropagation();
    let keranjang = ambilKeranjang();
    const index = keranjang.findIndex(item => item.id_produk === id);
    if (index > -1) {
        keranjang[index].quantity = (keranjang[index].quantity || 1) + 1;
    } else {
        keranjang.push({ id_produk: id, nama, harga, foto, kategori, quantity: 1 });
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
    let total = 0;
    keranjang.forEach((item, index) => {
        const subtotal = item.harga * (item.quantity || 1);
        total += subtotal;
        html += `
        <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-4 items-center">
            <img src="${item.foto || 'https://placehold.co/100x100?text=Digital'}" class="w-16 h-16 rounded-xl object-cover bg-slate-50 flex-shrink-0">
            <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-slate-900 truncate">${item.nama}</h3>
                <p class="text-xs font-semibold text-slate-400 mt-0.5">${item.kategori}</p>
                <div class="flex items-center justify-between mt-2">
                    <span class="text-sm font-extrabold text-slate-900">${formatRupiah(item.harga)}</span>
                    <div class="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                        <button onclick="ubahQty(${index}, -1)" class="material-icons-round text-xs text-slate-500 hover:text-slate-800 cursor-pointer">remove</button>
                        <span class="text-xs font-bold text-slate-800 px-1">${item.quantity}</span>
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
    document.getElementById('total-tagihan').innerText = formatRupiah(total);
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

// Rekening (dummy)
const databaseRekening = {
    'Dana': { nomor: '0895-1234-5678', nama: 'Luki Bumona' },
    'Ovo': { nomor: '0895-1234-5678', nama: 'Luki Bumona' },
    'ShopeePay': { nomor: '0895-1234-5678', nama: 'Luki Bumona' },
    'Gopay': { nomor: '0895-1234-5678', nama: 'Luki Bumona' },
    'LinkAja': { nomor: '0895-1234-5678', nama: 'Luki Bumona' },
    'Bank BCA': { nomor: '8410-1234-567', nama: 'Luki Bumona' },
    'Bank Mandiri': { nomor: '1310-0012-3456', nama: 'Luki Bumona' },
    'Bank BRI': { nomor: '0021-0105-1234-503', nama: 'Luki Bumona' },
    'Bank BNI': { nomor: '0234-567-890', nama: 'Luki Bumona' }
};

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
    const file = document.getElementById('input_bukti_bayar').files[0];

    if (!nama || !email || !wa) { tampilkanToast("Lengkapi data pelanggan.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { tampilkanToast("Format email tidak valid.", "error"); return; }
    if (!/^[0-9]{10,14}$/.test(wa.replace(/\D/g, ''))) { tampilkanToast("Nomor WA hanya angka 10-14 digit.", "error"); return; }
    if (!kategoriBayarTerpilih) { tampilkanToast("Pilih kategori pembayaran.", "error"); return; }
    if (!file) { tampilkanToast("Upload bukti pembayaran.", "error"); return; }

    tampilkanModal("Memproses", "Mengunggah bukti pembayaran...", "process");
    let buktiBase64;
    try {
        buktiBase64 = await konversiKeBase64(file);
    } catch {
        tampilkanToast("Gagal membaca file.", "error");
        return;
    }

    const keranjang = ambilKeranjang();
    const payload = {
        id_order: "ORD-" + Date.now(),
        nama_pelanggan: nama,
        email_pelanggan: email,
        nomor_whatsapp: wa,
        item_belanja: keranjang.map(i => `${i.nama} (x${i.quantity})`).join(", "),
        total_bayar: keranjang.reduce((sum, i) => sum + (i.harga * i.quantity), 0),
        metode_pembayaran: `${kategoriBayarTerpilih.toUpperCase()} - ${metode}`,
        bukti_pembayaran: buktiBase64
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const text = await response.text();
        // DEBUGGING: Tampilkan respons mentah
        alert("STATUS: " + response.status + "\nRESPON: " + text);
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            alert("Gagal parse JSON: " + text);
            throw new Error("Respons bukan JSON");
        }
        document.getElementById('custom-modal')?.classList.add('opacity-0', 'pointer-events-none');
        if (result.status === 'success') {
            localStorage.setItem('checkout_terakhir', JSON.stringify({
                id_invoice: payload.id_order,
                tanggal: new Date().toLocaleString(),
                total: payload.total_bayar,
                items: keranjang
            }));
            simpanKeranjang([]);
            tampilkanModal("Pembayaran Terkirim", "Pesanan Anda berhasil dicatat. Tim kami akan segera verifikasi.", "success", () => {
                window.location.href = 'sukses.html';
            });
        } else {
            tampilkanToast("Gagal: " + (result.message || "Respon tidak valid"), "error");
        }
    } catch (err) {
        alert("FETCH ERROR: " + err.message);
        document.getElementById('custom-modal')?.classList.add('opacity-0', 'pointer-events-none');
        tampilkanToast("Terjadi kesalahan server: " + err.message, "error");
    }
}