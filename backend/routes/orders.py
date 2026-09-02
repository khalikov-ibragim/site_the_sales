from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from models import OrderCreate, OrderResponse
from routes.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    """
    Создание заказа с транзакцией.
    - Проверяет остатки товаров
    - Уменьшает stock
    - Создает заказ и записи в order_items
    """
    conn = await get_db_connection()
    
    try:
        # Начинаем транзакцию
        async with conn.transaction():
            # 1. Проверяем наличие всех товаров
            total_amount = 0
            items_to_order = []
            
            for item in order_data.items:
                product = await conn.fetchrow(
                    "SELECT id, name, price, stock FROM products WHERE id = $1",
                    item.product_id
                )
                if not product:
                    raise HTTPException(status_code=404, detail=f"Товар с id {item.product_id} не найден")
                
                if product["stock"] < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Недостаточно товара {product['name']}. В наличии: {product['stock']}"
                    )
                
                total_amount += product["price"] * item.quantity
                items_to_order.append({
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "price": product["price"],
                    "quantity": item.quantity
                })
            
            # 2. Создаем заказ
            order_row = await conn.fetchrow(
                """
                INSERT INTO orders 
                    (user_id, customer_name, customer_email, customer_phone, total_amount) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING id, total_amount, status
                """,
                current_user["id"],
                order_data.customer_name,
                order_data.customer_email,
                order_data.customer_phone,
                total_amount
            )
            
            order_id = order_row["id"]
            
            # 3. Добавляем товары в order_items и обновляем stock
            for item in items_to_order:
                await conn.execute(
                    """
                    INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    order_id,
                    item["product_id"],
                    item["product_name"],
                    item["quantity"],
                    item["price"]
                )
                
                await conn.execute(
                    "UPDATE products SET stock = stock - $1 WHERE id = $2",
                    item["quantity"],
                    item["product_id"]
                )
            
            # 4. Возвращаем результат
            return {
                "id": order_row["id"],
                "total_amount": order_row["total_amount"],
                "status": order_row["status"]
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при создании заказа: {str(e)}")
    finally:
        await conn.close()