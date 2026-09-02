-- ============================================
-- 1. ТАБЛИЦА: Пользователи
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. ТАБЛИЦА: Товары
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    specs TEXT,
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    badge VARCHAR(50),
    stock INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. ТАБЛИЦА: Заказы
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. ТАБЛИЦА: Товары в заказе
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. ТЕСТОВЫЕ ДАННЫЕ
-- ============================================
INSERT INTO products (name, category, specs, price, old_price, rating, reviews, badge, stock) VALUES
('Vektor 14 Pro', 'laptops', 'Ryzen 7 / 16 ГБ / 512 ГБ SSD / RTX 4060', 129990, NULL, 4.9, 214, 'хит', 15),
('Slate Air 13', 'laptops', 'Apple M3 / 8 ГБ / 256 ГБ SSD', 94990, 104990, 4.7, 132, 'скидка', 8),
('Pulsar X200', 'phones', '256 ГБ / 8 ГБ ОЗУ / AMOLED 120 Гц', 74990, NULL, 4.8, 341, 'хит', 12),
('Nova Lite 5G', 'phones', '128 ГБ / 6 ГБ ОЗУ / 5000 мАч', 34990, NULL, 4.5, 98, NULL, 20),
('EchoBeam ANC', 'audio', 'Bluetooth 5.3 / ANC / 30 ч работы', 12990, 15990, 4.6, 176, 'скидка', 10),
('SoundCore Cube', 'audio', '360° звук / 20 Вт / IPX7', 8490, NULL, 4.4, 64, NULL, 30),
('Home Hub Mini', 'smart-home', 'Голосовой ассистент / Zigbee-хаб', 6990, NULL, 4.3, 51, 'новинка', 7),
('Glow Node', 'smart-home', 'RGB / Wi-Fi / диммирование', 1990, NULL, 4.6, 87, NULL, 50),
('ClearView 27Q', 'monitors', '27" / 2560×1440 / 165 Гц / IPS', 27990, NULL, 4.8, 149, 'хит', 5),
('LinkPoint 7-in-1', 'accessories', 'USB-C / HDMI 4K / SD / 100 Вт PD', 3490, NULL, 4.5, 73, 'новинка', 25);