# site-the-sales — интернет-магазин электроники

Fullstack-проект интернет-магазина на **FastAPI** + **PostgreSQL** с авторизацией, корзиной и оформлением заказов.

Проект разворачивается как через **Docker/Podman Compose** для локальной разработки, так и в **Kubernetes (k3s)** с манифестами из директории `k3s/`. Настроен полноценный **CI/CD** в GitHub Actions с линтингом, тестированием, сборкой и пушем образов в Docker Hub и деплоем в k3s-кластер.

## Стек

- **Frontend:** HTML, CSS, vanilla JavaScript, Nginx
- **Backend:** FastAPI, Uvicorn, asyncpg, Pydantic, python-jose, bcrypt
- **Database:** PostgreSQL
- **Auth:** bcrypt + JWT (HS256)
- **Migrations:** Bash + psql (идемпотентные миграции с трекингом в `schema_migrations`)
- **CI/CD:** GitHub Actions, self-hosted runner
- **Оркестрация:** Kubernetes (k3s), Docker Compose, Podman Compose
- **Monitoring/Infra:** Ansible, Prometheus/Grafana (отдельная инфраструктура)

## Возможности

- Каталог товаров с фильтрами и поиском
- Корзина на клиенте (localStorage)
- Регистрация и авторизация через JWT
- Оформление заказа с транзакцией и проверкой остатков
- Swagger-документация API

## Структура проекта

```text
.
├── backend/
│   ├── routes/        # auth, products, orders
│   ├── auth.py        # bcrypt + JWT
│   ├── database.py    # asyncpg-подключение
│   ├── init_db.sql    # схема БД + тестовые товары
│   ├── main.py
│   ├── models.py      # Pydantic-модели
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── css/
│   ├── js/            # api.js, cart.js, app.js, data.js
│   ├── index.html
│   ├── nginx.conf     # проксинг /api на бэкенд + SPA-фоллбэк
│   └── Dockerfile
├── k3s/               # Манифесты Kubernetes (k3s)
│   ├── namespace.yaml
│   ├── secret.yaml.example
│   ├── configmap.yaml
│   ├── deployment-backend.yaml
│   ├── deployment-database.yaml
│   ├── deployment-frontend.yaml
│   ├── deployment-pgadmin.yaml
│   └── service.yaml
├── docker-compose.yml
├── .env.example
└── Readme.md
```

## Запуск в Kubernetes (k3s)

### 1) Создать namespace и секреты

```bash
kubectl apply -f k3s/namespace.yaml

# Скопировать шаблон и заполнить своими значениями
cp k3s/secret.yaml.example k3s/secret.yaml
# Отредактировать k3s/secret.yaml

kubectl apply -f k3s/secret.yaml
```

### 2) Применить все манифесты

```bash
kubectl apply -f k3s/
```

### 3) Инициализировать базу данных

В Kubernetes схема БД и тестовые товары не создаются автоматически. Нужно применить `backend/init_db.sql` вручную:

```bash
POD=$(kubectl get pod -n site-the-sales -l app=postgres -o jsonpath='{.items[0].metadata.name}')
cat backend/init_db.sql | kubectl exec -i -n site-the-sales $POD -- psql -U admin -d mybase
```

Или с копированием файла в под:

```bash
POD=$(kubectl get pod -n site-the-sales -l app=postgres -o jsonpath='{.items[0].metadata.name}')
kubectl cp backend/init_db.sql site-the-sales/$POD:/tmp/init_db.sql
kubectl exec -n site-the-sales $POD -- psql -U admin -d mybase -f /tmp/init_db.sql
```

### 4) Проверить состояние и доступ

```bash
kubectl get pods,svc -n site-the-sales
```

Доступ осуществляется через **NodePort** сервиса `front` и `pg-service`. 
Nginx во фронтенд-поде проксирует `location /api` на сервис `back:8000`. В конфиге используется `resolver` CoreDNS для корректного резолва сервисов в кластере k3s.

## Локальный запуск (docker/podman-compose)

```bash
cp .env.example .env
# заполнить .env

podman-compose up -d  # или docker-compose up -d
```

Доступ:

- **Магазин:** http://localhost:1234
- **API (Swagger):** http://localhost:8000/docs
- **pgAdmin:** http://localhost:5678

При первом запуску через compose `backend/init_db.sql` создаёт схему и наполняет таблицу 10 тестовыми товарами.

## Важные нюансы

- **Секреты.** `k3s/secret.yaml` добавлен в `.gitignore` и **не коммитится**. Для создания используйте `k3s/secret.yaml.example`.
- **nginx resolver.** В Kubernetes nginx не читает `/etc/resolv.conf` для `proxy_pass`. В `frontend/nginx.conf` явно указан `resolver` (CoreDNS), что необходимо для корректной работы проксирования `/api` на бэкенд.
- **Имена сервисов.** В k3s-манифестs бэкенд доступен под сервисом `back`, база данных — `database`.
- **init_db.sql.** В кластере k3s инициализацию БД нужно выполнить вручную. В docker-compose в проекте используется отдельный подход, в к8s — ручной.
