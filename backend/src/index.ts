import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/supabase.js';
import scraperRoutes from './routes/scraper.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/scraper', scraperRoutes);

// Health check
app.get('/health', async (_req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'OnTrack Backend',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      scraper: {
        status: 'GET /api/scraper/status',
        scrape: 'POST /api/scraper/scrape',
        stats: 'GET /api/scraper/stats',
        subjects: 'GET /api/scraper/subjects',
      },
    },
  });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 OnTrack Backend Server                           ║
║                                                       ║
║   Running on: http://localhost:${PORT}                  ║
║                                                       ║
║   Endpoints:                                          ║
║   • GET  /health          - Health check              ║
║   • GET  /api/scraper/status  - Scraper status        ║
║   • POST /api/scraper/scrape  - Start scraping        ║
║   • GET  /api/scraper/stats   - Course statistics     ║
║   • GET  /api/scraper/subjects - List subjects        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

