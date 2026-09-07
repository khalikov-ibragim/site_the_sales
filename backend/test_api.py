import requests #Подключаю библиотеку request

BASE = "http://localhost:8000" #Создал переменную с адрессом который буду часто использовать

EMAIL = "test@example.com" # Создал переменные с тестовыми данными
PASSWORD = "TestPass123"   # Создал переменные с тестовыми данными

def main(): #Создание функции с именем main
    # 1. Список товаров должен отвечать 200
    r = requests.get(f"{BASE}/api/products") #Отправляет GET-запрос по адрессу и делает возврат обьекта r
    assert r.status_code == 200, f"products: ожидал 200, получил {r.status_code}" #если условие правда то ничего не происходит.Если лож то программа падает  с этим сообщением
    print(f"[OK] products -> {r.status_code}")

    # 2. Регистрация нового пользователя -> 200
    r = requests.post(f"{BASE}/api/auth/register", json={ # Отправляю тело запроса в виде логина и парля  в виде JSON-строки
        "name": "Тест Юзер",
        "email": EMAIL,
        "password": PASSWORD,
    })
    assert r.status_code == 200, f"register: ожидал 200, получил {r.status_code}" #Ожидаем такой вывод кода если нет программа падает
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
