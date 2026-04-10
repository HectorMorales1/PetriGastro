(function() {
  'use strict';

  const cart = {};
  let cartOpen = false;
  let cartCount = 0;

  const reservationForm = document.getElementById('reservationForm');
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const cartCountEl = document.getElementById('cartCount');

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initFilters();
    initAddToCart();
    initCartPanel();
    initFormValidation();
    setMinDate();
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

  function initAddToCart() {
    const addButtons = document.querySelectorAll('.btn-add');
    
    addButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);
        
        if (cart[name]) {
          cart[name].quantity += 1;
        } else {
          cart[name] = { price: price, quantity: 1 };
        }
        
        updateCartButton();
        updateCartPanel();
      });
    });
  }

  function updateCartButton() {
    if (!cartBtn || !cartCountEl) return;
    
    cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount > 0) {
      cartBtn.classList.add('show');
      cartCountEl.textContent = cartCount;
    } else {
      cartBtn.classList.remove('show');
    }
  }

  function initCartPanel() {
    if (cartBtn && cartPanel) {
      cartBtn.addEventListener('click', () => {
        cartOpen = !cartOpen;
        cartPanel.classList.toggle('show', cartOpen);
      });
      
      const closeBtn = cartPanel.querySelector('.cart-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          cartPanel.classList.remove('show');
          cartOpen = false;
        });
      }
    }
  }

  function updateCartPanel() {
    if (!cartPanel) return;
    
    const items = Object.entries(cart);
    
    if (items.length === 0) {
      cartPanel.innerHTML = `
        <div class="cart-header">
          <h3>Tu Pedido</h3>
          <button class="cart-close">&times;</button>
        </div>
        <p class="cart-empty">No hay platos seleccionados</p>
      `;
      return;
    }
    
    let itemsHtml = '';
    items.forEach(([name, data]) => {
      const subtotal = data.price * data.quantity;
      itemsHtml += `
        <div class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-name">${name}</span>
            <span class="cart-item-qty">x${data.quantity} (€${data.price.toFixed(2)}/u)</span>
          </div>
          <div class="cart-item-total">€${subtotal.toFixed(2)}</div>
        </div>
      `;
    });
    
    const total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartPanel.innerHTML = `
      <div class="cart-header">
        <h3>Tu Pedido</h3>
        <button class="cart-close">&times;</button>
      </div>
      <div class="cart-items">
        ${itemsHtml}
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <span class="cart-total-amount">€${total.toFixed(2)}</span>
        </div>
        <button class="btn btn-primary btn-full" onclick="submitOrder()">Finalizar Pedido</button>
      </div>
    `;
    
    const closeBtn = cartPanel.querySelector('.cart-close');
    closeBtn.addEventListener('click', () => {
      cartPanel.classList.remove('show');
      cartOpen = false;
    });
  }

  function initFormValidation() {
    if (!reservationForm) return;
    
    window.submitOrder = function() {
      const items = Object.entries(cart);
      
      if (items.length === 0) {
        alert('Por favor, selecciona al menos un plato del menú.');
        return;
      }
      
      const formData = new FormData(reservationForm);
      const data = Object.fromEntries(formData);
      
      let pedidoTexto = '';
      let total = 0;
      items.forEach(([name, item]) => {
        const subtotal = item.price * item.quantity;
        pedidoTexto += `\n• ${name} x${item.quantity} = €${subtotal.toFixed(2)}`;
        total += subtotal;
      });
      
      const mensaje = `¡Nuevo pedido de ${data.name || 'Cliente'}!%0A%0ATeléfono: ${data.phone || 'No indicado'}%0AFecha: ${data.date || '-'}%0AHora: ${data.time || '-'}%0A%0APedido:${pedidoTexto}%0A%0ATOTAL: €${total.toFixed(2)}`;
      
      const whatsappUrl = `https://wa.me/34600123456?text=${mensaje}`;
      
      window.open(whatsappUrl, '_blank');
      
      reservationForm.reset();
      Object.keys(cart).forEach(key => delete cart[key]);
      updateCartButton();
      updateCartPanel();
      
      alert('¡Pedido enviado! Te redirectaremos a WhatsApp para confirmar.');
    };
    
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitOrder();
    });
  }

  function setMinDate() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    dateInput.setAttribute('min', minDate);
  }

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