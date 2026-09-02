/**
 * api.js
 * ------
 * Единая точка входа для сетевых запросов к бэкенду.
 * Авторизация — через JWT: токен хранится в localStorage и подставляется
 * в заголовок Authorization для защищённых эндпоинтов.
 */

const CONFIG = {
  API_BASE_URL: '/api',
  USE_MOCK_API: false,
};

const TOKEN_KEY = 'tok_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = {

  /** Получить список товаров */
  async getProducts() {
    if (CONFIG.USE_MOCK_API) return Promise.resolve(PRODUCTS);

    const res = await fetch(`${CONFIG.API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Не удалось загрузить товары');
    return res.json();
  },

  /** Текущий авторизованный пользователь (или null) */
  async getCurrentUser() {
    if (CONFIG.USE_MOCK_API) {
      const raw = localStorage.getItem('tok_user');
      return Promise.resolve(raw ? JSON.parse(raw) : null);
    }

    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { ...authHeaders() },
    });
    if (res.status === 401) {
      clearToken();
      return null;
    }
    if (!res.ok) throw new Error('Не удалось получить данные пользователя');
    return res.json();
  },

  /** Вход по email/паролю */
  async login({ email, password }) {
    if (CONFIG.USE_MOCK_API) {
      const user = { name: email.split('@')[0], email };
      localStorage.setItem('tok_user', JSON.stringify(user));
      return Promise.resolve(user);
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Неверный email или пароль');
    }

    const data = await res.json();
    setToken(data.access_token);
    return data.user;
  },

  /** Регистрация нового пользователя */
  async register({ name, email, password }) {
    if (CONFIG.USE_MOCK_API) {
      const user = { name, email };
      localStorage.setItem('tok_user', JSON.stringify(user));
      return Promise.resolve(user);
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Не удалось зарегистрироваться');
    }

    // /auth/register не возвращает токен — сразу логинимся,
    // чтобы пользователь не вводил пароль повторно
    return api.login({ email, password });
  },

  /** Выход из аккаунта */
  async logout() {
    if (CONFIG.USE_MOCK_API) {
      localStorage.removeItem('tok_user');
      return Promise.resolve();
    }

    // У бэкенда нет серверных сессий (чистый JWT без refresh/blacklist),
    // поэтому логаут — это просто удаление токена на клиенте
    clearToken();
  },

  /**
   * Оформление заказа.
   * Бэкенд (routes/orders.py) ждёт items + customer_name/email/phone,
   * и требует авторизации (Bearer-токен).
   */
  async checkout(cartItems, customer) {
    if (CONFIG.USE_MOCK_API) {
      console.log('[demo] Заказ оформлен локально:', cartItems);
      return Promise.resolve({ orderId: 'demo-' + Date.now() });
    }

    const token = getToken();
    if (!token) throw new Error('Нужно войти в аккаунт, чтобы оформить заказ');

    const res = await fetch(`${CONFIG.API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        items: cartItems.map((i) => ({ product_id: i.id, quantity: i.qty })),
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Не удалось оформить заказ');
    }
    return res.json();
  },
};
