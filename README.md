# Аренда жилья

Учебное full-stack приложение для управления объектами недвижимости, договорами аренды, платежами, коммунальными счетами и документами.

## Сценарии и экраны

- Арендодатель просматривает объекты, создаёт объекты и договоры.
- Пользователь просматривает договор и связанные с ним платежи, счета и документы.
- В списках есть поиск и фильтры; в шапке находится переход в личный кабинет.
- На этапе лабораторной №3 frontend использует демонстрационные данные. Созданные через формы записи хранятся в состоянии страницы и пропадают после перезагрузки. Вход пока демонстрационный.

Экраны: `/login`, `/` (объекты), `/leases`, `/leases/:id` и `/account` (личный кабинет).

## Стек

Backend: Python, FastAPI, SQLAlchemy, PostgreSQL. Frontend: React, TypeScript, Vite, Mantine, React Router. Локальная база и backend запускаются через Docker Compose.

## Структура

```text
backend/app/
  main.py, config.py, database.py, crud.py
  models/       модели SQLAlchemy по сущностям
  schemas/      Pydantic-схемы по сущностям
  routers/      HTTP-маршруты API
frontend/src/
  components/   общие компоненты, состояния списка
  pages/        экраны приложения
  data/demo.ts  типы и демонстрационные данные
```

Модель данных: `Property` — `Lease` — `Payment`, `Bill`, `Document`. У одного объекта несколько договоров, у договора — несколько платежей, счетов и документов. Связи в БД заданы внешними ключами.

## Единые настройки окружения

Создайте **один** файл окружения в корне проекта:

```powershell
Copy-Item .env.example .env
```

Укажите собственный `POSTGRES_PASSWORD`. Файл `.env` игнорируется Git. Docker Compose и локальный backend используют этот корневой файл; отдельного `backend/.env` больше нет.

## Запуск через Docker

Нужен Docker Desktop. Из корня проекта выполните:

```powershell
docker compose up --build
```

Поднимутся PostgreSQL и FastAPI. Таблицы создаются при старте backend. Swagger: <http://localhost:8000/docs>.

Frontend запускается в отдельном терминале (frontend-сервиса в Compose нет):

```powershell
cd frontend
npm install
npm run dev
```

Откройте адрес Vite, обычно <http://localhost:5173>.

Остановить контейнеры: `docker compose down`. Для удаления тома с данными базы: `docker compose down -v`.

## Запуск без Docker

Нужны Python 3.12+, Node.js 18+ и локальный PostgreSQL. Сначала создайте корневой `.env`, затем запустите backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

В другом терминале из корня проекта запустите frontend командами `cd frontend`, `npm install`, `npm run dev`.

## API

Swagger: <http://localhost:8000/docs>.

- `/properties` — CRUD объектов.
- `/leases` — CRUD договоров.
- `/leases/{id}/payments`, `/payments/{id}` — операции с платежами.
- `/leases/{id}/bills`, `/bills/{id}` — операции со счетами.
- `/leases/{id}/documents`, `/documents/{id}/download` — документы.

Схемы проверяют поля запросов; сервер возвращает `404` для отсутствующей записи, `400` для недопустимого срока договора и `422` для ошибок валидации.

Снимки экранов находятся в `docs/screenshots/`; после существенных изменений интерфейса их следует обновить перед сдачей.
