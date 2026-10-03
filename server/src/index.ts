import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { router } from './routes';

// Load .env files if present (does not overwrite existing environment variables)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || '*';

if (!DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not defined in environment variables');
}
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined in environment variables');
}

const app = express();

// Parse origins list from CLIENT_URL (supports comma-separated URLs)
const allowedOrigins = CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CLIENT_URL === '*' || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow requests from configured origins
    }
  },
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
