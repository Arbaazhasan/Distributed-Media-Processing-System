import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import uploadRouter from './routes/upload.js';
import videoRouter from './routes/video.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve output processed files statically
const processedDir = path.resolve(__dirname, '../../processed');
app.use('/processed', express.static(processedDir));

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/videos', videoRouter);

app.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'healthy', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`[API-Gateway] Server running on http://localhost:${PORT}`);
});
