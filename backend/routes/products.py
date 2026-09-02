from fastapi import APIRouter
from database import get_db_connection
from models import Product

router = APIRouter(prefix="/api", tags=["products"])

@router.get("/products", response_model=list[Product])
async def get_products():
    """Получить список всех товаров."""
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("SELECT * FROM products ORDER BY id")
        return [dict(row) for row in rows]
    finally:
        await conn.close()