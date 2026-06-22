import 'dotenv/config';

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || '';

export default {
  port,
  mongoUri,
};
