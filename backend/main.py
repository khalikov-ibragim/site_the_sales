from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import products, auth, orders

app = FastAPI(title="ТОК API", version="1.0.0")

# Разрешаем CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене замени на конкретный домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(orders.router)

@app.get("/")
async def root():
    return {"message": "ТОК API работает!", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "ok"}

