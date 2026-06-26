// Inisialisasi Feather Icons bawaan awal
feather.replace();

// Dom Selektor Utama UI
const navbar = document.querySelector('.navbar');
const navbarNav = document.querySelector('.navbar-nav');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const hamburger = document.querySelector('#hamburger-menu');
const searchBtn = document.querySelector('#search');

// Dom Selektor Komponen Modal Keranjang
const cartBtn = document.querySelector('#shopping');
const cartModal = document.querySelector('#cart-modal');
const closeModal = document.querySelector('.close-modal');
const cartItemsContainer = document.querySelector('#cart-items-container');
const cartTotalPrice = document.querySelector('#cart-total-price');
const checkoutWhatsappBtn = document.querySelector('#checkout-whatsapp-btn');
const clearCartBtn = document.querySelector('#clear-cart-btn');
const cartCount = document.querySelector('#cart-count');
const backToTop = document.querySelector('#backToTop');

const menuCards = document.querySelectorAll('.menu-card');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

// State Keranjang Belanja dari LocalStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- 1. FITUR UTAMA: TOAST NOTIFICATION ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    
    // Hapus elemen toast otomatis setelah 3 detik dari DOM
    setTimeout(() => { toast.remove(); }, 3000);
}

// --- 2. FITUR UTAMA: LOADING SCREEN & SCROLL ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.visibility = 'hidden'; }, 500);
});

// Efek Navbar Shadow & Tombol Back to Top Saat Di-scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- 3. FITUR UTAMA: ANIMASI SCROLL (Intersection Observer) ---
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.anim-scroll').forEach(el => scrollObserver.observe(el));

// --- 4. LOGIKA KONTROL UKURAN KERANJANG ---
function updateCartUI() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.innerText = totalItems;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Keranjang belanja kamu kosong!</p>';
        cartTotalPrice.innerText = 'IDR 0';
        return;
    }

    let totalHarga = 0;
    cart.forEach(item => {
        const subTotal = item.price * item.quantity;
        totalHarga += subTotal;

        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>IDR ${subTotal.toLocaleString('id-ID')}</p>
                </div>
                <div class="cart-item-controls" style="display: flex; align-items: center; gap: 0.5rem;">
                    <button class="btn-minus" data-id="${item.id}" style="padding: 2px 8px; background: #ff4d4d; color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="font-size: 1rem; font-weight: bold; padding: 0 5px;">${item.quantity}</span>
                    <button class="btn-plus" data-id="${item.id}" style="padding: 2px 8px; background: #2ecc71; color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </div>
        `;
    });

    cartTotalPrice.innerText = `IDR ${totalHarga.toLocaleString('id-ID')}`;
    initCartControls();
}

function initCartControls() {
    document.querySelectorAll('.btn-plus').forEach(button => {
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);
        newBtn.addEventListener('click', () => {
            const item = cart.find(p => p.id === newBtn.getAttribute('data-id'));
            if (item) { item.quantity += 1; saveAndUpdateCart(); showToast(`Jumlah ${item.name} ditambah!`); }
        });
    });

    document.querySelectorAll('.btn-minus').forEach(button => {
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);
        newBtn.addEventListener('click', () => {
            const id = newBtn.getAttribute('data-id');
            const index = cart.findIndex(p => p.id === id);
            if (index !== -1) {
                const name = cart[index].name;
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                    showToast(`${name} dihapus dari keranjang.`);
                } else {
                    showToast(`Jumlah ${name} dikurangi.`);
                }
                saveAndUpdateCart();
            }
        });
    });
}

function saveAndUpdateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Jalankan UI Update Pertama Kali
updateCartUI();

// Pencarian Real-Time Menu
searchInput.addEventListener('input', (e) => {
    const filterText = e.target.value.toLowerCase();
    menuCards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        card.style.display = name.includes(filterText) ? 'flex' : 'none';
    });
});

// Aksi Tambah Ke Keranjang dari Menu Utama
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'));
        const img = button.getAttribute('data-img');
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, img, quantity: 1 });
        }
        saveAndUpdateCart();
        showToast(`${name} dimasukkan ke keranjang!`);
    });
});

// Kontrol Navigasi & Modal Pop-Up
cartBtn.addEventListener('click', (e) => { e.preventDefault(); cartModal.classList.add('active'); navbarNav.classList.remove('active'); searchForm.classList.remove('active'); });
closeModal.addEventListener('click', () => cartModal.classList.remove('active'));
clearCartBtn.addEventListener('click', () => { cart = []; saveAndUpdateCart(); showToast('Semua isi keranjang telah dikosongkan!'); });

hamburger.addEventListener('click', (e) => { e.stopPropagation(); navbarNav.classList.toggle('active'); searchForm.classList.remove('active'); });
searchBtn.addEventListener('click', (e) => { e.stopPropagation(); searchForm.classList.toggle('active'); navbarNav.classList.remove('active'); searchInput.focus(); });

// Checkout via WhatsApp Link Generator
checkoutWhatsappBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert('Keranjang belanja kamu masih kosong!');
    
    // !!! SILAKAN GANTI NOMOR DI BAWAH INI DENGAN NOMOR HP TOKO-MU (AWALI KODE NEGARA 62) !!!
    const nomorWhatsApp = "6289670375440"; 
    let teksPesanan = "Halo braja yang ganteng 🥵🥵🥵🥵! Saya ingin memesan kue dengan rincian berikut:\n\n";
    let totalHarga = 0;

    cart.forEach((item, idx) => {
        const subTotal = item.price * item.quantity;
        totalHarga += subTotal;
        teksPesanan += `${idx + 1}. *${item.name}* (x${item.quantity}) - IDR ${subTotal.toLocaleString('id-ID')}\n`;
    });

    teksPesanan += `\n*Total Tagihan:* IDR ${totalHarga.toLocaleString('id-ID')}\n\nMohon info detail metode transfer. Terima kasih!`;
    window.open(`https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(teksPesanan)}`, '_blank');
});

// Kirim Form Kontak Otomatis ke Email (Formspree API)
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('.btn');
        submitBtn.innerText = 'Mengirim...'; submitBtn.disabled = true;

        try {
            // !!! SILAKAN GANTI TOKEN DI BAWAH INI DENGAN LINK ENDPOINT FORMSPREE KAMU !!!
            const response = await fetch('https://formspree.io/f/mrewbrjl', {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showToast('Terima kasih! Biodata sukses dikirim ke email.');
                contactForm.reset();
            } else {
                showToast('Gagal mengirim biodata.');
            }
        } catch {
            showToast('Terjadi kesalahan koneksi internet.');
        } finally {
            submitBtn.innerText = 'Kirim Pesan'; submitBtn.disabled = false;
        }
    });
}

// Tutup komponen jika klik di luar elemen luar modal
window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.classList.remove('active');
    if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) navbarNav.classList.remove('active');
    if (!searchBtn.contains(e.target) && !searchForm.contains(e.target)) searchForm.classList.remove('active');
});
