(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    document.documentElement.classList.toggle('reduce-motion', e.matches);
  });

  const AUTH_KEY = 'petriAuth';
  const CART_KEY = 'petriCart';
  const THEME_KEY = 'petriTheme';

  function checkAuth() {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) {
      window.location.href = 'login.html';
      return false;
    }
    
    try {
      const auth = JSON.parse(authData);
      if (!auth.sessionId || !auth.user || !auth.expires || auth.expires <= Date.now()) {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = 'login.html';
        return false;
      }
      return true;
    } catch (e) {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = 'login.html';
      return false;
    }
  }
  
  // Autenticación obligatoriamente activa
  if (!checkAuth()) {
    throw new Error('Auth required');
  }

  window.logout = function() {
    if (confirm('¿Cerrar sesión?')) {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = 'login.html';
    }
  };

  let cart = {};
  let currentSlide = 0;
  let autoplayInterval = null;
  const DEFAULT_MENU = {
    categories: [
      { id: 'all', label: 'Todos' },
      { id: 'tradicional', label: 'Tradicional' },
      { id: 'bocadillos', label: 'Bocadillos' },
      { id: 'especialidades', label: 'Especialidades' },
      { id: 'postres', label: 'Postres' },
      { id: 'bebidas', label: 'Bebidas' }
    ],
    items: [
      { id: 1, name: 'Paella Valenciana', description: 'Arroz con pollo, conejo y verduras de temporada. Receta auténtica.', price: 18.50, category: 'tradicional', featured: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop', tag: 'Tradicional' },
      { id: 2, name: 'Bocadillo de Calamares', description: 'Calamares fritos con alioli casero en pan artesano crujiente.', price: 8.50, category: 'bocadillos', featured: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', tag: 'Bocadillo' },
      { id: 3, name: 'Gazpacho Andaluz', description: 'Sopa fría de tomate, pepino, pimiento y ajo. Fresco y saludable.', price: 6.50, category: 'tradicional', featured: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop', tag: 'Tradicional' },
      { id: 4, name: 'Degustación del Chef', description: 'Selección de 5 creaciones exclusivas. Una experiencia única.', price: 32.00, category: 'especialidades', featured: true, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', tag: 'Especialidad' },
      { id: 5, name: 'Bocadillo de Jamón Ibérico', description: 'De bellota con queso manchego en pan rústico de hogaza.', price: 12.00, category: 'bocadillos', featured: false, image: 'https://images.unsplash.com/photo-1614394003343-3c2edc3b61b7?w=400&h=300&fit=crop', tag: 'Bocadillo' },
      { id: 6, name: 'Rodaballo al Horno', description: 'Pescado fresco horneado con hierbas aromáticas y cítricos.', price: 24.00, category: 'especialidades', featured: false, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', tag: 'Especialidad' },
      { id: 7, name: 'Cordero Asado', description: 'Cordero de lechal con patatas nuevas y romero. Delicia tradicional.', price: 22.00, category: 'especialidades', featured: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop', tag: 'Especialidad' },
      { id: 8, name: 'Patatas Bravas', description: 'Patatas caseras con salsa brava y alioli. El clásico imprescindibale.', price: 7.50, category: 'tradicional', featured: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', tag: 'Tradicional' },
      { id: 9, name: 'Bocadillo de Chorizo', description: 'Chorizo artesano a la Brasa con pimientos de Padrón.', price: 9.00, category: 'bocadillos', featured: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', tag: 'Bocadillo' },
      { id: 10, name: 'Flan de Huevo', description: 'Flan casero con caramelo líquido y nata. Postre tradicional.', price: 5.50, category: 'postres', featured: true, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', tag: 'Postre' },
      { id: 11, name: 'Tarta de Queso', description: 'Tarta artesana con frutos rojos. Cremosa y deliciosa.', price: 6.00, category: 'postres', featured: false, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df70?w=400&h=300&fit=crop', tag: 'Postre' },
      { id: 12, name: 'Churros con Chocolate', description: 'Churros caseros con chocolate caliente espeso.', price: 5.00, category: 'postres', featured: false, image: 'https://images.unsplash.com/photo-1624371414361-e670d8cfe81a?w=400&h=300&fit=crop', tag: 'Postre' },
      { id: 13, name: 'Sangría', description: 'Sangría tradicional con vino tinto y fruta fresca.', price: 4.50, category: 'bebidas', featured: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop', tag: 'Bebida' },
      { id: 14, name: 'Agua de Valencia', description: 'Cóctel de cava con zumo de naranja natural.', price: 6.00, category: 'bebidas', featured: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop', tag: 'Bebida' },
      { id: 15, name: 'Refresco Artesano', description: 'Refresco de limón o naranja casero.', price: 2.50, category: 'bebidas', featured: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop', tag: 'Bebida' },
      { id: 16, name: 'Café Espresso', description: 'Café de grano recién molido. Solo o con leche.', price: 2.00, category: 'bebidas', featured: false, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop', tag: 'Bebida' }
    ]
  };

const DEFAULT_TESTIMONIALS = {
    testimonials: [
      { id: 1, rating: 5, text: 'Los mejores bocadillos que he probado. Se nota que cada ingrediente está elegido con cuidado. El jamón ibérico es exquisito.', author: 'María González', role: 'Cliente habitual', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 2, rating: 5, text: 'Pedí la degustación del chef para una cena especial. Una experiencia increíble. Cada plato era una obra de arte.', author: 'Carlos Ruiz', role: 'Food blogger', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 3, rating: 5, text: 'El servicio de entrega es rapidísimo y la comida llega en perfecto estado. Siempre pido para eventos de empresa.', author: 'Laura Martínez', role: 'Directora de empresa', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 4, rating: 5, text: 'La paella es simplemente spectacular. Sabe a la de mi abuela. Es la mejor que he probado en Madrid.', author: 'Antonio García', role: 'Chef aficionado', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 5, rating: 4, text: 'Los churros con chocolate son auténticos. Perfecto para un domingo en familia.', author: 'Sofia López', role: 'Cliente frecuente', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
      { id: 6, rating: 5, text: 'La tarta de queso con frutos rojos es divina. Vengo cada semana solo por ella.', author: 'Miguel Torres', role: 'Cliente VIP', avatar: 'https://randomuser.me/api/portraits/men/52.jpg' },
      { id: 7, rating: 5, text: 'Reservamos para celebrar nuestro aniversario y fue perfecto. La atención, el ambiente, la comida... todo.', author: 'Elena Rodríguez', role: 'Cliente especial', avatar: 'https://randomuser.me/api/portraits/women/89.jpg' },
      { id: 8, rating: 4, text: 'Bocadillo de calamares crujiente y abundante. La salsa alioli casera es exquisita. Repetiré seguro.', author: 'David Sánchez', role: 'Cliente nuevo', avatar: 'https://randomuser.me/api/portraits/men/41.jpg' }
    ]
  };

  const DEFAULT_STATS = {
    hero: { stats: [
      { number: '500+', label: 'Pedidos' },
      { number: '4.9', label: 'Valoración' },
      { number: '15+', label: 'Años exp.' }
    ]},
    chef: {
      name: 'Chef Petri',
      stats: [
        { icon: 'utensils', value: '+200', name: 'Platos creados' },
        { icon: 'award', value: '3', name: 'Premios gastronómicos' },
        { icon: 'heart', value: '100%', name: 'Vocación' }
      ]
    }
  };

  let menuData = DEFAULT_MENU;
  let testimonialsData = DEFAULT_TESTIMONIALS;
  let statsData = DEFAULT_STATS;

  const elements = {
    header: document.getElementById('header'),
    themeToggle: document.getElementById('themeToggle'),
    logoutBtn: document.getElementById('logoutBtn'),
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
    menuGrid: document.getElementById('menuGrid'),
    menuFilters: document.getElementById('menuFilters'),
    testimonialsTrack: document.getElementById('testimonialsTrack'),
    carouselDots: document.getElementById('carouselDots'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn')
  };

  async function loadData() {
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
      console.log('Running from file:// - using default data');
      return;
    }
    
    try {
      const [menuRes, testimonialsRes] = await Promise.all([
        fetch('data/menu.json'),
        fetch('data/testimonials.json')
      ]);
      
      if (menuRes.ok) {
        const data = await menuRes.json();
        if (data && data.items && data.items.length > 0) {
          menuData = data;
        }
      }
      
      if (testimonialsRes.ok) {
        const data = await testimonialsRes.json();
        if (data && data.testimonials && data.testimonials.length > 0) {
          testimonialsData = data;
        }
      }
      
      try {
        const statsRes = await fetch('data/stats.json');
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data && data.hero && data.chef) {
            statsData = data;
          }
        }
      } catch (e) {}
      
    } catch (error) {
      console.warn('Using default data:', error);
    }
  }

  function renderMenu() {
    const menuFilters = document.getElementById('menuFilters');
    const menuGrid = document.getElementById('menuGrid');
    
    if (!menuData || !menuFilters || !menuGrid) {
      console.warn('Menu elements not found, data:', menuData);
      return;
    }
    
    menuFilters.innerHTML = menuData.categories.map(cat => `
      <button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}" aria-pressed="${cat.id === 'all'}">
        ${cat.label}
      </button>
    `).join('');
    
    menuGrid.innerHTML = menuData.items.map((item, index) => `
      <article class="menu-item" data-category="${item.category}" data-featured="${item.featured}">
        <div class="menu-image">
          <img src="${item.image}" alt="${item.name}" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low">
          <span class="menu-tag">${item.tag}</span>
          <div class="menu-overlay">
            <button class="btn-add" data-id="${item.id}" aria-label="Añadir ${item.name} al pedido">
              <i class="fas fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="menu-content">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="menu-footer">
            <span class="menu-price">€${item.price.toFixed(2)}</span>
            <button class="btn-icon" data-id="${item.id}" aria-label="Añadir al pedido">
              <i class="fas fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  function renderTestimonials() {
    const testimonialsTrack = document.getElementById('testimonialsTrack');
    
    if (!testimonialsData || !testimonialsTrack) {
      console.warn('Testimonials elements not found');
      return;
    }
    
    testimonialsTrack.innerHTML = testimonialsData.testimonials.map((t, index) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        const filled = i <= t.rating;
        const delay = i * 0.1;
        stars.push(`<i class="fas fa-star ${filled ? 'filled' : 'empty'}" style="animation-delay: ${delay}s" aria-hidden="true"></i>`);
      }
      return `
      <article class="testimonial-card" data-index="${index}">
        <div class="testimonial-rating" aria-label="${t.rating} de 5 estrellas">
          ${stars.join('')}
        </div>
        <blockquote class="testimonial-text">
          "${t.text}"
        </blockquote>
        <footer class="testimonial-author">
          <img src="${t.avatar}" alt="" width="56" height="56" loading="lazy" decoding="async" fetchpriority="low">
          <div>
            <cite class="author-name">${t.author}</cite>
            <span class="author-role">${t.role}</span>
          </div>
        </footer>
      </article>
    `}).join('');
  }

  function renderStats() {
    if (!statsData) return;
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
      heroStats.innerHTML = statsData.hero.stats.map(s => `
        <div class="stat">
          <span class="stat-number">${s.number}</span>
          <span class="stat-label">${s.label}</span>
        </div>
      `).join('');
    }
    
    const chefStats = document.querySelector('.chef-stats');
    if (chefStats && statsData.chef.stats) {
      chefStats.innerHTML = statsData.chef.stats.map(s => `
        <div class="chef-stat">
          <span class="stat-icon"><i class="fas fa-${s.icon}"></i></span>
          <span class="stat-value">${s.value}</span>
          <span class="stat-name">${s.name}</span>
        </div>
      `).join('');
    }
    
    const chefName = document.querySelector('.chef-name');
    if (chefName && statsData.chef.name) {
      chefName.textContent = statsData.chef.name;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        renderMenu();
        renderTestimonials();
        renderStats();
        initFilters();
        initCarousel();
      });
    });
    
    init();
  });

function init() {
    initLogout();
    initMobileMenu();
    initScrollEffects();
    initFilters();
    initScrollAnimations();
    initBackToTop();
    
    initMenuSearch();
    initLightbox();
    initScrollProgress();
    initLazyLoading();
    initPerformanceOptimizations();
    initHeaderScroll();
    initAddToCart();
    initFocusTrap();
    initA11y();
  }

  function initFocusTrap() {
    const modalSelector = '.modal, .lightbox';
    
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const openModal = document.querySelector('.modal.show, .lightbox.show');
      if (!openModal) return;
      
      const focusableElements = openModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    });
  }

  function initA11y() {
    document.querySelectorAll('.skip-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      });
    });
    
    document.querySelectorAll('.btn, button, a').forEach(el => {
      if (!el.getAttribute('aria-label') && !el.getAttribute('title')) {
        const text = el.textContent?.trim();
        if (text && text.length < 3) {
          el.setAttribute('aria-label', text);
        }
      }
    });
  }

  function initLogout() {
    elements.logoutBtn?.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        window.logout();
      }
    });
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
    const animatedElements = document.querySelectorAll('.animate-fade-up, .animate-fade-scale');
    if (animatedElements.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  }

  function initScrollProgress() {
    if (!elements.scrollProgress) return;

    let ticking = false;
    
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      elements.scrollProgress.style.width = `${progress}%`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  function initHeaderScroll() {
    if (!elements.header) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          if (currentScroll > 50) {
            elements.header.classList.add('scrolled');
          } else {
            elements.header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function initFilters() {
    const filterBtns = () => document.querySelectorAll('.filter-btn');
    const menuItems = () => document.querySelectorAll('.menu-item');
    
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      
      const category = btn.dataset.category;
      
      filterBtns().forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      
      menuItems().forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.classList.remove('hide');
          item.style.display = '';
        } else {
          item.classList.add('hide');
        }
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
      elements.headerCartCount.textContent = totalItems;
      elements.headerCartCount.classList.toggle('show', totalItems > 0);
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
      elements.cartItems.innerHTML = items.map(([id, item]) => `
        <div class="cart-item" data-id="${id}">
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHtml(item.name)}</div>
            <div class="cart-item-qty">Cantidad: ${item.quantity}</div>
          </div>
          <div class="cart-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
          <button class="cart-item-remove" data-id="${id}" aria-label="Eliminar ${escapeHtml(item.name)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `).join('');
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  window.addToCart = function(id) {
    if (!menuData) return;
    const item = menuData.items.find(i => i.id === parseInt(id));
    if (!item) return;
    
    if (cart[id]) {
      cart[id].quantity += 1;
    } else {
      cart[id] = { id: item.id, name: item.name, price: item.price, quantity: 1 };
    }
    saveCart();
    updateCartUI();
    showToast(`${item.name} añadido al pedido`, 'success');
  };

  window.removeFromCart = function(id) {
    if (cart[id]) {
      const itemName = cart[id].name;
      delete cart[id];
      saveCart();
      updateCartUI();
      showToast(`${itemName} eliminado`, 'error');
    }
  };

  function showToast(message, type = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
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
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-add, .btn-icon');
      if (!btn) return;
      
      const id = btn.dataset.id;
      if (id) addToCart(id);
    });
    
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart-item-remove');
      if (!btn) return;
      
      const id = btn.dataset.id;
      if (id) window.removeFromCart(id);
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
    items.forEach(([, item]) => {
      const subtotal = item.price * item.quantity;
      pedidoTexto += `\n• ${item.name} x${item.quantity} = €${subtotal.toFixed(2)}`;
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

    const cards = () => elements.testimonialsTrack.querySelectorAll('.testimonial-card');
    
    if (cards().length === 0) return;

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

    function getMaxSlide() {
      return Math.max(0, cards().length - visibleCards);
    }

    function createDots() {
      if (!elements.carouselDots) return;
      elements.carouselDots.innerHTML = '';
      
      for (let i = 0; i <= getMaxSlide(); i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === currentSlide ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Ir a testimonio ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        elements.carouselDots.appendChild(dot);
      }
    }

    function updateCarousel() {
      const firstCard = cards()[0];
      if (!firstCard) return;
      
      const cardWidth = firstCard.offsetWidth;
      const gap = 24;
      const offset = currentSlide * (cardWidth + gap);
      elements.testimonialsTrack.style.transform = `translateX(-${offset}px)`;
      
      document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function goToSlide(index) {
      currentSlide = Math.max(0, Math.min(index, getMaxSlide()));
      updateCarousel();
      resetAutoplay();
    }

    function nextSlide() {
      goToSlide(currentSlide >= getMaxSlide() ? 0 : currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide <= 0 ? getMaxSlide() : currentSlide - 1);
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
        diff > 0 ? nextSlide() : prevSlide();
        resetAutoplay();
      }
    }

    window.addEventListener('resize', () => {
      updateVisibleCards();
      goToSlide(Math.min(currentSlide, getMaxSlide()));
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function initMenuSearch() {
    const searchInput = document.getElementById('menuSearch');
    const searchClear = document.getElementById('searchClear');
    if (!searchInput || !searchClear) return;

    let searchTimeout;

    const performSearch = (query) => {
      const normalizedQuery = query.toLowerCase().trim();
      const menuItems = document.querySelectorAll('.menu-item');

      menuItems.forEach(item => {
        const name = item.querySelector('h3')?.textContent?.toLowerCase() || '';
        const desc = item.querySelector('p')?.textContent?.toLowerCase() || '';
        const category = item.dataset.category || '';

        if (!normalizedQuery || name.includes(normalizedQuery) || desc.includes(normalizedQuery)) {
          item.classList.remove('hide');
          item.style.display = '';
        } else {
          item.classList.add('hide');
        }
      });

      const visibleItems = document.querySelectorAll('.menu-item:not(.hide)');
      const grid = document.getElementById('menuGrid');
      if (grid) {
        if (visibleItems.length === 0) {
          grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-text-muted);">No se encontraron platos que coincidan con tu búsqueda.</p>';
        }
      }

      searchClear.classList.toggle('show', normalizedQuery.length > 0);
    };

    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
    });

    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      performSearch('');
      searchInput.focus();
    });

    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        performSearch('');
      }
    });
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const galleryItems = document.querySelectorAll('.gallery-strip-item img');

    if (!lightbox || galleryItems.length === 0) return;

    let currentIndex = 0;
    const images = Array.from(galleryItems).map(img => ({
      src: img.src.replace('w=300&h=300', 'w=1200&h=800'),
      alt: img.alt
    }));

    const openLightbox = (index) => {
      currentIndex = index;
      lightboxImg.src = images[index].src;
      lightboxImg.alt = images[index].alt;
      lightbox.classList.add('show');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('show');
      document.body.style.overflow = '';
    };

    const prevImage = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    };

    const nextImage = () => {
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    };

    galleryItems.forEach((img, index) => {
      img.parentElement?.addEventListener('click', () => openLightbox(index));
      if (img.parentElement) {
        img.parentElement.style.cursor = 'zoom-in';
      }
    });

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', prevImage);
    nextBtn?.addEventListener('click', nextImage);

    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .menu-item.hide { display: none; }
  `;
  document.head.appendChild(style);
})();