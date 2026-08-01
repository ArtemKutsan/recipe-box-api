# recipe-box-api

Минимальный backend для RecipeBox.

## Каркас

```txt
src/
├── server.js
├── app.js
├── api/
│   └── v1/
│       ├── modules/
│       │   ├── auth/
│       │   ├── cuisines/
│       │   ├── meal-types/
│       │   └── users/
│       ├── routes/
│       └── router.js
├── config/
├── db/
│   └── models/
│       ├── Cuisine.js
│       ├── MealType.js
│       └── User.js
├── middlewares/
├── modules/
│   ├── favorites/
│   ├── meal-plans/
│   └── recipes/
├── shared/
└── utils/
```

## Назначение

`recipe-box-api` отвечает за серверную часть RecipeBox:

- аутентификацию и авторизацию на JWT
- работу с пользователями
- работу с рецептами
- работу с планами питания
- единый HTTP API для фронтенда

## Слои каркаса

### `src/server.js`

Точка входа приложения. Отвечает за запуск HTTP-сервера и соединение с окружением.

### `src/app.js`

Собирает Express-приложение:

- подключает middleware
- настраивает CORS
- монтирует маршруты API
- подключает обработку 404 и ошибок

### `src/config/`

Конфигурационный слой:

- чтение переменных окружения
- настройки порта
- настройки MongoDB
- настройки JWT
- настройки CORS-origin

### `src/middlewares/`

Общий слой промежуточной обработки:

- обработка 404
- обработка ошибок
- защита маршрутов
- валидация входных данных

### `src/api/v1/`

Версионированный HTTP-слой приложения:

- `router.js` собирает все маршруты первой версии API
- `routes/` связывает URL и HTTP-методы с middleware и контроллерами
- `modules/` содержит controller, service, response и validation конкретной версии API
- `auth/`, `cuisines/`, `meal-types/` и `users/` уже перенесены в новый API-слой
- `app.js` подключает этот router по адресу `/api/v1`

### `src/db/`

Слой хранения данных:

- подключение к выбранному провайдеру базы данных
- Mongoose-схемы и модели в `models/`
- seed и backfill скрипты для данных
- `Cuisine.js`, `MealType.js` и `User.js` уже перенесены в `models/`

### `src/modules/`

Доменные модули, которые ещё переносятся в версионированный API-слой:

- `recipes/`
- `favorites/`
- `meal-plans/`

После переноса HTTP-логика домена находится в `src/api/v1/modules/`, а его Mongoose-модель — в `src/db/models/`.

### `src/utils/`

Общие утилиты, не привязанные к конкретному домену.

## Контракт окружения

Backend использует переменные окружения:

- `PORT`
- `DB_ENABLED`
- `DB_PROVIDER`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`

## API-подход

API строится как REST-сервис с единым префиксом `/api/v1`.

## Запуск

```bash
npm install
npm run dev
```
