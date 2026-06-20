import express from 'express';
import apiRouter from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use(apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
