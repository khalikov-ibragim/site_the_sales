from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ---------- Товары ----------
class Product(BaseModel):
    id: int
    name: str
    category: str
    specs: Optional[str] = None
    price: float
    old_price: Optional[float] = None
    rating: float = 0
    reviews: int = 0
    badge: Optional[str] = None
    stock: int = 0
    image_url: Optional[str] = None

# ---------- Пользователи ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ---------- Заказы ----------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str