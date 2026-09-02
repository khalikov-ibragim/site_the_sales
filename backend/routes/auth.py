from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db_connection
from models import UserCreate, UserLogin, UserResponse, TokenResponse
from auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    """Получить текущего пользователя по JWT-токену."""
    payload = decode_token(token.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    
    conn = await get_db_connection()
    try:
        user = await conn.fetchrow("SELECT id, name, email FROM users WHERE id = $1", int(user_id))
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        return dict(user)
    finally:
        await conn.close()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Регистрация нового пользователя."""
    conn = await get_db_connection()
    try:
        # Проверяем, существует ли email
        existing = await conn.fetchrow("SELECT id FROM users WHERE email = $1", user_data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
        
        # Хэшируем пароль и сохраняем
        hashed = hash_password(user_data.password)
        row = await conn.fetchrow(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
            user_data.name, user_data.email, hashed
        )
        return dict(row)
    finally:
        await conn.close()

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    """Вход в систему."""
    conn = await get_db_connection()
    try:
        user = await conn.fetchrow(
            "SELECT id, name, email, password_hash FROM users WHERE email = $1",
            login_data.email
        )
        if not user:
            raise HTTPException(status_code=401, detail="Неверный email или пароль")
        
        if not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Неверный email или пароль")
        
        # Создаем JWT-токен
        token = create_access_token({"sub": str(user["id"])})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
        }
    finally:
        await conn.close()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Получить данные текущего пользователя."""
    return current_user