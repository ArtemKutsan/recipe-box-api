import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 4000;

// Поднимаем HTTP-сервер на порту из окружения или на дефолтном порту.
app.listen(port, () => {
  console.log(`recipe-box-api listening on ${port}`);
});
