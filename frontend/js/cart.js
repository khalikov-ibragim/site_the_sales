/**
 * cart.js
 * -------
 * Состояние корзины хранится в localStorage на стороне клиента.
 * Когда появится бэкенд — при желании можно синхронизировать корзину
 * с сервером (например, класть её в Redis по session_id), но для MVP
 * localStorage полностью достаточно, и весь остальной код (app.js)
 * работает через объект `cart`, так что подмена реализации не потребует
 * переписывать UI.
 */

const cart = {
  _key: 'tok_cart',

  _read() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || [];
    } catch {
      return [];
    }
  },

  _write(items) {
    localStorage.setItem(this._key, JSON.stringify(items));
  },

  getItems() {
    return this._read();
  },

  getCount() {
    return this._read().reduce((sum, item) => sum + item.qty, 0);
  },

  getTotal() {
    return this._read().reduce((sum, item) => sum + item.qty * item.price, 0);
  },

  add(product) {
    const items = this._read();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        qty: 1,
      });
    }
    this._write(items);
  },

  setQty(id, qty) {
    let items = this._read();
    if (qty <= 0) {
      items = items.filter(i => i.id !== id);
    } else {
      const item = items.find(i => i.id === id);
      if (item) item.qty = qty;
    }
    this._write(items);
  },

  remove(id) {
    const items = this._read().filter(i => i.id !== id);
    this._write(items);
  },

  clear() {
    this._write([]);
  },
};