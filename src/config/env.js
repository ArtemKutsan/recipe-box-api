import 'dotenv/config';

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || '';
const jwtSecret = process.env.JWT_SECRET || '';
const clientOrigin = process.env.CLIENT_ORIGIN || '';

export default {
  port,
  mongoUri,
  jwtSecret,
  clientOrigin,
};
