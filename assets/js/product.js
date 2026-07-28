let semuaProduk = [];
let kategoriAktif = "semua";
let kataKunciCari = "";

async function muatKatalog() {
    semuaProduk = await ambilProdukDariServer();
    buatMenuKategori();
    tampilkanProduk();
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('katalog-produk').classList.remove('hidden');
}

function buatMenuKategori() {
    const container = document.getElementById('kategori-container');
    if (!container) return;
    const kategoriSet = new Set(semuaProduk.map(p => p.kategori).filter(Boolean));
    const daftarKategori = ["Semua", ...kategoriSet];
    container.innerHTML = '';
    daftarKategori.forEach(kat => {
        const isActive = kat.toLowerCase() === kategoriAktif;
        const btn = document.createElement('button');
        btn.className = `tab-btn px-4 py-2 rounded-xl text-[13px] transition shrink-0 leading-none cursor-pointer ${
            isActive ? 'bg-slate-900 text-white font-bold shadow-sm' : 'bg-white text-slate-500 border border-gray-200/80 font-semibold hover:bg-slate-50'
        }`;
        btn.innerText = kat;
        btn.onclick = () => {
            kategoriAktif = kat.toLowerCase();
            buatMenuKategori();
            tampilkanProduk();
        };
        container.appendChild(btn);
    });
}

function tampilkanProduk() {
    const container = document.getElementById('katalog-produk');
    if (!container) return;
    container.innerHTML = '';
    let urutan = 0;
    const filtered = semuaProduk.filter(p => {
        if (p.status.toLowerCase() !== 'aktif') return false;
        if (kategoriAktif !== 'semua' && p.kategori.toLowerCase() !== kategoriAktif) return false;
        if (kataKunciCari && !p.nama.toLowerCase().includes(kataKunciCari)) return false;
        return true;
    });
    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-400 col-span-2 py-12">Tidak ada produk ditemukan.</p>';
        return;
    }
    filtered.forEach(produk => {
        const hargaFinal = produk.diskon > 0 ? produk.harga - (produk.harga * (produk.diskon / 100)) : produk.harga;
        const badgeDiskon = produk.diskon > 0 ? `<span class="absolute top-2 left-2 bg-red-500 text-white text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm z-20">${produk.diskon}% OFF</span>` : '';
        const hargaHtml = produk.diskon > 0
            ? `<div class="flex flex-col"><span class="text-[10px] text-slate-400 line-through font-medium leading-none mb-0.5">${formatRupiah(produk.harga)}</span><span class="text-[15px] font-extrabold text-slate-900 tracking-tight leading-none">${formatRupiah(hargaFinal)}</span></div>`
            : `<span class="text-[15px] font-extrabold text-slate-900 tracking-tight leading-none">${formatRupiah(hargaFinal)}</span>`;

        // === TOMBOL BELI DENGAN PARAMETER DISKON ===
        const tombolBeliHtml = `<button onclick="tambahKeKeranjang(event, '${produk.id}', '${produk.nama}', ${hargaFinal}, '${produk.foto}', '${produk.kategori}', ${produk.harga}, ${produk.diskon})" class="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center shrink-0 aspect-square hover:bg-orange-700 active:scale-90 active:shadow-none hover:shadow-md hover:shadow-orange-600/20 transition-all duration-150 relative z-20 cursor-pointer"><span class="material-icons-round text-[15px]">shopping_bag</span></button>`;
        const linkDetail = `view.html?id=${produk.id}`;
        let cardStyle = "col-span-1";
        let innerHtml = '';

        if (urutan === 0) {
            cardStyle = "col-span-2";
            innerHtml = `<div onclick="window.location.href='${linkDetail}'" class="w-full h-56 sm:h-72 relative overflow-hidden bg-slate-100 z-10">${badgeDiskon}<img src="${produk.foto}" alt="${produk.nama}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>
                <div class="p-4 pt-3.5 flex justify-between items-end gap-4 relative z-10">
                    <div onclick="window.location.href='${linkDetail}'" class="min-w-0"><span class="text-[9.5px] font-extrabold uppercase tracking-widest text-orange-600 mb-1 block">${produk.kategori}</span><h3 class="font-bold text-slate-900 text-[16px] leading-snug line-clamp-1">${produk.nama}</h3><p class="text-slate-500 text-[12px] mt-1 line-clamp-1 font-medium">${produk.deskripsi}</p><div class="mt-2.5">${hargaHtml}</div></div>
                    ${tombolBeliHtml.replace('w-8 h-8', 'w-10 h-10').replace('text-[15px]', 'text-[18px]')}
                </div>`;
        } else if (urutan === 2) {
            cardStyle = "col-span-2 flex-row items-center p-3 gap-4";
            innerHtml = `<div onclick="window.location.href='${linkDetail}'" class="w-28 h-24 relative rounded-xl overflow-hidden bg-slate-100 shrink-0 z-10">${badgeDiskon}<img src="${produk.foto}" alt="${produk.nama}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>
                <div class="flex flex-col justify-between flex-1 min-w-0 h-full py-1 relative z-10">
                    <div onclick="window.location.href='${linkDetail}'"><span class="text-[9px] font-extrabold uppercase tracking-widest text-orange-600 block mb-0.5">${produk.kategori}</span><h3 class="font-bold text-slate-900 text-[14px] leading-snug line-clamp-1">${produk.nama}</h3></div>
                    <div class="flex items-center justify-between mt-2">${hargaHtml}${tombolBeliHtml}</div>
                </div>`;
        } else {
            cardStyle = "col-span-1";
            innerHtml = `<div onclick="window.location.href='${linkDetail}'" class="w-full h-36 sm:h-44 relative overflow-hidden bg-slate-100 z-10">${badgeDiskon}<img src="${produk.foto}" alt="${produk.nama}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>
                <div class="p-3.5 pt-2.5 relative z-10 flex-1 flex flex-col justify-between">
                    <div onclick="window.location.href='${linkDetail}'"><span class="text-[9px] font-bold tracking-widest uppercase text-slate-400 block mb-1">${produk.kategori}</span><h3 class="font-bold text-slate-800 text-[13px] leading-snug line-clamp-2">${produk.nama}</h3></div>
                    <div class="flex items-center justify-between mt-3">${hargaHtml}${tombolBeliHtml}</div>
                </div>`;
        }

        const card = document.createElement('div');
        card.className = `bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between active:scale-[0.98] transition-all duration-200 cursor-pointer m-0 group ${cardStyle}`;
        card.innerHTML = innerHtml + '<div class="absolute -right-8 -bottom-8 w-24 h-24 bg-slate-50 rounded-full pointer-events-none group-hover:bg-orange-50/50 transition-colors duration-300"></div>';
        container.appendChild(card);
        urutan++;
    });
    perbaruiBadgeKatalog();
}

window.cariProduk = function(keyword) {
    kataKunciCari = keyword.toLowerCase();
    tampilkanProduk();
};