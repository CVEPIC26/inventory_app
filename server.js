import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './api/index.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from root directory (css, js, assets, static)
app.use(express.static(__dirname));

// API routes - handle /api/* with query.route parameter
app.all('/api/*', (req, res) => {
  const routePath = req.path.replace(/^\/api/, '').replace(/^\/+/, '');
  req.query = {
    ...req.query,
    route: routePath
  };
  return apiRouter(req, res);
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.get('*', (req, res) => {
  res.status(404).send('Not Found');
});

// Only start server in non-Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
