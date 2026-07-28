document.addEventListener('DOMContentLoaded', () => {
    // Sisipkan toast & modal
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
            window.open(`https://wa.me/${NOMOR_WA}?text=Halo Luki, saya ingin bertanya tentang produk digital Anda.`, '_blank');
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

    const path = window.location.pathname;

    // INDEX
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        if (typeof muatKatalog === 'function') muatKatalog();
    }

    // VIEW PRODUK (dengan diskon & multi-media)
    if (path.includes('view.html')) {
        async function muatSpesifikasiProduk() {
            const idTarget = new URLSearchParams(window.location.search).get('id');
            if (!idTarget) {
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('error-box').classList.remove('hidden');
                return;
            }
            try {
                const response = await fetch(`${API_KATALOG}?get_katalog=true`);
                const semua = await response.json();
                const produk = semua.find(p => {
                    const id = p["id produk"] || p["id_produk"] || p["id"] || '';
                    return id.toString().trim() === idTarget.trim();
                });
                if (!produk) throw new Error("Tidak ditemukan");

                const mediaSlots = [];
                for (let i = 1; i <= 5; i++) {
                    const key = `foto_${i}`;
                    const url = produk[key] || produk[`foto ${i}`] || '';
                    if (url && url.trim() !== '') {
                        mediaSlots.push({ type: 'image', url: url.trim() });
                    }
                }
                const videoUrl = produk["video preview"] || produk["video"] || '';
                if (videoUrl && videoUrl.trim() !== '') {
                    const patterns = [
                        /(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#\&\?]{11})/,
                        /^[a-zA-Z0-9_-]{11}$/
                    ];
                    let videoId = null;
                    for (const pat of patterns) {
                        const match = videoUrl.match(pat);
                        if (match) {
                            videoId = match[1] || match[0];
                            break;
                        }
                    }
                    if (videoId) {
                        mediaSlots.push({
                            type: 'video',
                            embedUrl: `https://www.youtube.com/embed/${videoId}`,
                            thumbUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`
                        });
                    }
                }
                if (mediaSlots.length === 0) {
                    mediaSlots.push({ type: 'image', url: 'https://placehold.co/600x400?text=No+Media' });
                }

                window.detailProdukView = {
                    id: produk["id produk"] || produk["id_produk"] || produk["id"],
                    nama: produk["nama produk"] || produk["nama_produk"] || "Tanpa Nama",
                    kategori: produk["kategori"] || "Digital",
                    deskripsi: produk["deskripsi"] || "Tidak ada deskripsi.",
                    harga: Number(produk["harga"]) || 0,
                    diskon: Number(produk["diskon"]) || 0,
                    hargaFinal: (Number(produk["harga"]) || 0) * (1 - (Number(produk["diskon"]) || 0) / 100),
                    fotoUtama: mediaSlots[0].type === 'image' ? mediaSlots[0].url : mediaSlots[0].thumbUrl,
                    foto: mediaSlots.filter(m => m.type === 'image').map(m => m.url)
                };

                document.getElementById('prod-nama').innerText = window.detailProdukView.nama;
                document.getElementById('prod-kategori').innerText = window.detailProdukView.kategori.toUpperCase();
                document.getElementById('prod-deskripsi').innerText = window.detailProdukView.deskripsi;
                document.getElementById('prod-harga-final').innerText = formatRupiah(window.detailProdukView.hargaFinal);
                if (window.detailProdukView.diskon > 0) {
                    document.getElementById('prod-harga-asli').classList.remove('hidden');
                    document.getElementById('prod-harga-asli').innerText = formatRupiah(window.detailProdukView.harga);
                    document.getElementById('prod-diskon-badge').classList.remove('hidden');
                    document.getElementById('prod-diskon-badge').innerText = `${window.detailProdukView.diskon}% OFF`;
                }

                const track = document.getElementById('media-carousel-track');
                const thumbTrack = document.getElementById('thumbnail-track');
                track.innerHTML = ''; thumbTrack.innerHTML = '';

                mediaSlots.forEach((media, idx) => {
                    const slide = document.createElement('div');
                    slide.id = `slide-item-${idx}`;
                    slide.className = "w-full shrink-0 snap-start flex items-center justify-center min-h-[240px]";
                    if (media.type === 'image') {
                        slide.innerHTML = `<img src="${media.url}" class="w-full h-auto block select-none" onerror="this.onerror=null;this.src='https://placehold.co/300x300?text=No+Image';">`;
                    } else {
                        slide.innerHTML = `<div class="w-full aspect-video bg-black flex items-center justify-center"><iframe class="w-full h-full border-0" src="${media.embedUrl}?mute=1" allowfullscreen></iframe></div>`;
                    }
                    track.appendChild(slide);

                    const thumb = document.createElement('button');
                    thumb.className = "thumb-item-box w-11 h-11 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 relative shrink-0 transition-all cursor-pointer";
                    const thumbSrc = media.type === 'image' ? media.url : media.thumbUrl;
                    thumb.innerHTML = `<img src="${thumbSrc}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/50x50?text=No+Image';">${media.type === 'video' ? '<div class="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><span class="material-icons-round text-[16px]">play_circle</span></div>' : ''}`;
                    thumb.onclick = () => document.getElementById(`slide-item-${idx}`).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                    thumbTrack.appendChild(thumb);
                });

                const updateIndicator = () => {
                    const scrollLeft = track.scrollLeft;
                    const slideWidth = track.clientWidth;
                    const current = Math.round(scrollLeft / slideWidth);
                    document.getElementById('carousel-indicator-badge').innerText = `${current + 1} / ${mediaSlots.length}`;
                    document.querySelectorAll('.thumb-item-box').forEach((box, i) => {
                        box.classList.toggle('border-orange-600', i === current);
                        box.classList.toggle('border-slate-200', i !== current);
                        box.classList.toggle('ring-2', i === current);
                        box.classList.toggle('ring-orange-100', i === current);
                    });
                };
                track.addEventListener('scroll', updateIndicator);
                updateIndicator();

                document.getElementById('loading').classList.add('hidden');
                document.getElementById('konten-produk').classList.remove('hidden');
                perbaruiBadgeKatalog();
            } catch (e) {
                console.error(e);
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('error-box').classList.remove('hidden');
            }
        }
        muatSpesifikasiProduk();

        window.masukKeKeranjangSistem = function() {
            const p = window.detailProdukView;
            if (!p) return;
            let keranjang = JSON.parse(localStorage.getItem('keranjang_bumona')) || [];
            const index = keranjang.findIndex(item => item.id_produk === p.id);
            if (index > -1) {
                keranjang[index].quantity = (keranjang[index].quantity || 1) + 1;
            } else {
                keranjang.push({
                    id_produk: p.id,
                    nama: p.nama,
                    harga: p.hargaFinal,
                    hargaAsli: p.harga,     // ✅ HARGA ASLI
                    diskon: p.diskon,       // ✅ PERSEN DISKON
                    foto: p.fotoUtama,
                    kategori: p.kategori,
                    quantity: 1
                });
            }
            localStorage.setItem('keranjang_bumona', JSON.stringify(keranjang));
            perbaruiBadgeKatalog();
            tampilkanToast(`"${p.nama}" ditambahkan ke keranjang.`, 'success');
            document.getElementById('btn-tambah-keranjang')?.classList.add('animasi-klik');
            setTimeout(() => { window.location.href = 'keranjang.html'; }, 250);
        };
    }

    // KERANJANG
    if (path.includes('keranjang.html')) {
        if (typeof muatHalamanKeranjang === 'function') muatHalamanKeranjang();
    }

    // ADMIN
    if (path.includes('admin.html')) {
        window.verifikasiLoginAdmin = function() {
            const pass = document.getElementById('pass-admin').value;
            const btn = document.querySelector('#login-modal button');
            if (btn) {
                btn.classList.add('animasi-klik');
                setTimeout(() => btn.classList.remove('animasi-klik'), 300);
            }
            if (pass === ADMIN_PASSWORD) {
                setTimeout(() => {
                    document.getElementById('login-modal').classList.add('hidden');
                    document.getElementById('admin-dashboard-layout').classList.remove('hidden');
                    if (typeof muatDataAdmin === 'function') muatDataAdmin();
                }, 200);
            } else {
                tampilkanToast('Password salah!', 'error');
            }
        };
    }

    // RIWAYAT
    if (path.includes('riwayat.html')) {
        // tidak ada auto-load
    }

    // SUKSES
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