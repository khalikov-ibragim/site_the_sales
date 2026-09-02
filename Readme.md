# ТОК — интернет-магазин электроники

Учебный fullstack-проект: FastAPI + PostgreSQL + nginx + pgAdmin, всё упаковано
в контейнеры через podman-compose.

## Стек

- **Frontend:** HTML, CSS, vanilla JavaScript, nginx
- **Backend:** FastAPI, Uvicorn, asyncpg, Pydantic
- **Database:** PostgreSQL 17
- **Auth:** bcrypt (hash паролей) + JWT (HS256)
- **Admin:** pgAdmin
- **Containerization:** Podman / podman-compose

## Возможности

- Каталог товаров с фильтрами и поиском
- Корзина на клиенте (localStorage)
- Регистрация и авторизация через JWT
- Оформление заказа с транзакцией и проверкой остатков
- Swagger-документация API: `http://localhost:8000/docs`

## Состав сервисов (docker-compose.yml)

| Сервис   | Порт снаружи | Примечание |
|----------|--------------|------------|
| frontend | `1234`       | nginx отдаёт статику и проксирует `/api` |
| backend  | `8000`       | FastAPI/uvicorn |
| database | `5432`       | PostgreSQL 17, том `postgres_data` |
| pgadmin  | `5678`       | веб-панель БД |

## Быстрый старт

```bash
podman-compose up -d    # или docker-compose up -d
```

Доступ:

- **Магазин:** http://localhost:1234
- **API (Swagger):** http://localhost:8000/docs
- **pgAdmin:** http://localhost:5678

При первом старте `backend/init_db.sql` создаёт схему и наполняет таблицу
10 тестовыми товарами.

## Структура

```text
.
├── frontend/
│   ├── css/
│   ├── js/            # data.js (моки), api.js, cart.js, app.js
│   ├── index.html
│   ├── nginx.conf
│   └── Dockerfile
├── backend/
│   ├── routes/        # auth, products, orders
│   ├── auth.py        # bcrypt + JWT
│   ├── database.py    # asyncpg-подключение
│   ├── init_db.sql
│   ├── main.py
│   ├── models.py      # Pydantic-модели
│   ├── requirements.txt   # версии зафиксированы
│   └── Dockerfile
└── docker-compose.yml
```

## Примечание про frontend

Сетевое взаимодействие собрано в `frontend/js/api.js` — остальной код с ним не
связан напрямую. Корзина живёт в `localStorage` (`frontend/js/cart.js`). Если
захочешь перенести корзину на сервер — интерфейс `cart.js` (add/remove/setQty/
getItems/getTotal) можно оставить прежним.

## Предложения по улучшению

1. **Добавить healthcheck** для `database` и `depends_on: condition: service_healthy`
   к backend — сейчас порядок по `depends_on` без реальной готовности.
2. **`.dockerignore`** для frontend и backend (исключить `.env`, `__pycache__`, `.venv`).
3. **`SECRET_KEY`** захардкожен в compose — генерировать случайный и хранить в `.env`.
4. **Экранировать HTML** при рендере данных из БД на фронтенде (защита от XSS).
5. **Единый точка входа**: сейчас frontend и backend проброшены отдельными портами;
   можно проксировать всё через nginx на один порт.
