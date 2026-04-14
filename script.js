(function() {
  'use strict';

  const CART_KEY = 'artCart';
  let cart = {};
  let currentPlate = null;
  let currentQty = 1;

  const cartButton = document.getElementById('cartButton');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal = document.getElementById('cartTotal');
  const headerCartCount = document.getElementById('headerCartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const toastContainer = document.getElementById('toastContainer');

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initFilters();
    initCart();
    initAddToCart();
    initPlateClick();
    initModal();
  });

  function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');

    if (!navToggle || !nav) return;

    navToggle.addEventListener('click', () => {
      const navList = nav.querySelector('.nav-list');
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navList.classList.toggle('show');
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        
        menuItems.forEach(item => {
          if (category === 'all' || item.dataset.category === category) {
            item.classList.remove('hide');
          } else {
            item.classList.add('hide');
          }
        });
      });
    });
  }

  function initCart() {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch (e) {
        cart = {};
      }
    }
    updateCartUI();

    cartButton.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkout);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cartPanel.classList.contains('show')) {
        closeCart();
      }
    });
  }

  function openCart() {
    cartPanel.classList.add('show');
    cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartPanel.classList.remove('show');
    cartOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function updateCartUI() {
    const items = Object.entries(cart);
    const totalItems = items.reduce((sum, [, item]) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, [, item]) => sum + (item.price * item.quantity), 0);

    if (totalItems > 0) {
      headerCartCount.textContent = totalItems;
      headerCartCount.classList.add('show');
      cartEmpty.style.display = 'none';
      cartFooter.style.display = 'block';
      cartTotal.textContent = `€${totalPrice.toFixed(2)}`;

      cartItems.innerHTML = items.map(([name, item]) => `
        <div class="cart-item" data-name="${name}">
          <div class="cart-item-info">
            <div class="cart-item-name">${name}</div>
            <div class="cart-item-qty">Cantidad: ${item.quantity}</div>
          </div>
          <div class="cart-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${name.replace(/'/g, "\\'")}')" aria-label="Eliminar ${name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `).join('');
    } else {
      headerCartCount.textContent = '0';
      headerCartCount.classList.remove('show');
      cartEmpty.style.display = 'block';
      cartFooter.style.display = 'none';
      cartItems.innerHTML = '';
    }
  }

  window.addToCart = function(name, price) {
    if (cart[name]) {
      cart[name].quantity += 1;
    } else {
      cart[name] = { price: parseFloat(price), quantity: 1 };
    }
    saveCart();
    updateCartUI();
    showToast(`${name} añadido al pedido`, 'success');
  };

  window.removeFromCart = function(name) {
    if (cart[name]) {
      const itemName = name;
      delete cart[name];
      saveCart();
      updateCartUI();
      showToast(`${itemName} eliminado del pedido`, 'remove');
    }
  };

  function showToast(message, type = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function initAddToCart() {
    document.querySelectorAll('.btn-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        addToCart(name, price);
      });
    });
  }

  function checkout() {
    const items = Object.entries(cart);
    
    if (items.length === 0) {
      showToast('Añade platos al pedido primero', 'remove');
      return;
    }
    
    let pedidoTexto = '';
    let total = 0;
    items.forEach(([name, item]) => {
      const subtotal = item.price * item.quantity;
      pedidoTexto += `\n• ${name} x${item.quantity} = €${subtotal.toFixed(2)}`;
      total += subtotal;
    });
    
    const mensaje = `¡Nuevo pedido de PetriGastro!%0A%0APedido:${pedidoTexto}%0A%0ATOTAL: €${total.toFixed(2)}`;
    
    const whatsappUrl = `https://wa.me/34600123456?text=${mensaje}`;
    
    window.open(whatsappUrl, '_blank');
    
    cart = {};
    saveCart();
    updateCartUI();
    closeCart();
    
    showToast('¡Pedido enviado correctamente!', 'success');
  }

  function initPlateClick() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-add')) return;
        
        const name = item.querySelector('h3').textContent;
        const desc = item.querySelector('p').textContent;
        const price = item.querySelector('.menu-price').textContent;
        const img = item.querySelector('img').src;
        const tag = item.querySelector('.menu-tag').textContent;
        
        currentPlate = { name, price: parseFloat(price.replace('€', '')), tag };
        currentQty = 1;
        
        document.getElementById('plateModalImg').src = img;
        document.getElementById('plateModalTag').textContent = tag;
        document.getElementById('plateModalTitle').textContent = name;
        document.getElementById('plateModalDesc').textContent = desc;
        document.getElementById('plateModalPrice').textContent = price;
        document.getElementById('plateQty').textContent = currentQty;
        
        document.getElementById('plateModal').style.display = 'flex';
      });
    });
  }

  window.changeQty = function(delta) {
    currentQty += delta;
    if (currentQty < 1) currentQty = 1;
    if (currentQty > 10) currentQty = 10;
    
    document.getElementById('plateQty').textContent = currentQty;
    
    if (currentPlate) {
      const totalPrice = (currentPlate.price * currentQty).toFixed(2);
      document.getElementById('plateModalPrice').textContent = `€${totalPrice}`;
    }
  };

  window.addToCartFromModal = function() {
    if (!currentPlate) return;
    
    const name = currentPlate.name;
    const price = currentPlate.price;
    
    for (let i = 0; i < currentQty; i++) {
      addToCart(name, price);
    }
    
    closePlateModal();
  };

  function closePlateModal() {
    document.getElementById('plateModal').style.display = 'none';
    currentPlate = null;
    currentQty = 1;
  }

  window.closePlateModal = closePlateModal;

  function initModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    const modalClose = modal.querySelector('.modal-close');
    const modalImage = document.getElementById('modalImage');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        modalImage.src = img.src.replace('w=400&h=300', 'w=1200&h=800');
        modal.hidden = false;
        modal.classList.add('show');
      });
    });
    
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        modal.hidden = true;
        modal.classList.remove('show');
      });
    }
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.hidden = true;
        modal.classList.remove('show');
      }
    });
  }
})();
