import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { router } from './routes';

dotenv.config();

const { PORT, DATABASE_URL, JWT_SECRET, CLIENT_URL } = process.env;

if (!PORT) {
  throw new Error('PORT is not defined in environment variables');
}
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
if (!CLIENT_URL) {
  throw new Error('CLIENT_URL is not defined in environment variables');
}

const app = express();

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api', router);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Серверде күтпеген қате орын алды' });
});

app.listen(PORT, () => {
  console.log(`ET NIS Server is running on port ${PORT}`);
});
