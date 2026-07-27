async function cariRiwayatTransaksi() {
    const email = document.getElementById('input-email-lacak').value.trim();
    if (!email) { tampilkanToast("Masukkan email Anda.", "error"); return; }
    const loading = document.getElementById('status-loading');
    const kosong = document.getElementById('riwayat-kosong');
    const list = document.getElementById('kontainer-list-riwayat');
    loading.classList.remove('hidden');
    kosong.classList.add('hidden');
    list.classList.add('hidden');
    try {
        const data = await ambilRiwayat(email);
        loading.classList.add('hidden');
        if (!Array.isArray(data) || data.length === 0) {
            kosong.innerHTML = `<span class="material-icons-round text-rose-400 text-5xl mb-2.5">sentiment_dissatisfied</span><p class="text-slate-800 font-bold text-sm">Data Tidak Ditemukan</p><p class="text-[11px] text-slate-400">Tidak ada riwayat dengan email: <b>${email}</b></p>`;
            kosong.classList.remove('hidden');
            return;
        }
        list.innerHTML = '';
        data.reverse().forEach(order => {
            const idOrder = order["id order"] || order["id_order"] || "-";
            const tanggal = order["tanggal"] || "-";
            const item = order["item belanja"] || "-";
            const total = Number(order["total bayar"] || 0);
            const metode = order["metode pembayaran"] || "-";
            const status = (order["status"] || "Pending").trim();
            let badgeClass = "bg-amber-50 text-amber-600 border-amber-100";
            if (status.toLowerCase() === 'sukses' || status.toLowerCase() === 'selesai') badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
            else if (status.toLowerCase() === 'gagal' || status.toLowerCase() === 'batal') badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
            list.innerHTML += `
            <div class="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-2xs space-y-3.5">
                <div class="flex justify-between items-start border-b border-slate-50 pb-2.5">
                    <div><span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Transaksi</span><span class="text-xs font-extrabold text-slate-900">${idOrder}</span></div>
                    <span class="text-[10px] font-bold px-2 py-1 rounded-lg border ${badgeClass}">${status.toUpperCase()}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Barang</span>
                    <p class="text-xs font-bold text-slate-800 leading-relaxed">${item}</p>
                </div>
                <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px] border border-slate-100/50">
                    <div><span class="text-[9.5px] text-slate-400 font-medium block">Tanggal Pembelian</span><span class="font-bold text-slate-700">${tanggal}</span></div>
                    <div><span class="text-[9.5px] text-slate-400 font-medium block">Metode Bayar</span><span class="font-bold text-slate-700 truncate">${metode}</span></div>
                </div>
                <div class="flex justify-between items-center pt-1">
                    <span class="text-xs text-slate-400 font-medium">Total Pembayaran</span>
                    <span class="text-sm font-extrabold text-orange-600">${formatRupiah(total)}</span>
                </div>
            </div>`;
        });
        list.classList.remove('hidden');
        tampilkanToast("Riwayat berhasil dimuat.", "success");
    } catch (err) {
        console.error(err);
        loading.classList.add('hidden');
        kosong.classList.remove('hidden');
        tampilkanToast("Gagal mengambil data.", "error");
    }
}