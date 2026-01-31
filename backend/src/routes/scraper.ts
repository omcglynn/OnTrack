import { Router, Request, Response } from 'express';
import { createTempleScraper } from '../scraper/coursicle.js';
import { getOrCreateTempleUniversity, batchUpsertCourses, getCourseStats } from '../utils/db.js';
import type { ApiResponse, ScrapeResult } from '../types/index.js';

const router = Router();

// Track if a scrape is currently running
let isScrapingInProgress = false;
let lastScrapeResult: ScrapeResult | null = null;

/**
 * GET /api/scraper/status
 * Get the current status of the scraper
 */
router.get('/status', async (_req: Request, res: Response) => {
  const response: ApiResponse<{
    isRunning: boolean;
    lastResult: ScrapeResult | null;
  }> = {
    success: true,
    data: {
      isRunning: isScrapingInProgress,
      lastResult: lastScrapeResult,
    },
  };
  res.json(response);
});

/**
 * POST /api/scraper/scrape
 * Trigger a scrape for specific subjects
 * Body: { subjects?: string[] }
 */
router.post('/scrape', async (req: Request, res: Response) => {
  if (isScrapingInProgress) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'A scrape is already in progress. Please wait for it to complete.',
    };
    return res.status(409).json(response);
  }

  const { subjects } = req.body as { subjects?: string[] };

  // Start scraping in background
  isScrapingInProgress = true;
  
  // Send immediate response
  res.json({
    success: true,
    data: {
      message: 'Scrape started',
      subjects: subjects || 'all',
    },
  });

  // Run scrape in background
  try {
    console.log('\n🚀 Starting scrape...');
    
    // Get or create Temple University
    const university = await getOrCreateTempleUniversity();
    if (!university) {
      throw new Error('Failed to get/create Temple University');
    }

    // Create scraper and run
    const scraper = createTempleScraper(university.id);
    const { courses, result } = await scraper.scrapeAll(subjects);

    // Save to database
    if (courses.length > 0) {
      await batchUpsertCourses(courses, university.id);
    }

    lastScrapeResult = result;
    console.log('✅ Scrape completed successfully');
  } catch (error) {
    console.error('❌ Scrape failed:', error);
    lastScrapeResult = {
      success: false,
      coursesScraped: 0,
      sectionsScraped: 0,
      errors: [{
        type: 'network',
        message: String(error),
        timestamp: new Date(),
      }],
      duration: 0,
    };
  } finally {
    isScrapingInProgress = false;
  }
});

/**
 * GET /api/scraper/stats
 * Get statistics about scraped courses
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const university = await getOrCreateTempleUniversity();
    if (!university) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get Temple University',
      });
    }

    const stats = await getCourseStats(university.id);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /api/scraper/subjects
 * Get available subjects from Coursicle (without scraping course details)
 */
router.get('/subjects', async (_req: Request, res: Response) => {
  try {
    const university = await getOrCreateTempleUniversity();
    if (!university) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get Temple University',
      });
    }

    const scraper = createTempleScraper(university.id);
    await scraper.init();
    const subjects = await scraper.getSubjects();
    await scraper.close();

    res.json({
      success: true,
      data: { subjects },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;

