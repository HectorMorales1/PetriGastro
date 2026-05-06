(function() {
  'use strict';

  const CART_KEY = 'petriCart';
  const THEME_KEY = 'petriTheme';
  
  let cart = {};
  let currentSlide = 0;
  let autoplayInterval = null;

  const elements = {
    header: document.getElementById('header'),
    themeToggle: document.getElementById('themeToggle'),
    navToggle: document.getElementById('navToggle'),
    nav: document.getElementById('nav'),
    cartButton: document.getElementById('cartButton'),
    cartPanel: document.getElementById('cartPanel'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartClose: document.getElementById('cartClose'),
    cartItems: document.getElementById('cartItems'),
    cartEmpty: document.getElementById('cartEmpty'),
    cartFooter: document.getElementById('cartFooter'),
    cartTotal: document.getElementById('cartTotal'),
    headerCartCount: document.getElementById('headerCartCount'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    toastContainer: document.getElementById('toastContainer'),
    scrollProgress: document.querySelector('.scroll-progress'),
    testimonialsTrack: document.getElementById('testimonialsTrack'),
    carouselDots: document.getElementById('carouselDots'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    ctaSubmit: document.getElementById('ctaSubmit'),
    ctaEmail: document.getElementById('ctaEmail')
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initTheme();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initFilters();
    initCart();
    initAddToCart();
    initCarousel();
    initCTAForm();
    initScrollProgress();
    initHeaderScroll();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(theme);

    elements.themeToggle?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    if (elements.themeToggle) {
      const icon = elements.themeToggle.querySelector('i');
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  function initMobileMenu() {
    if (!elements.navToggle || !elements.nav) return;

    elements.navToggle.addEventListener('click', () => {
      const isActive = elements.navToggle.classList.contains('active');
      elements.navToggle.classList.toggle('active');
      elements.nav.classList.toggle('show');
      elements.navToggle.setAttribute('aria-expanded', !isActive);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        elements.navToggle.classList.remove('active');
        elements.nav.classList.remove('show');
      });
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
          const headerHeight = elements.header?.offsetHeight || 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-fade-up, .animate-fade-scale').forEach(el => {
      observer.observe(el);
    });
  }

  function initScrollProgress() {
    if (!elements.scrollProgress) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      elements.scrollProgress.style.width = `${progress}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  function initHeaderScroll() {
    if (!elements.header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll > 50) {
        elements.header.classList.add('scrolled');
      } else {
        elements.header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
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
            item.style.animation = 'fadeIn 0.5s ease forwards';
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

    elements.cartButton?.addEventListener('click', openCart);
    elements.cartClose?.addEventListener('click', closeCart);
    elements.cartOverlay?.addEventListener('click', closeCart);
    elements.checkoutBtn?.addEventListener('click', checkout);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.cartPanel?.classList.contains('show')) {
          closeCart();
        }
      }
    });
  }

  function openCart() {
    elements.cartPanel?.classList.add('show');
    elements.cartOverlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    elements.cartPanel?.classList.remove('show');
    elements.cartOverlay?.classList.remove('show');
    document.body.style.overflow = '';
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function updateCartUI() {
    const items = Object.entries(cart);
    const totalItems = items.reduce((sum, [, item]) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, [, item]) => sum + (item.price * item.quantity), 0);

    if (elements.headerCartCount) {
      if (totalItems > 0) {
        elements.headerCartCount.textContent = totalItems;
        elements.headerCartCount.classList.add('show');
      } else {
        elements.headerCartCount.textContent = '0';
        elements.headerCartCount.classList.remove('show');
      }
    }

    if (elements.cartEmpty) {
      elements.cartEmpty.style.display = items.length === 0 ? 'flex' : 'none';
    }

    if (elements.cartFooter) {
      elements.cartFooter.style.display = items.length > 0 ? 'block' : 'none';
    }

    if (elements.cartTotal) {
      elements.cartTotal.textContent = `€${totalPrice.toFixed(2)}`;
    }

    if (elements.cartItems) {
      if (items.length === 0) {
        elements.cartItems.innerHTML = '';
      } else {
        elements.cartItems.innerHTML = items.map(([name, item]) => `
          <div class="cart-item" data-name="${escapeHtml(name)}">
            <div class="cart-item-info">
              <div class="cart-item-name">${escapeHtml(name)}</div>
              <div class="cart-item-qty">Cantidad: ${item.quantity}</div>
            </div>
            <div class="cart-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
            <button class="cart-item-remove" onclick="window.removeFromCart('${escapeHtml(name).replace(/'/g, "\\'")}')" aria-label="Eliminar ${escapeHtml(name)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `).join('');
      }
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
      showToast(`${itemName} eliminado`, 'error');
    }
  };

  function showToast(message, type = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}" aria-hidden="true"></i>
      <span>${escapeHtml(message)}</span>
    `;
    
    elements.toastContainer?.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function initAddToCart() {
    document.querySelectorAll('.btn-add, .btn-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        if (name && price) {
          addToCart(name, price);
        }
      });
    });
  }

  function checkout() {
    const items = Object.entries(cart);
    
    if (items.length === 0) {
      showToast('Añade platos al pedido primero', 'error');
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

  function initCarousel() {
    if (!elements.testimonialsTrack) return;

    const cards = elements.testimonialsTrack.querySelectorAll('.testimonial-card');
    const totalSlides = cards.length;
    
    if (totalSlides === 0) return;

    let visibleCards = 3;
    
    function updateVisibleCards() {
      if (window.innerWidth <= 768) {
        visibleCards = 1;
      } else if (window.innerWidth <= 1024) {
        visibleCards = 2;
      } else {
        visibleCards = 3;
      }
    }
    
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);

    const maxSlide = Math.max(0, totalSlides - visibleCards);

    function createDots() {
      if (!elements.carouselDots) return;
      elements.carouselDots.innerHTML = '';
      
      for (let i = 0; i <= maxSlide; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === currentSlide ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Ir a testimonio ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        elements.carouselDots.appendChild(dot);
      }
    }

    function updateCarousel() {
      const cardWidth = cards[0]?.offsetWidth || 0;
      const gap = 24;
      const offset = currentSlide * (cardWidth + gap);
      elements.testimonialsTrack.style.transform = `translateX(-${offset}px)`;
      
      document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function goToSlide(index) {
      currentSlide = Math.max(0, Math.min(index, maxSlide));
      updateCarousel();
      resetAutoplay();
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) > maxSlide ? 0 : currentSlide + 1);
    }

    function prevSlide() {
      goToSlide((currentSlide - 1) < 0 ? maxSlide : currentSlide - 1);
    }

    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
      startAutoplay();
    }

    createDots();
    updateCarousel();
    startAutoplay();

    elements.prevBtn?.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    elements.nextBtn?.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    let touchStartX = 0;
    let touchEndX = 0;

    elements.testimonialsTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elements.testimonialsTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        resetAutoplay();
      }
    }

    window.addEventListener('resize', () => {
      updateVisibleCards();
      goToSlide(Math.min(currentSlide, maxSlide));
    });
  }

  function initCTAForm() {
    if (!elements.ctaSubmit || !elements.ctaEmail) return;

    elements.ctaSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      const email = elements.ctaEmail.value.trim();
      
      if (!email) {
        showToast('Por favor, introduce tu email', 'error');
        elements.ctaEmail.focus();
        return;
      }
      
      if (!isValidEmail(email)) {
        showToast('Por favor, introduce un email válido', 'error');
        elements.ctaEmail.focus();
        return;
      }
      
      showToast('¡Descuento enviado a tu email!', 'success');
      elements.ctaEmail.value = '';
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();
