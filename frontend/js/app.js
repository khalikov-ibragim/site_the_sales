(function () {
  'use strict';

  let allProducts = [];
  let activeFilter = 'all';
  let searchQuery = '';

  // ---------- DOM refs ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const productGrid = $('#productGrid');
  const emptyState = $('#emptyState');
  const resultsCount = $('#resultsCount');

  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  const searchToggle = $('#searchToggle');
  const mobileSearch = $('#mobileSearch');
  const searchInput = $('#searchInput');
  const mobileSearchInput = $('#mobileSearchInput');

  const cartBtn = $('#cartBtn');
  const cartBadge = $('#cartBadge');
  const cartDrawer = $('#cartDrawer');
  const cartOverlay = $('#cartOverlay');
  const cartClose = $('#cartClose');
  const cartItemsEl = $('#cartItems');
  const cartEmptyEl = $('#cartEmpty');
  const cartTotalEl = $('#cartTotal');
  const checkoutBtn = $('#checkoutBtn');

  const accountBtn = $('#accountBtn');
  const accountLabel = $('#accountLabel');
  const authOverlay = $('#authOverlay');
  const authModal = $('#authModal');
  const authClose = $('#authClose');
  const authForms = $('#authForms');
  const authAccount = $('#authAccount');
  const accountName = $('#accountName');
  const accountEmail = $('#accountEmail');
  const logoutBtn = $('#logoutBtn');
  const loginForm = $('#loginForm');
  const registerForm = $('#registerForm');

  const toastStack = $('#toastStack');

  const orderOverlay = $('#orderOverlay');
  const orderModal = $('#orderModal');
  const orderClose = $('#orderClose');
  const orderModalClose = $('#orderModalClose');
  const orderAmountEl = $('#orderAmount');
  const orderTimeEl = $('#orderTime');

  const productOverlay = $('#productOverlay');
  const productModal = $('#productModal');
  const productModalClose = $('#productModalClose');
  const productModalTitle = $('#productModalTitle');
  const productDetailMedia = $('#productDetailMedia');
  const productDetailCategory = $('#productDetailCategory');
  const productDetailSpecs = $('#productDetailSpecs');
  const productDetailRatingValue= $('#productDetailRatingValue');
  const productDetailReviews = $('#productDetailReviews');
  const productDetailOldPrice = $('#productDetailOldPrice');
  const productDetailPrice = $('#productDetailPrice');
  const productDetailQtyValue = $('#productDetailQtyValue');
  const productDetailQtyDec = $('#productDetailQtyDec');
  const productDetailQtyInc = $('#productDetailQtyInc');
  const productDetailAddBtn = $('#productDetailAddBtn');

  let detailProduct = null;
  let detailQty = 1;

  // =========================================================
  // Rendering: product catalog
  // =========================================================
  function money(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  function badgeClass(badge) {
    return badge === 'скидка' ? 'product-badge is-sale' : 'product-badge';
  }

  // Бэкенд отдаёт snake_case (old_price, image_url), моковые данные —
  // camelCase (oldPrice). Поддерживаем оба варианта, чтобы карточки
  // одинаково работали и с реальным API, и с data.js.
  function getOldPrice(p) {
    return p.old_price ?? p.oldPrice ?? null;
  }
  function getImageUrl(p) {
    return p.image_url ?? p.imageUrl ?? null;
  }

  function productMediaMarkup(p, imgClass) {
    const imageUrl = getImageUrl(p);
    if (imageUrl) {
      return `<img class="${imgClass}" src="${imageUrl}" alt="${p.name}" loading="lazy">`;
    }
    const icon = CATEGORY_ICONS[p.category] || 'i-chip';
    return `<svg class="icon product-icon"><use href="#${icon}"/></svg>`;
  }

  function productMediaHTML(p) {
    return productMediaMarkup(p, 'product-image');
  }

  function productCardHTML(p) {
    const oldPriceValue = getOldPrice(p);
    const oldPrice = oldPriceValue ? `<span class="price-old">${money(oldPriceValue)}</span>` : '';
    const badge = p.badge ? `<span class="${badgeClass(p.badge)}">${p.badge}</span>` : '';

    return `
      <article class="product-card" data-id="${p.id}" data-category="${p.category}">
        <div class="product-media">
          <div class="corner corner-tl"></div><div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div><div class="corner corner-br"></div>
          ${badge}
          ${productMediaHTML(p)}
        </div>
        <div class="product-body">
          <p class="product-eyebrow">${CATEGORY_LABELS[p.category] || p.category}</p>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-specs">${p.specs}</p>
          <div class="product-rating">
            <svg class="icon"><use href="#i-star"/></svg>
            ${p.rating.toFixed(1)} <span>(${p.reviews})</span>
          </div>
          <div class="product-footer">
            <div class="product-price">
              ${oldPrice}
              <span class="price-current">${money(p.price)}</span>
            </div>
            <button class="add-cart-btn" data-id="${p.id}">
              <svg class="icon"><use href="#i-plus"/></svg>
              В корзину
            </button>
          </div>
        </div>
      </article>`;
  }

  function getFilteredProducts() {
    return allProducts.filter((p) => {
      const matchesFilter = activeFilter === 'all' || p.category === activeFilter;
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.specs.toLowerCase().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });
  }

  function renderProducts() {
    const list = getFilteredProducts();
    productGrid.innerHTML = list.map(productCardHTML).join('');
    emptyState.hidden = list.length > 0;
    resultsCount.textContent = `Показано ${list.length} товар${pluralWord(list.length)}`;
  }

  function pluralWord(n) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return '';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'а';
    return 'ов';
  }

  function setActiveFilter(filter) {
    activeFilter = filter;
    $$('.cat-pill').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.filter === filter));
    $$('.nav-link').forEach((link) => link.classList.toggle('is-active', link.dataset.filter === filter));
    renderProducts();
  }

  // =========================================================
  // Loading skeletons (shown while GET /api/products is in flight)
  // =========================================================
  function skeletonCardHTML() {
    return `
      <div class="skeleton-card">
        <div class="skeleton-media"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-90"></div>
          <div class="skeleton-line w-60"></div>
        </div>
      </div>`;
  }

  function renderSkeletons(count = 8) {
    emptyState.hidden = true;
    resultsCount.textContent = 'Загружаем товары…';
    productGrid.innerHTML = Array.from({ length: count }, skeletonCardHTML).join('');
  }

  // =========================================================
  // Rendering: cart drawer
  // =========================================================
  function cartItemHTML(item) {
    const icon = CATEGORY_ICONS[item.category] || 'i-chip';
    return `
      <div class="cart-item" data-id="${item.id}">
        <svg class="icon cart-item-icon"><use href="#${icon}"/></svg>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${money(item.price)}</p>
          <div class="qty-control">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Уменьшить количество">
              <svg class="icon"><use href="#i-minus"/></svg>
            </button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Увеличить количество">
              <svg class="icon"><use href="#i-plus"/></svg>
            </button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Удалить товар">
          <svg class="icon"><use href="#i-trash"/></svg>
        </button>
      </div>`;
  }

  function renderCart() {
    const items = cart.getItems();
    cartItemsEl.innerHTML = items.map(cartItemHTML).join('');
    cartEmptyEl.hidden = items.length > 0;
    cartTotalEl.textContent = money(cart.getTotal());

    const count = cart.getCount();
    cartBadge.hidden = count === 0;
    cartBadge.textContent = count;
  }

  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
  }

  // =========================================================
  // Auth modal
  // =========================================================
  function openAuth() {
    authOverlay.classList.add('is-open');
    authModal.classList.add('is-open');
    authModal.setAttribute('aria-hidden', 'false');
  }
  function closeAuth() {
    authOverlay.classList.remove('is-open');
    authModal.classList.remove('is-open');
    authModal.setAttribute('aria-hidden', 'true');
  }

  async function refreshAccountUI() {
    const user = await api.getCurrentUser();
    if (user) {
      accountLabel.textContent = user.name;
      accountName.textContent = user.name;
      accountEmail.textContent = user.email;
      authForms.hidden = true;
      authAccount.hidden = false;
    } else {
      accountLabel.textContent = 'Войти';
      authForms.hidden = false;
      authAccount.hidden = true;
    }
  }

  function switchAuthTab(tab) {
    $$('.modal-tab').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.tab === tab));
    loginForm.classList.toggle('is-active', tab === 'login');
    registerForm.classList.toggle('is-active', tab === 'register');
  }

  // =========================================================
  // Order success modal
  // =========================================================
  function openOrderSuccess(amount) {
    orderAmountEl.textContent = money(amount);
    orderTimeEl.textContent = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    orderOverlay.classList.add('is-open');
    orderModal.classList.add('is-open');
    orderModal.setAttribute('aria-hidden', 'false');
  }
  function closeOrderSuccess() {
    orderOverlay.classList.remove('is-open');
    orderModal.classList.remove('is-open');
    orderModal.setAttribute('aria-hidden', 'true');
  }

  // =========================================================
  // Product quick-view modal
  // =========================================================
  function renderDetailQty() {
    productDetailQtyValue.textContent = detailQty;
  }

  function openProductDetail(product) {
    detailProduct = product;
    detailQty = 1;

    const oldPriceValue = getOldPrice(product);

    productDetailMedia.innerHTML = productMediaMarkup(product, 'product-detail-image');
    productDetailCategory.textContent = CATEGORY_LABELS[product.category] || product.category;
    productModalTitle.textContent = product.name;
    productDetailSpecs.textContent = product.specs;
    productDetailRatingValue.textContent = product.rating.toFixed(1);
    productDetailReviews.textContent = `(${product.reviews})`;

    if (oldPriceValue) {
      productDetailOldPrice.textContent = money(oldPriceValue);
      productDetailOldPrice.hidden = false;
    } else {
      productDetailOldPrice.hidden = true;
    }
    productDetailPrice.textContent = money(product.price);

    renderDetailQty();

    productOverlay.classList.add('is-open');
    productModal.classList.add('is-open');
    productModal.setAttribute('aria-hidden', 'false');
  }

  function closeProductDetail() {
    productOverlay.classList.remove('is-open');
    productModal.classList.remove('is-open');
    productModal.setAttribute('aria-hidden', 'true');
    detailProduct = null;
  }

  // =========================================================
  // Toasts
  // =========================================================
  function showToast(text) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<svg class="icon"><use href="#i-check"/></svg><span>${text}</span>`;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 220);
    }, 2200);
  }

  // =========================================================
  // Event wiring
  // =========================================================
  function init() {
    // mobile nav
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // search (desktop + mobile, kept in sync)
    searchToggle.addEventListener('click', () => {
      mobileSearch.classList.toggle('is-open');
      if (mobileSearch.classList.contains('is-open')) mobileSearchInput.focus();
    });
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      mobileSearchInput.value = e.target.value;
      renderProducts();
    });
    mobileSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      searchInput.value = e.target.value;
      renderProducts();
    });

    // category filters (pills + header nav + footer links share data-filter)
    document.body.addEventListener('click', (e) => {
      const filterEl = e.target.closest('[data-filter]');
      if (filterEl) {
        e.preventDefault();
        setActiveFilter(filterEl.dataset.filter);
        mainNav.classList.remove('is-open');
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
      }
    });

    // grid clicks (event delegation, grid is re-rendered often):
    // "В корзину" adds directly, click anywhere else on the card opens quick view
    productGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-cart-btn');
      if (btn) {
        const product = allProducts.find((p) => String(p.id) === btn.dataset.id);
        if (!product) return;
        cart.add(product);
        renderCart();
        showToast(`«${product.name}» добавлен в корзину`);
        btn.classList.add('is-added');
        setTimeout(() => btn.classList.remove('is-added'), 700);
        return;
      }

      const card = e.target.closest('.product-card');
      if (card) {
        const product = allProducts.find((p) => String(p.id) === card.dataset.id);
        if (product) openProductDetail(product);
      }
    });

    // cart drawer
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    cartItemsEl.addEventListener('click', (e) => {
      const qtyBtn = e.target.closest('.qty-btn');
      const removeBtn = e.target.closest('.cart-item-remove');
      if (qtyBtn) {
        const id = qtyBtn.dataset.id;
        const item = cart.getItems().find((i) => i.id === id);
        if (!item) return;
        const nextQty = qtyBtn.dataset.action === 'inc' ? item.qty + 1 : item.qty - 1;
        cart.setQty(id, nextQty);
        renderCart();
      } else if (removeBtn) {
        cart.remove(removeBtn.dataset.id);
        renderCart();
      }
    });
    
    checkoutBtn.addEventListener('click', async () => {
  const items = cart.getItems();
  if (items.length === 0) return;

  const user = await api.getCurrentUser();
  if (!user) {
    showToast('Войдите в аккаунт, чтобы оформить заказ');
    openAuth();
    return;
  }

  const total = cart.getTotal();

  try {
    await api.checkout(items, { name: user.name, email: user.email });
    cart.clear();
    renderCart();
    closeCart();
    openOrderSuccess(total);
  } catch (err) {
    showToast(err.message || 'Не удалось оформить заказ');
  }
});

    // auth modal
    accountBtn.addEventListener('click', openAuth);
    authClose.addEventListener('click', closeAuth);
    authOverlay.addEventListener('click', closeAuth);

    $$('.modal-tab').forEach((btn) => btn.addEventListener('click', () => switchAuthTab(btn.dataset.tab)));

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm));
      try {
        await api.login(data);
        await refreshAccountUI();
        closeAuth();
        showToast('Вы вошли в аккаунт');
        loginForm.reset();
      } catch (err) {
        showToast(err.message || 'Не удалось войти');
      }
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm));
      try {
        await api.register(data);
        await refreshAccountUI();
        closeAuth();
        showToast('Аккаунт создан');
        registerForm.reset();
      } catch (err) {
        showToast(err.message || 'Не удалось зарегистрироваться');
      }
    });

    logoutBtn.addEventListener('click', async () => {
      await api.logout();
      cart.clear();
      renderCart();
      await refreshAccountUI();
      closeAuth();
      showToast('Вы вышли из аккаунта');
    });

    // order success modal
    orderClose.addEventListener('click', closeOrderSuccess);
    orderModalClose.addEventListener('click', closeOrderSuccess);
    orderOverlay.addEventListener('click', closeOrderSuccess);

    // product quick-view modal
    productModalClose.addEventListener('click', closeProductDetail);
    productOverlay.addEventListener('click', closeProductDetail);

    productDetailQtyDec.addEventListener('click', () => {
      if (detailQty <= 1) return;
      detailQty -= 1;
      renderDetailQty();
    });
    productDetailQtyInc.addEventListener('click', () => {
      detailQty += 1;
      renderDetailQty();
    });
    productDetailAddBtn.addEventListener('click', () => {
      if (!detailProduct) return;
      for (let i = 0; i < detailQty; i += 1) cart.add(detailProduct);
      renderCart();
      showToast(`«${detailProduct.name}» добавлен в корзину (${detailQty} шт.)`);
      closeProductDetail();
    });

    // escape closes any open overlay
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeCart();
      closeAuth();
      closeOrderSuccess();
      closeProductDetail();
    });
  }

  async function boot() {
    init();
    renderSkeletons();
    allProducts = await api.getProducts();
    renderProducts();
    renderCart();
    await refreshAccountUI();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();