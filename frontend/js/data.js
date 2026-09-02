/**
 * data.js
 * -------
 * Статичные данные каталога. Сейчас это моковый массив в памяти.
 *
 * Когда подключишь бэкенд (Node/Python + PostgreSQL) — этот файл можно
 * удалить целиком: js/api.js будет получать те же по форме объекты
 * из fetch('/api/products'), достаточно чтобы бэкенд отдавал JSON
 * с такими же полями (id, name, category, price...).
 */

const CATEGORY_LABELS = {
  laptops:       'Ноутбуки',
  phones:        'Смартфоны',
  audio:         'Аудио',
  'smart-home':  'Умный дом',
  monitors:      'Мониторы',
  accessories:   'Аксессуары',
};

// какую иконку из спрайта (#i-...) показывать для категории
const CATEGORY_ICONS = {
  laptops:      'i-laptop',
  phones:       'i-phone',
  audio:        'i-headphones',
  'smart-home': 'i-home',
  monitors:     'i-monitor',
  accessories:  'i-cable',
};

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Vektor 14 Pro',
    category: 'laptops',
    specs: 'Ryzen 7 / 16 ГБ / 512 ГБ SSD / RTX 4060',
    price: 129990,
    oldPrice: null,
    rating: 4.9,
    reviews: 214,
    badge: 'хит',
  },
  {
    id: 'p2',
    name: 'Slate Air 13',
    category: 'laptops',
    specs: 'Apple M3 / 8 ГБ / 256 ГБ SSD',
    price: 94990,
    oldPrice: 104990,
    rating: 4.7,
    reviews: 132,
    badge: 'скидка',
  },
  {
    id: 'p3',
    name: 'Pulsar X200',
    category: 'phones',
    specs: '256 ГБ / 8 ГБ ОЗУ / AMOLED 120 Гц',
    price: 74990,
    oldPrice: null,
    rating: 4.8,
    reviews: 341,
    badge: 'хит',
  },
  {
    id: 'p4',
    name: 'Nova Lite 5G',
    category: 'phones',
    specs: '128 ГБ / 6 ГБ ОЗУ / 5000 мАч',
    price: 34990,
    oldPrice: null,
    rating: 4.5,
    reviews: 98,
    badge: null,
  },
  {
    id: 'p5',
    name: 'EchoBeam ANC',
    category: 'audio',
    specs: 'Bluetooth 5.3 / ANC / 30 ч работы',
    price: 12990,
    oldPrice: 15990,
    rating: 4.6,
    reviews: 176,
    badge: 'скидка',
  },
  {
    id: 'p6',
    name: 'SoundCore Cube',
    category: 'audio',
    specs: '360° звук / 20 Вт / IPX7',
    price: 8490,
    oldPrice: null,
    rating: 4.4,
    reviews: 64,
    badge: null,
  },
  {
    id: 'p7',
    name: 'Home Hub Mini',
    category: 'smart-home',
    specs: 'Голосовой ассистент / Zigbee-хаб',
    price: 6990,
    oldPrice: null,
    rating: 4.3,
    reviews: 51,
    badge: 'новинка',
  },
  {
    id: 'p8',
    name: 'Glow Node',
    category: 'smart-home',
    specs: 'RGB / Wi-Fi / диммирование',
    price: 1990,
    oldPrice: null,
    rating: 4.6,
    reviews: 87,
    badge: null,
  },
  {
    id: 'p9',
    name: 'ClearView 27Q',
    category: 'monitors',
    specs: '27" / 2560×1440 / 165 Гц / IPS',
    price: 27990,
    oldPrice: null,
    rating: 4.8,
    reviews: 149,
    badge: 'хит',
  },
  {
    id: 'p10',
    name: 'LinkPoint 7-in-1',
    category: 'accessories',
    specs: 'USB-C / HDMI 4K / SD / 100 Вт PD',
    price: 3490,
    oldPrice: null,
    rating: 4.5,
    reviews: 73,
    badge: 'новинка',
  },
];