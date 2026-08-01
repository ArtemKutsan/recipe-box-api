# recipe-box-api

Минимальный backend для RecipeBox.

## Каркас

```txt
src/
├── server.js
├── app.js
├── api/
│   └── v1/
│       ├── middleware/
│       │   ├── optionalAuth.js
│       │   └── requireAuth.js
│       ├── modules/
│       │   ├── auth/
│       │   ├── cuisines/
│       │   ├── favorites/
│       │   ├── meal-plans/
│       │   ├── meal-types/
│       │   ├── recipes/
│       │   └── users/
│       ├── routes/
│       └── router.js
├── config/
├── db/
│   ├── models/
│   │   ├── Cuisine.js
│   │   ├── Favorite.js
│   │   ├── MealPlan.js
│   │   ├── MealType.js
│   │   ├── Recipe.js
│   │   └── User.js
│   └── scripts/
│       ├── backfillRecipePublicIds.js
│       └── seedRecipeDictionaries.js
├── middlewares/
│   ├── errorHandler.js
│   └── notFound.js
├── shared/
│   ├── meal-plans/
│   │   └── constants.js
│   └── recipes/
│       └── constants.js
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

Общий для всего Express-приложения слой промежуточной обработки:

- обработка 404
- обработка ошибок

### `src/api/v1/`

Версионированный HTTP-слой приложения:

- `router.js` собирает все маршруты первой версии API
- `middleware/` определяет пользователя по JWT и защищает маршруты первой версии
- `routes/` связывает URL и HTTP-методы с middleware и контроллерами
- `modules/` содержит controller, service, response и validation конкретной версии API
- `auth/`, `cuisines/`, `favorites/`, `meal-plans/`, `meal-types/`, `recipes/` и `users/` содержат HTTP-логику соответствующих доменов
- `app.js` подключает этот router по адресу `/api/v1`

### `src/db/`

Слой хранения данных:

- подключение к выбранному провайдеру базы данных
- Mongoose-схемы и модели в `models/`
- seed и backfill скрипты для данных в `scripts/`
- `Cuisine.js`, `Favorite.js`, `MealPlan.js`, `MealType.js`, `Recipe.js` и `User.js` содержат Mongoose-схемы и модели доменов

### `src/shared/`

Общий код, который нужен нескольким слоям приложения. Meal Plan schema и API используют один набор дней, периодов и пустых слотов из `shared/meal-plans/constants.js`, а Recipe schema и API — общие значения сложности и видимости из `shared/recipes/constants.js`.

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
