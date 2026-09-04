import requests

BASE = "http://localhost:8000"

EMAIL = "test@example.com"
PASSWORD = "TestPass123"

def main():
    # 1. Список товаров должен отвечать 200
    r = requests.get(f"{BASE}/api/products")
    assert r.status_code == 200, f"products: ожидал 200, получил {r.status_code}"
    print(f"[OK] products -> {r.status_code}")

    # 2. Регистрация нового пользователя -> 200
    r = requests.post(f"{BASE}/api/auth/register", json={
        "name": "Тест Юзер",
        "email": EMAIL,
        "password": PASSWORD,
    })
    assert r.status_code == 200, f"register: ожидал 200, получил {r.status_code}"
    print(f"[OK] register -> {r.status_code}")

    # 3. Логин с ПРАВИЛЬНЫМ паролем -> 200 + токен
    r = requests.post(f"{BASE}/api/auth/login", json={
        "email": EMAIL,
        "password": PASSWORD,
    })
    assert r.status_code == 200, f"login: ожидал 200, получил {r.status_code}"
    token = r.json()["access_token"]
    print(f"[OK] login (верный пароль) -> {r.status_code}, токен получен")

    # 4. Логин с НЕправильным паролем -> должен ОТКАЗАТЬ (401)
    r = requests.post(f"{BASE}/api/auth/login", json={
        "email": EMAIL,
        "password": "WRONGPASS123",
    })
    assert r.status_code == 401, f"login (кривой пароль): ожидал 401, получил {r.status_code}"
    print(f"[OK] login (неверный пароль) -> {r.status_code} (отказ работает)")

    # 5. Данные текущего юзера с токеном -> 200
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE}/api/auth/me", headers=headers)
    assert r.status_code == 200, f"/me: ожидал 200, получил {r.status_code}"
    print(f"[OK] /me -> {r.status_code}")

    print("\nВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО")

if __name__ == "__main__":
    main()
