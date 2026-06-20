import express from 'express';
import healthRouter from './routes/health.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
