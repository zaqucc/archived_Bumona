let semuaOrder = [];

async function muatDataAdmin() {
    const loading = document.getElementById('admin-loading');
    const kontainer = document.getElementById('kontainer-order-admin');
    const kosong = document.getElementById('admin-order-kosong');
    loading.classList.remove('hidden');
    try {
        semuaOrder = await tarikDataAdmin();
        loading.classList.add('hidden');
        if (!Array.isArray(semuaOrder) || semuaOrder.length === 0) {
            kosong.classList.remove('hidden');
            return;
        }
        renderOrderAdmin(semuaOrder);
    } catch (err) {
        loading.classList.add('hidden');
        kosong.classList.remove('hidden');
        tampilkanToast("Gagal memuat data admin.", "error");
    }
}

function renderOrderAdmin(data) {
    const kontainer = document.getElementById('kontainer-order-admin');
    const kosong = document.getElementById('admin-order-kosong');
    if (data.length === 0) {
        kontainer.classList.add('hidden');
        kosong.classList.remove('hidden');
        return;
    }
    kontainer.classList.remove('hidden');
    kosong.classList.add('hidden');
    kontainer.innerHTML = '';
    let omzet = 0, pending = 0;
    [...data].reverse().forEach(order => {
        const idOrder = order["id order"] || order["id_order"] || "-";
        const tanggal = order["tanggal"] || "-";
        const nama = order["nama pelanggan"] || "-";
        const email = order["email pelanggan"] || "-";
        const wa = order["nomor whatsapp"] || "-";
        const item = order["item belanja"] || "-";
        const total = Number(order["total bayar"] || 0);
        const metode = order["metode pembayaran"] || "-";
        const status = (order["status"] || "Pending").trim();
        const bukti = order["bukti pembayaran"] || "";
        if (status.toLowerCase() === 'sukses' || status.toLowerCase() === 'selesai') omzet += total;
        else if (status.toLowerCase() === 'pending') pending++;
        let badgeClass = "bg-amber-50 text-amber-600 border-amber-100";
        if (status.toLowerCase() === 'sukses' || status.toLowerCase() === 'selesai') badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
        else if (status.toLowerCase() === 'gagal' || status.toLowerCase() === 'batal') badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
        kontainer.innerHTML += `
        <div class="card-item-admin bg-white rounded-2xl p-4.5 border border-slate-100 shadow-2xs space-y-3.5" data-search="${idOrder} ${nama}">
            <div class="flex justify-between items-start border-b border-slate-50 pb-2.5">
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Order</span>
                    <span class="text-xs font-extrabold text-slate-900 block">${idOrder}</span>
                    <span class="text-[10px] text-slate-400">${tanggal}</span>
                </div>
                <span class="text-[10px] font-bold px-2 py-1 rounded-lg border uppercase ${badgeClass}">${status}</span>
            </div>
            <div class="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1">
                <p class="font-bold text-slate-800">Nama: ${nama}</p>
                <p class="text-slate-700">Email: ${email}</p>
                <p class="text-slate-800">WhatsApp: ${wa}</p>
            </div>
            <div class="grid grid-cols-2 gap-3 text-[11px]">
                <div class="bg-slate-50 p-2.5 rounded-xl"><span class="text-[9px] text-slate-400 font-bold block">Item Belanja</span><p class="font-bold text-slate-700">${item}</p></div>
                <div class="bg-slate-50 p-2.5 rounded-xl"><span class="text-[9px] text-slate-400 font-bold block">Total Bayar</span><p class="text-sm font-black text-orange-600">${formatRupiah(total)}</p></div>
            </div>
            <div class="flex gap-2 pt-1 items-center justify-between border-t border-slate-50 mt-1 text-[11px]">
                <div>${bukti.length > 50 ? `<button onclick="bukaPratinjau('${bukti}')" class="font-bold text-orange-600 cursor-pointer bg-orange-50 px-2.5 py-1.5 rounded-lg">Lihat Bukti</button>` : '<span class="text-slate-400 italic">Tanpa Gambar</span>'}</div>
                ${status.toLowerCase() === 'pending' ? `
                <div class="flex gap-1.5">
                    <button onclick="updateStatus('${idOrder}', 'Gagal')" class="bg-rose-50 text-rose-600 font-bold px-3 py-1.5 rounded-lg border border-rose-100 cursor-pointer">Tolak</button>
                    <button onclick="updateStatus('${idOrder}', 'Sukses')" class="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer">Setujui</button>
                </div>` : ''}
            </div>
        </div>`;
    });
    document.getElementById('stat-omzet').innerText = formatRupiah(omzet);
    document.getElementById('stat-pending').innerText = `${pending} Order`;
}

function filterTabelOrderAdmin() {
    const keyword = document.getElementById('input-cari-admin').value.toLowerCase();
    document.querySelectorAll('.card-item-admin').forEach(card => {
        card.classList.toggle('hidden', !card.getAttribute('data-search').includes(keyword));
    });
}

function bukaPratinjau(src) {
    const modal = document.getElementById('img-modal');
    document.getElementById('img-target-preview').src = src;
    modal.classList.remove('opacity-0', 'pointer-events-none');
}
function tutupPratinjauGambar() {
    document.getElementById('img-modal').classList.add('opacity-0', 'pointer-events-none');
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