import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'recipe-box-api' });
});

app.listen(port, () => {
  console.log(`recipe-box-api listening on ${port}`);
});
