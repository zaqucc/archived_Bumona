// ==========================================================================
// 1. KONFIGURASI GLOBAL (URL RELEVAN DENGAN DEPLOYMENT APPS SCRIPT ANDA)
// ==========================================================================
const api_url = "https://script.google.com/macros/s/AKfycbzm2gB_bDrY5h_8qXmfU4Y-ANHeCWTUEAU6LJ08LDKOyA2-n9pumVVpzpXNi_2QmwJD7w/exec";

const nomor_wa = "6281234567890"; 
const url_instagram = "https://instagram.com/archived.bumona";
const url_tiktok = "https://tiktok.com/@archived.bumona";
const url_youtube = "https://youtube.com/@archived.bumona";

const API_URL_APPS_SCRIPT = api_url;
const NOMOR_WA = nomor_wa;

// ==========================================================================
// 2. FUNGSI UTILITAS FORMAT MATA UANG RUPIAH
// ==========================================================================
function format_rupiah(angka) {
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(angka) || 0);
    } catch (e) {
        return "Rp " + (angka || 0);
    }
}
function formatRupiah(angka) { return format_rupiah(angka); }

// ==========================================================================
// 3. FUNGSI UTILITAS KONVERSI FILE GAMBAR KE BASE64
// ==========================================================================
function konversi_ke_base64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// ==========================================================================
// 4. SINKRONISASI DATABASE KATALOG PRODUK (UNTUK INDEX.HTML DARI SHEET1)
// ==========================================================================
async function ambil_database_produk() {
    try {
        const response = await fetch(`${api_url}?get_katalog=true`);
        if (!response.ok) throw new Error("Respon jaringan bermasalah");
        
        const data_mentah = await response.json();
        
        if (Array.isArray(data_mentah) && data_mentah.length > 0) {
            const data_terjemahan = data_mentah.map(item => {
                if (!item) return null;
                return {
                    id: item["id produk"] || item["id_produk"] || item["id"] || "",
                    nama: item["nama produk"] || item["nama_produk"] || item["nama"] || "Produk Tanpa Nama",
                    kategori: item["kategori"] || "General",
                    harga: Number(item["harga"]) || 0,
                    status: item["status"] || "aktif",
                    deskripsi: item["deskripsi"] || "Produk digital pilihan terbaik Archived bumona.",
                    diskon: Number(item["diskon"]) || 0,
                    foto: item["foto 1"] || item["foto_1"] || item["foto"] || "https://placehold.co/300x300?text=No+Image",
                    foto_1: item["foto 1"] || item["foto_1"] || "",
                    foto_2: item["foto 2"] || item["foto_2"] || "",
                    foto_3: item["foto 3"] || item["foto_3"] || "",
                    foto_4: item["foto 4"] || item["foto_4"] || "",
                    foto_5: item["foto 5"] || item["foto_5"] || "",
                    video: item["video preview"] || item["video_preview"] || "",
                    file: item["file"] || "",
                    tipe_pengiriman: item["tipe pengiriman"] || item["tipe_pengiriman"] || "",
                    jumlah_terjual: Number(item["jumlah terjual"]) || Number(item["jumlah_terjual"]) || 0
                };
            }).filter(Boolean);

            sessionStorage.setItem("database_produk_bumona", JSON.stringify(data_terjemahan));
            return data_terjemahan;
        }
        return [];
    } catch (error) {
        console.error("Detail log kegagalan fetch:", error);
        const cache_lama = sessionStorage.getItem("database_produk_bumona");
        if (cache_lama) {
            return JSON.parse(cache_lama);
        }
        return []; 
    }
}
function ambilDataProduk() { return ambil_database_produk(); }
