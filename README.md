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
│       │   └── auth/
│       │       ├── optional.js
│       │       ├── require.js
│       │       └── session.js
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
│   │   ├── AuthSession.js
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
├── domain/
│   ├── meal-plans/
│   │   └── constants.js
│   └── recipes/
│       └── constants.js
└── utils/
```

Для медиафайлов backend использует отдельную интеграцию `src/integrations/storage/`.
Она выдаёт временные S3-ссылки, но не хранит файлы в API и не отдаёт AWS-ключи frontend.

## Назначение

`recipe-box-api` отвечает за серверную часть RecipeBox:

- аутентификацию и авторизацию через серверные сессии в HttpOnly cookie
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
- настройки серверных сессий и cookie
- настройки CORS-origin

### `src/middlewares/`

Общий для всего Express-приложения слой промежуточной обработки:

- обработка 404
- обработка ошибок

### `src/api/v1/`

Версионированный HTTP-слой приложения:

- `router.js` собирает все маршруты первой версии API
- `middleware/` определяет пользователя по cookie-сессии и защищает маршруты первой версии
- `routes/` связывает URL и HTTP-методы с middleware и контроллерами
- `modules/` содержит controller, service, response и validation конкретной версии API
- `auth/`, `cuisines/`, `favorites/`, `meal-plans/`, `meal-types/`, `recipes/` и `users/` содержат HTTP-логику соответствующих доменов
- `app.js` подключает этот router по адресу `/api/v1`

### `src/db/`

Слой хранения данных:

- подключение к выбранному провайдеру базы данных
- Mongoose-схемы и модели в `models/`
- seed и backfill скрипты для данных в `scripts/`
- `AuthSession.js`, `Cuisine.js`, `Favorite.js`, `MealPlan.js`, `MealType.js`, `Recipe.js` и `User.js` содержат Mongoose-схемы и модели доменов
- `AuthSession.js` описывает одну запись о входе; такие записи хранятся в коллекции `authSessions` и уже подключены к Login/Register

### `src/domain/`

Правила предметной области, которые нужны нескольким слоям приложения. Meal Plan schema и API используют один набор дней, периодов и пустых слотов из `domain/meal-plans/constants.js`, а Recipe schema и API — общие значения сложности и видимости из `domain/recipes/constants.js`.

### `src/utils/`

Общие утилиты, не привязанные к конкретному домену.

## Контракт окружения

Backend использует переменные окружения:

- `PORT`
- `DB_ENABLED`
- `DB_PROVIDER`
- `MONGODB_URI`
- `SESSION_COOKIE_NAME`
- `SESSION_EXPIRES_IN`
- `SESSION_STORE`
- `SESSION_COOKIE_SECURE`
- `SESSION_COOKIE_SAME_SITE`
- `CLIENT_ORIGIN`
- `MEDIA_STORAGE_PROVIDER`
- `AWS_REGION`
- `AWS_S3_BUCKET`

Для изменяющих запросов backend требует заголовок `Origin`. Он должен совпадать
с `CLIENT_ORIGIN`; запросы без `Origin` получают `403`. В Postman этот заголовок
нужно добавить вручную.

## API-подход

API строится как REST-сервис с единым префиксом `/api/v1`.

### Загрузка медиафайлов

`POST /api/v1/uploads/presign` требует cookie-сессию и принимает:

```json
{
  "purpose": "recipe",
  "contentType": "image/jpeg",
  "sizeBytes": 123456
}
```

Backend возвращает временный `uploadUrl` и `fileKey`. Frontend использует `uploadUrl`
для прямой загрузки файла в S3, а `fileKey` позже сохраняется в рецепте или профиле.
Сейчас этот endpoint не меняет Recipe/User и не принимает сам файл через API.

## Запуск

```bash
npm install
npm run dev
```
