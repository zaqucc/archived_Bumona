let semuaOrder = [];

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatWA(waRaw) {
    const str = String(waRaw || '');
    const bersih = str.replace(/\D/g, '');
    if (!bersih || bersih.length < 6) return null;
    const final = bersih.startsWith('62') ? bersih : '62' + bersih.slice(1);
    return `https://wa.me/${final}`;
}

async function muatDataAdmin() {
    const loading = document.getElementById('admin-loading');
    const kontainer = document.getElementById('kontainer-order-admin');
    const kosong = document.getElementById('admin-order-kosong');
    const txtEmpty = document.getElementById('txt-empty-desc');

    if (!loading || !kontainer || !kosong) {
        console.error('Elemen admin tidak lengkap');
        alert('Elemen halaman admin tidak lengkap. Periksa admin.html.');
        return;
    }

    loading.classList.remove('hidden');
    kontainer.classList.add('hidden');
    kosong.classList.add('hidden');

    try {
        if (typeof tarikDataAdmin !== 'function') {
            throw new Error('Fungsi tarikDataAdmin tidak ditemukan. Pastikan api.js terhubung.');
        }

        console.log('Mengambil data admin...');
        semuaOrder = await tarikDataAdmin();
        console.log('Data mentah dari API:', semuaOrder);

        loading.classList.add('hidden');

        if (!Array.isArray(semuaOrder)) {
            throw new Error('Data bukan array: ' + JSON.stringify(semuaOrder));
        }

        if (semuaOrder.length === 0) {
            kosong.classList.remove('hidden');
            if (txtEmpty) txtEmpty.innerText = 'Belum ada data pesanan masuk.';
            document.getElementById('stat-omzet').innerText = 'Rp 0';
            document.getElementById('stat-pending').innerText = '0 Order';
            return;
        }

        console.log('Merender', semuaOrder.length, 'order...');
        renderOrderAdmin(semuaOrder);
        kontainer.classList.remove('hidden');
        console.log('Render selesai.');
    } catch (err) {
        console.error('Error di muatDataAdmin:', err);
        loading.classList.add('hidden');
        kosong.classList.remove('hidden');
        if (txtEmpty) txtEmpty.innerText = 'Gagal memuat: ' + err.message;
        tampilkanToast('Gagal memuat data admin.', 'error');
    }
}

function renderOrderAdmin(data) {
    const kontainer = document.getElementById('kontainer-order-admin');
    const kosong = document.getElementById('admin-order-kosong');

    if (!kontainer || !kosong) {
        console.error('Elemen kontainer atau kosong tidak ditemukan.');
        return;
    }

    if (data.length === 0) {
        kontainer.classList.add('hidden');
        kosong.classList.remove('hidden');
        return;
    }

    kontainer.classList.remove('hidden');
    kosong.classList.add('hidden');
    kontainer.innerHTML = '';

    let omzet = 0;
    let pending = 0;

    for (let i = 0; i < data.length; i++) {
        const order = data[i];
        try {
            const idOrder = order["id order"] || order["id_order"] || "-";
            const tanggal = order["tanggal"] || "-";
            const nama = order["nama pelanggan"] || "-";
            const email = order["email pelanggan"] || "-";
            const waRaw = String(order["nomor whatsapp"] || "");
            const item = order["item belanja"] || "-";
            const total = Number(order["total bayar"] || 0);
            const metode = order["metode pembayaran"] || "-";
            const status = (order["status"] || "Pending").trim();
            // Bukti tidak diperlukan
            // const bukti = String(order["bukti pembayaran"] || "");

            if (status.toLowerCase() === 'sukses' || status.toLowerCase() === 'selesai') {
                omzet += total;
            } else if (status.toLowerCase() === 'pending') {
                pending++;
            }

            let badgeClass = "bg-amber-50 text-amber-600 border-amber-100";
            if (status.toLowerCase() === 'sukses' || status.toLowerCase() === 'selesai') {
                badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
            } else if (status.toLowerCase() === 'gagal' || status.toLowerCase() === 'batal') {
                badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
            }

            const emailSafe = escapeHTML(email);
            const emailLink = isValidEmail(email) ? `mailto:${email}` : null;
            const emailHTML = emailLink
                ? `<a href="${emailLink}" class="text-blue-600 hover:underline font-semibold">${emailSafe}</a>`
                : emailSafe;

            const waSafe = escapeHTML(waRaw) || "-";
            const waLink = formatWA(waRaw);
            const waHTML = waLink
                ? `<a href="${waLink}" target="_blank" class="text-emerald-600 hover:underline font-semibold">${waSafe}</a>`
                : waSafe;

            const idOrderEscaped = escapeHTML(idOrder).replace(/'/g, "\\'");

            kontainer.innerHTML += `
            <div class="card-item-admin bg-white rounded-2xl p-4.5 border border-slate-100 shadow-2xs space-y-3.5" data-search="${escapeHTML(idOrder)} ${escapeHTML(nama)}">
                <div class="flex justify-between items-start border-b border-slate-50 pb-2.5">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Order</span>
                        <span class="text-xs font-extrabold text-slate-900 block">${escapeHTML(idOrder)}</span>
                        <span class="text-[10px] text-slate-400">${escapeHTML(tanggal)}</span>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-1 rounded-lg border uppercase ${badgeClass}">${escapeHTML(status)}</span>
                </div>
                <div class="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <p class="font-bold text-slate-800">Nama: ${escapeHTML(nama)}</p>
                    <p class="text-slate-700">Email: ${emailHTML}</p>
                    <p class="text-slate-800">WhatsApp: ${waHTML}</p>
                </div>
                <div class="grid grid-cols-2 gap-3 text-[11px]">
                    <div class="bg-slate-50 p-2.5 rounded-xl"><span class="text-[9px] text-slate-400 font-bold block">Item Belanja</span><p class="font-bold text-slate-700">${escapeHTML(item)}</p></div>
                    <div class="bg-slate-50 p-2.5 rounded-xl"><span class="text-[9px] text-slate-400 font-bold block">Total Bayar</span><p class="text-sm font-black text-orange-600">${formatRupiah(total)}</p></div>
                </div>
                <div class="flex gap-2 pt-1 items-center justify-between border-t border-slate-50 mt-1 text-[11px]">
                    <div><span class="text-slate-400 italic">Tanpa Bukti</span></div>
                    ${status.toLowerCase() === 'pending' ? `
                    <div class="flex gap-1.5">
                        <button onclick="updateStatus('${idOrderEscaped}', 'Gagal')" class="bg-rose-50 text-rose-600 font-bold px-3 py-1.5 rounded-lg border border-rose-100 cursor-pointer">Tolak</button>
                        <button onclick="updateStatus('${idOrderEscaped}', 'Sukses')" class="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer">Setujui</button>
                    </div>` : ''}
                </div>
            </div>`;
        } catch (itemErr) {
            console.error('Gagal merender order:', order, itemErr);
        }
    }

    document.getElementById('stat-omzet').innerText = formatRupiah(omzet);
    document.getElementById('stat-pending').innerText = `${pending} Order`;
}

function filterTabelOrderAdmin() {
    const keyword = document.getElementById('input-cari-admin').value.toLowerCase();
    document.querySelectorAll('.card-item-admin').forEach(card => {
        const searchData = card.getAttribute('data-search') || '';
        card.classList.toggle('hidden', !searchData.includes(keyword));
    });
}

// Fungsi pratinjau gambar dihapus karena tidak ada bukti
function bukaPratinjau(src) {
    // tidak digunakan
}
function tutupPratinjauGambar() {
    // tidak digunakan
}

async function updateStatus(id, statusBaru) {
    if (!confirm(`Yakin ubah status ${id} ke ${statusBaru}?`)) return;
    try {
        const result = await updateStatusOrder(id, statusBaru);
        if (result.status === 'success') {
            tampilkanToast("Status berhasil diperbarui.", "success");
            muatDataAdmin();
        } else {
            tampilkanToast("Gagal update status.", "error");
        }
    } catch {
        tampilkanToast("Error jaringan.", "error");
    }
}