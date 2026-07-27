function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
}

function konversiKeBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function kompresGambar(file, maxWidth = 300, quality = 0.4) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

let toastTimer = null;
function tampilkanToast(pesan, tipe = 'info') {
    const toast = document.getElementById('custom-toast');
    if (!toast) return;
    const msg = document.getElementById('toast-message');
    const iconBox = document.getElementById('toast-icon-box');
    const icon = document.getElementById('toast-icon');
    const title = document.getElementById('toast-title');
    msg.innerText = pesan;
    if (tipe === 'success') {
        title.innerText = "Sukses";
        iconBox.className = "w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0";
        icon.className = "bi bi-check-circle-fill text-[16px]";
    } else if (tipe === 'error') {
        title.innerText = "Gagal";
        iconBox.className = "w-8 h-8 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center shrink-0";
        icon.className = "bi bi-exclamation-circle-fill text-[16px]";
    } else {
        title.innerText = "Info";
        iconBox.className = "w-8 h-8 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center shrink-0";
        icon.className = "bi bi-info-circle-fill text-[16px]";
    }
    clearTimeout(toastTimer);
    toast.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
    toast.classList.add('opacity-100', 'scale-100', 'translate-y-2');
    toastTimer = setTimeout(() => {
        toast.classList.remove('opacity-100', 'scale-100', 'translate-y-2');
        toast.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
    }, 3000);
}

function tampilkanModal(judul, pesan, jenis = 'info', callback = null) {
    const modal = document.getElementById('custom-modal');
    if (!modal) return;
    const mTitle = document.getElementById('modal-title');
    const mMsg = document.getElementById('modal-message');
    const mIconBox = document.getElementById('modal-icon-container');
    const mIcon = document.getElementById('modal-icon');
    const mBtn = document.getElementById('modal-btn');
    mTitle.innerText = judul;
    mMsg.innerText = pesan;
    if (jenis === 'success') {
        mIconBox.className = "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm bg-emerald-50 text-emerald-500";
        mIcon.innerText = "check_circle";
        mBtn.className = "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-xs";
    } else if (jenis === 'process') {
        mIconBox.className = "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm bg-orange-50 text-orange-600 animate-bounce";
        mIcon.innerText = "hourglass_top";
        mBtn.className = "w-full bg-slate-400 text-white font-bold text-xs py-3.5 rounded-xl pointer-events-none opacity-50 shadow-xs";
    } else {
        mIconBox.className = "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm bg-orange-50 text-orange-600";
        mIcon.innerText = "info";
        mBtn.className = "w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-xs";
    }
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.transform').classList.remove('scale-95');
    modal.querySelector('.transform').classList.add('scale-100');
    mBtn.onclick = function() {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.querySelector('.transform').classList.remove('scale-100');
        modal.querySelector('.transform').classList.add('scale-95');
        if (callback) callback();
    };
}