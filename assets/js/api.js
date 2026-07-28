// ==========================================
// api.js – Konversi Link Google Drive + Diskon + API
// ==========================================

/**
 * Mengubah link Google Drive menjadi direct link usercontent
 * agar bisa ditampilkan di <img> tanpa CORS / blokir.
 */
function convertDriveLink(url) {
    if (!url || typeof url !== 'string') return '';

    let id = '';

    // Pola 1: /d/<FILE_ID>/
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) id = match[1];

    // Pola 2: /file/d/<FILE_ID>/
    if (!id) {
        match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) id = match[1];
    }

    // Pola 3: id=<FILE_ID>
    if (!id) {
        match = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) id = match[1];
    }

    if (id) {
        // Format usercontent – sudah Anda uji dan berhasil
        return `https://drive.usercontent.google.com/download?id=${id}&export=view`;
    }

    // Bukan link Google Drive → kembalikan apa adanya
    return url;
}

// ========== FUNGSI API ==========

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

                // Diskon – bersihkan & konversi otomatis
                diskon: (() => {
                    const raw = String(item["diskon"] || '0')
                        .replace(',', '.')
                        .replace(/[^0-9.]/g, '');
                    let val = parseFloat(raw) || 0;
                    if (val > 0 && val <= 1) val = val * 100; // desimal → persen
                    return val;
                })(),

                // Konversi semua kolom foto ke direct link
                foto: convertDriveLink(item["foto 1"] || item["foto_1"]) || "https://placehold.co/300x300?text=No+Image",
                foto_2: convertDriveLink(item["foto 2"] || item["foto_2"] || ""),
                foto_3: convertDriveLink(item["foto 3"] || item["foto_3"] || ""),
                foto_4: convertDriveLink(item["foto 4"] || item["foto_4"] || ""),
                foto_5: convertDriveLink(item["foto 5"] || item["foto_5"] || ""),

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