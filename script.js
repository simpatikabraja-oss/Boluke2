// Render Ikon Awal
feather.replace();

// Elemen UI
const navbarNav = document.querySelector('.navbar-nav');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const hamburger = document.querySelector('#hamburger-menu');
const searchBtn = document.querySelector('#search');

// Elemen Modal Keranjang
const cartBtn = document.querySelector('#shopping');
const cartModal = document.querySelector('#cart-modal');
const closeModal = document.querySelector('.close-modal');
const cartItemsContainer = document.querySelector('#cart-items-container');
const cartTotalPrice = document.querySelector('#cart-total-price');
const clearCartBtn = document.querySelector('#clear-cart-btn');
const cartCount = document.querySelector('#cart-count');

const menuCards = document.querySelectorAll('.menu-card');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

// Data Keranjang dari LocalStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fungsi memperbarui angka dan merender isi modal keranjang
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

        const itemHTML = `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>IDR ${subTotal.toLocaleString('id-ID')}</p>
                </div>
                <div class="cart-item-controls" style="display: flex; align-items: center; gap: 0.5rem;">
                    <button class="btn-minus" data-id="${item.id}" style="padding: 2px 8px; background: #ff4d4d; color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: bold;">-</button>
                    <span class="cart-item-qty" style="font-size: 1rem; font-weight: bold; padding: 0 5px;">${item.quantity}</span>
                    <button class="btn-plus" data-id="${item.id}" style="padding: 2px 8px; background: #2ecc71; color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
    });

    cartTotalPrice.innerText = `IDR ${totalHarga.toLocaleString('id-ID')}`;
    initCartControls();
}

// Mengatur kontrol tombol + dan - tanpa penumpukan event listener
function initCartControls() {
    const plusButtons = document.querySelectorAll('.btn-plus');
    const minusButtons = document.querySelectorAll('.btn-minus');

    plusButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', () => {
            const id = newButton.getAttribute('data-id');
            const item = cart.find(product => product.id === id);
            if (item) {
                item.quantity += 1;
                saveAndUpdateCart();
            }
        });
    });

    minusButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', () => {
            const id = newButton.getAttribute('data-id');
            const itemIndex = cart.findIndex(product => product.id === id);
            
            if (itemIndex !== -1) {
                cart[itemIndex].quantity -= 1;
                if (cart[itemIndex].quantity <= 0) {
                    cart.splice(itemIndex, 1);
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

updateCartUI();

// --- FITUR PENCARIAN REAL-TIME ---
searchInput.addEventListener('input', (e) => {
    const filterText = e.target.value.toLowerCase();
    
    menuCards.forEach(card => {
        const productName = card.getAttribute('data-name').toLowerCase();
        if (productName.includes(filterText)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// --- FITUR TAMBAH KE KERANJANG HALAMAN UTAMA ---
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
    });
});

// --- AKSI MODAL KERANJANG ---
cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.classList.add('active');
    navbarNav.classList.remove('active');
    searchForm.classList.remove('active');
});

closeModal.addEventListener('click', () => {
    cartModal.classList.remove('active');
});

clearCartBtn.addEventListener('click', () => {
    cart = [];
    saveAndUpdateCart();
});

// --- TOGGLE INTERFAKS NAVBAR ---
hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navbarNav.classList.toggle('active');
    searchForm.classList.remove('active');
});

searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchForm.classList.toggle('active');
    navbarNav.classList.remove('active');
    searchInput.focus();
});

// --- FITUR KIRIM EMAIL DI LATAR BELAKANG (FORMSPREE VIA FETCH) ---
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const submitBtn = contactForm.querySelector('.btn');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Mengirim...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        try {
            // !!! JANGAN LUPA GANTI KODE DI BAWAH INI DENGAN LINK FORMSPREE-MU !!!
            const response = await fetch('https://formspree.io/f/mrewbrjl', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert('Terima kasih! Biodata kamu berhasil dikirim.');
                contactForm.reset(); 
            } else {
                alert('Gagal mengirim biodata. Coba beberapa saat lagi.');
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi internet.');
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
    }
    if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('active');
    }
    if (!searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
        searchForm.classList.remove('active');
    }
});
