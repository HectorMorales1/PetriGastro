(function() {
  'use strict';

  const cart = [];
  const reservationForm = document.getElementById('reservationForm');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initFilters();
    initAddToCart();
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
        
        cart.push({ name, price });
        updateCartDisplay();
        
        this.innerHTML = '<i class="fas fa-check"></i>';
        this.style.background = 'var(--color-success)';
        
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-plus"></i>';
          this.style.background = '';
        }, 1000);
      });
    });
  }

  function updateCartDisplay() {
    if (cart.length === 0) {
      if (cartItemsEl) {
        cartItemsEl.innerHTML = '<p class="cart-empty">No hay platos seleccionados</p>';
      }
      if (cartTotalEl) {
        cartTotalEl.textContent = '€0.00';
      }
      return;
    }
    
    const html = cart.map((item, index) => `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>€${item.price.toFixed(2)}</span>
      </div>
    `).join('');
    
    if (cartItemsEl) {
      cartItemsEl.innerHTML = html;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (cartTotalEl) {
      cartTotalEl.textContent = `€${total.toFixed(2)}`;
    }
  }

  function initFormValidation() {
    if (!reservationForm) return;
    
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      
      const mensaje = `¡Nuevo pedido de ${data.name}!\n\nTeléfono: ${data.phone}\nFecha: ${data.date}\nHora: ${data.time}\nPedido: ${data.order || 'Sin detalles'}\nTotal estimado: €${total.toFixed(2)}`;
      
      const whatsappUrl = `https://wa.me/34600123456?text=${encodeURIComponent(mensaje)}`;
      
      window.open(whatsappUrl, '_blank');
      
      alert('¡Pedido enviado! Te redirectaremos a WhatsApp para confirmar.');
      
      this.reset();
      cart.length = 0;
      updateCartDisplay();
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