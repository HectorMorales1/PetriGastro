(function() {
  'use strict';

  const cart = {};
  let cartCount = 0;
  let currentPlate = null;
  let currentQty = 1;

  const reservationForm = document.getElementById('reservationForm');
  const orderBtn = document.getElementById('orderBtn');

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initFilters();
    initPlateClick();
    initCartButton();
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

  function initPlateClick() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
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
    
    if (cart[name]) {
      cart[name].quantity += currentQty;
    } else {
      cart[name] = { price: price, quantity: currentQty };
    }
    
    updateCartButton();
    closePlateModal();
  };

  function closePlateModal() {
    document.getElementById('plateModal').style.display = 'none';
    currentPlate = null;
    currentQty = 1;
  }

  window.closePlateModal = closePlateModal;

  function updateCartButton() {
    if (!orderBtn) return;
    
    cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount > 0) {
      orderBtn.classList.add('show');
      const total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      orderBtn.querySelector('span').textContent = `Finalizar Pedido (€${total.toFixed(2)})`;
    } else {
      orderBtn.classList.remove('show');
    }
  }

  function initCartButton() {
    // Botón ya hace submitOrder() onclick
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
      
      alert('¡Pedido enviado! Teredirectaremos a WhatsApp para confirmar.');
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