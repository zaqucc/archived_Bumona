document.addEventListener('DOMContentLoaded', () => {
    // Toast & Modal insertion
    if (!document.getElementById('custom-toast')) {
        const toastHTML = `
        <div id="custom-toast" class="fixed top-5 left-1/2 -translate-x-1/2 z-50 transform scale-90 opacity-0 pointer-events-none transition-all duration-300 ease-out max-w-sm w-[90%] bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 p-4 flex items-center gap-3">
            <div id="toast-icon-box" class="w-8 h-8 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i id="toast-icon" class="bi bi-exclamation-circle-fill text-[16px]"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p id="toast-title" class="text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Pemberitahuan</p>
                <p id="toast-message" class="text-[12.5px] font-semibold text-slate-100 truncate leading-tight">Pesan...</p>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', toastHTML);
    }
    if (!document.getElementById('custom-modal')) {
        const modalHTML = `
        <div id="custom-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
            <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"></div>
            <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 transform scale-95 transition-all duration-300 flex flex-col items-center text-center">
                <div id="modal-icon-container" class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <span id="modal-icon" class="material-icons-round text-3xl">info</span>
                </div>
                <h3 id="modal-title" class="text-base font-extrabold text-slate-900 tracking-tight mb-2">Judul</h3>
                <p id="modal-message" class="text-xs font-medium text-slate-500 leading-relaxed mb-6">Deskripsi.</p>
                <button id="modal-btn" class="w-full text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-xs">Mengerti</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Sosmed links
    if (document.getElementById('link-instagram')) {
        document.getElementById('link-instagram').href = SOSMED.instagram;
        document.getElementById('link-tiktok').href = SOSMED.tiktok;
        document.getElementById('link-youtube').href = SOSMED.youtube;
        document.getElementById('drawer-instagram').href = SOSMED.instagram;
        document.getElementById('drawer-tiktok').href = SOSMED.tiktok;
        document.getElementById('drawer-youtube').href = SOSMED.youtube;
    }

    // Drawer
    window.bukaMenu = function() {
        const drawer = document.getElementById('drawer-menu');
        if (!drawer) return;
        const overlay = document.getElementById('drawer-overlay');
        const content = document.getElementById('drawer-content');
        drawer.classList.remove('pointer-events-none');
        overlay.classList.remove('bg-slate-950/0');
        overlay.classList.add('bg-slate-950/40');
        content.classList.remove('translate-x-72');
        content.classList.add('translate-x-0');
    };
    window.tutupMenu = function() {
        const drawer = document.getElementById('drawer-menu');
        if (!drawer) return;
        const overlay = document.getElementById('drawer-overlay');
        const content = document.getElementById('drawer-content');
        overlay.classList.remove('bg-slate-950/40');
        overlay.classList.add('bg-slate-950/0');
        content.classList.remove('translate-x-0');
        content.classList.add('translate-x-72');
        setTimeout(() => drawer.classList.add('pointer-events-none'), 300);
    };

    // WhatsApp
    let waTooltipVisible = false, waTooltipTimer = null;
    window.handleWaClick = function(event) {
        event.preventDefault();
        const tooltip = document.getElementById('wa-tooltip');
        if (!tooltip) return;
        if (!waTooltipVisible) {
            waTooltipVisible = true;
            tooltip.style.maxWidth = '220px';
            tooltip.style.opacity = '1';
            waTooltipTimer = setTimeout(() => {
                tooltip.style.maxWidth = '0'; tooltip.style.opacity = '0';
                waTooltipVisible = false;
            }, 3500);
        } else {
            clearTimeout(waTooltipTimer);
            tooltip.style.maxWidth = '0'; tooltip.style.opacity = '0';
            waTooltipVisible = false;
            const targetWA = typeof NOMOR_WA !== 'undefined' ? NOMOR_WA : '6281234567890';
            window.open(`https://wa.me/${targetWA}?text=Halo Luki, saya ingin bertanya tentang produk digital Anda.`, '_blank');
        }
    };
    document.addEventListener('click', function(e) {
        if (!document.getElementById('wa-floating')?.contains(e.target) && waTooltipVisible) {
            document.getElementById('wa-tooltip').style.maxWidth = '0';
            document.getElementById('wa-tooltip').style.opacity = '0';
            waTooltipVisible = false;
            clearTimeout(waTooltipTimer);
        }
    });

    // Halaman deteksi
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        if (typeof muatKatalog === 'function') muatKatalog();
    }
    if (path.includes('view.html')) {
        // muatSpesifikasiProduk() akan dipanggil di view.html, tapi kita pastikan
        if (typeof muatSpesifikasiProduk === 'function') muatSpesifikasiProduk();
    }
    if (path.includes('keranjang.html')) {
        if (typeof muatHalamanKeranjang === 'function') muatHalamanKeranjang();
    }
    if (path.includes('admin.html')) {
        window.verifikasiLoginAdmin = function() {
            const pass = document.getElementById('pass-admin').value;
            if (pass === ADMIN_PASSWORD) {
                document.getElementById('login-modal').classList.add('hidden');
                document.getElementById('admin-dashboard-layout').classList.remove('hidden');
                if (typeof muatDataAdmin === 'function') muatDataAdmin();
            } else {
                alert('Password salah!');
            }
        };
    }
    if (path.includes('sukses.html')) {
        const tx = JSON.parse(localStorage.getItem('checkout_terakhir'));
        if (!tx) { window.location.href = 'index.html'; return; }
        document.getElementById('inv-id').innerText = tx.id_invoice;
        document.getElementById('inv-tgl').innerText = tx.tanggal;
        document.getElementById('inv-total').innerText = formatRupiah(tx.total);
        document.getElementById('inv-items').innerHTML = tx.items.map(i => `<div class="flex justify-between"><span>${i.nama} <span class="text-[10px] text-slate-400 font-bold">x${i.quantity || 1}</span></span><span>${formatRupiah(i.harga * (i.quantity || 1))}</span></div>`).join('');
        window.kirimKeWa = function() {
            let teks = `*INVOICE PESANAN BARU*\n--------------------------------------\n*No Invoice:* ${tx.id_invoice}\n*Waktu:* ${tx.tanggal}\n\n*Detail Pelanggan:* (silahkan ditambahkan)\n\n*Daftar Produk Digital:*\n`;
            tx.items.forEach((i, idx) => { teks += `${idx + 1}. ${i.nama} (x${i.quantity || 1}) -> ${formatRupiah(i.harga * (i.quantity || 1))}\n`; });
            teks += `\n*Total Pembayaran:* ${formatRupiah(tx.total)}\n--------------------------------------\nMohon instruksi metode pembayaran digitalnya kak. Terima kasih!`;
            window.open(`https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(teks)}`, '_blank');
        };
    }
});