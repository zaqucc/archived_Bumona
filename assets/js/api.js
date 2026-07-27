// api.js - Semua Panggilan API (Menggunakan API_KATALOG dan API_TRANSAKSI)

async function ambilProdukDariServer() {
    try {
        const response = await fetch(`${API_KATALOG}?get_katalog=true`);
        if (!response.ok) throw new Error("Jaringan bermasalah");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            const hasil = data.map(item => ({
                id: item["id produk"] || item["id_produk"] || item["id"] || "",
                nama: item["nama produk"] || item["nama_produk"] || item["nama"] || "Tanpa Nama",
                kategori: item["kategori"] || "General",
                harga: Number(item["harga"]) || 0,
                status: item["status"] || "aktif",
                deskripsi: item["deskripsi"] || "Deskripsi tidak tersedia.",
                diskon: Number(item["diskon"]) || 0,
                foto: item["foto 1"] || item["foto_1"] || "https://placehold.co/300x300?text=No+Image",
                foto_2: item["foto 2"] || "",
                foto_3: item["foto 3"] || "",
                foto_4: item["foto 4"] || "",
                foto_5: item["foto 5"] || "",
                video: item["video preview"] || "",
                file: item["file"] || "",
                tipe_pengiriman: item["tipe pengiriman"] || "",
                jumlah_terjual: Number(item["jumlah terjual"]) || 0
            })).filter(Boolean);
            sessionStorage.setItem("cache_produk", JSON.stringify(hasil));
            return hasil;
        }
        return [];
    } catch (error) {
        console.error("Gagal fetch katalog:", error);
        const cache = sessionStorage.getItem("cache_produk");
        return cache ? JSON.parse(cache) : [];
    }
}

async function kirimTransaksi(data) {
    const params = new URLSearchParams({
        simpan_transaksi: "true",
        id_order: data.id_order,
        nama_pelanggan: data.nama_pelanggan,
        email_pelanggan: data.email_pelanggan,
        nomor_whatsapp: data.nomor_whatsapp,
        item_belanja: data.item_belanja,
        total_bayar: data.total_bayar,
        metode_pembayaran: data.metode_pembayaran,
        bukti_pembayaran: data.bukti_pembayaran
    }).toString();

    const url = `${API_TRANSAKSI}?${params}`;
    const response = await fetch(url);
    const text = await response.text();
    let hasil;
    try {
        hasil = JSON.parse(text);
    } catch (e) {
        throw new Error("Respons bukan JSON: " + text);
    }
    if (hasil && hasil.status === 'success') {
        return hasil;
    } else {
        throw new Error(hasil.message || "Gagal menyimpan");
    }
}

async function ambilRiwayat(email) {
    const response = await fetch(`${API_TRANSAKSI}?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Gagal mengambil riwayat");
    return await response.json();
}

async function tarikDataAdmin() {
    const response = await fetch(`${API_TRANSAKSI}?admin_pull=true`);
    if (!response.ok) throw new Error("Gagal tarik data admin");
    return await response.json();
}

async function updateStatusOrder(idOrder, statusBaru) {
    const params = new URLSearchParams({
        update_status: "true",
        id_order: idOrder,
        status: statusBaru
    }).toString();
    const url = `${API_TRANSAKSI}?${params}`;
    const response = await fetch(url);
    return await response.json();
}