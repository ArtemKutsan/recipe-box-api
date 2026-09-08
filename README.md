# recipe-box-api

Минимальный backend для RecipeBox.

## Каркас

```txt
src/
├── server.js
├── app.js
├── api/
│   └── v1/
│       ├── routes/
│       └── router.js
├── config/
├── db/
│   ├── models/
│   │   ├── AuthSession.js
│   │   ├── Comment.js
│   │   ├── Cuisine.js
│   │   ├── Favorite.js
│   │   ├── MealPlan.js
│   │   ├── MealType.js
│   │   ├── Notification.js
│   │   ├── Post.js
│   │   ├── Recipe.js
│   │   └── User.js
│   └── scripts/
│       ├── backfillRecipePublicIds.js
│       ├── seedRecipeComments.js
│       ├── seedRecipeDictionaries.js
│       └── seedRecipePosts.js
├── integrations/
│   ├── http/
│   │   └── session-cookie.js
│   ├── socket-io/
│   └── storage/
├── middlewares/
│   ├── auth/
│   │   ├── optional.js
│   │   └── require.js
│   ├── csrf/
│   ├── errorHandler.js
│   └── notFound.js
├── modules/
│   ├── auth/
│   ├── comments/
│   ├── cuisines/
│   ├── favorites/
│   ├── feed/
│   ├── meal-plans/
│   ├── meal-types/
│   ├── notifications/
│   ├── posts/
│   ├── recipes/
│   ├── uploads/
│   └── users/
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
- `auth/` проверяет session cookie и кладёт сырого пользователя в `req.authUser`
- `csrf/` проверяет Origin для изменяющих запросов

### `src/api/v1/`

Версионированная композиция HTTP API:

- `router.js` собирает все маршруты первой версии API
- `routes/` связывает URL и HTTP-методы с middleware и feature-контроллерами

### `src/modules/`

Feature-first слой приложения. Каждый feature-модуль хранит свою бизнес-логику,
работу с моделями и versioned HTTP-код в `api/v1/`.

- общий код feature находится на уровне модуля, например `auth/service.js`
- versioned controller, response, validation и API-specific service находятся в `api/v1/`
- repositories находятся внутри соответствующего feature-модуля

### `src/integrations/`

Интеграции с внешними транспортами и хранилищами:

- `http/session-cookie.js` читает и устанавливает session cookie
- `socket-io/` содержит Socket.IO server, registry и gateway
- `storage/` содержит интеграцию с S3

### `src/db/`

Слой хранения данных:

- подключение к выбранному провайдеру базы данных
- Mongoose-схемы и модели в `models/`
- seed и backfill скрипты для данных в `scripts/`
- `npm run seed:recipe-posts` добавляет десять тестовых постов с заголовками и безопасно обновляет их при повторном запуске.
- `AuthSession.js`, `Cuisine.js`, `Favorite.js`, `MealPlan.js`, `MealType.js`, `Recipe.js` и `User.js` содержат Mongoose-схемы и модели доменов
- `AuthSession.js` описывает одну запись о входе; такие записи хранятся в коллекции `authSessions` и уже подключены к Login/Register

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

`POST /api/v1/uploads/upload-url` требует cookie-сессию и принимает:

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

Для чтения файла используется `POST /api/v1/uploads/download-url` с `fileKey` в теле.
Backend сначала проверяет связь файла с Recipe или User и доступ текущего пользователя,
а затем возвращает временный `downloadUrl`.

## Запуск

```bash
npm install
npm run dev
```
