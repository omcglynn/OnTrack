import { chromium, Browser, Page } from 'playwright';
import type { ScrapedCourse, ScrapedSection, ScraperConfig, ScrapeResult, ScrapeError } from '../types/index.js';
import { parsePrerequisites } from './prerequisites.js';

/**
 * Coursicle Scraper for Temple University
 * 
 * Scrapes course information from coursicle.com/temple
 * 
 * URL Structure:
 * - Subject list: https://www.coursicle.com/temple/courses/
 * - Subject courses: https://www.coursicle.com/temple/courses/CIS/
 * - Course detail: https://www.coursicle.com/temple/courses/CIS/1051/
 */

const BASE_URL = 'https://www.coursicle.com';

export class CousicleScraper {
  private browser: Browser | null = null;
  private config: ScraperConfig;
  private errors: ScrapeError[] = [];

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * Initialize the browser
   * @param headless - Whether to run in headless mode (default: true, set to false for debugging)
   */
  async init(headless: boolean = true): Promise<void> {
    console.log(`🚀 Initializing Playwright browser (headless: ${headless})...`);
    this.browser = await chromium.launch({
      headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      slowMo: headless ? 0 : 100, // Slow down when visible for debugging
    });
    console.log('✅ Browser initialized');
  }

  /**
   * Create a new page with realistic browser settings to avoid bot detection
   */
  private async createPage(): Promise<Page> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      geolocation: { latitude: 39.9812, longitude: -75.1553 }, // Philadelphia
      permissions: ['geolocation'],
    });
    
    const page = await context.newPage();
    
    // Add realistic HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    });
    
    // Override webdriver detection
    await page.addInitScript(() => {
      // Override the `navigator.webdriver` property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
    
    return page;
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 Browser closed');
    }
  }

  /**
   * Delay helper for rate limiting with randomization to appear more human
   */
  private async delay(ms: number = this.config.delayMs): Promise<void> {
    // Add 0-50% random variation to appear more human
    const variation = ms * (0.5 * Math.random());
    const actualDelay = ms + variation;
    return new Promise(resolve => setTimeout(resolve, actualDelay));
  }

  /**
   * Get all available subjects for the university
   */
  async getSubjects(): Promise<string[]> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.createPage();
    const subjects: string[] = [];

    try {
      const url = `${BASE_URL}/${this.config.universityCode}/courses/`;
      console.log(`📚 Fetching subjects from: ${url}`);
      
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait for the subject list to load
      await page.waitForSelector('.subjectList, .subject-list, [class*="subject"]', { timeout: 10000 });
      
      // Get all subject codes - Coursicle uses various selectors
      const subjectElements = await page.$$('.subjectList a, .subject-list a, [class*="subjectRow"] a, a[href*="/courses/"]');
      
      for (const element of subjectElements) {
        const href = await element.getAttribute('href');
        if (href) {
          // Extract subject code from URL like /temple/courses/CIS/
          const match = href.match(/\/courses\/([A-Z]{2,4})\/?$/i);
          if (match) {
            subjects.push(match[1].toUpperCase());
          }
        }
      }

      // Fallback: try to get text content if href parsing fails
      if (subjects.length === 0) {
        const textElements = await page.$$('.subjectList .code, [class*="subject"] .code, [class*="subjectCode"]');
        for (const element of textElements) {
          const text = await element.textContent();
          if (text) {
            const code = text.trim().toUpperCase();
            if (/^[A-Z]{2,4}$/.test(code)) {
              subjects.push(code);
            }
          }
        }
      }

      console.log(`✅ Found ${subjects.length} subjects`);
      return [...new Set(subjects)]; // Remove duplicates
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      this.errors.push({
        type: 'network',
        message: `Failed to fetch subjects: ${error}`,
        timestamp: new Date(),
      });
      return [];
    } finally {
      await page.context().close();
    }
  }

  /**
   * Get all courses for a specific subject
   * Returns both number (int for DB) and numberStr (string with leading zeros for URLs)
   */
  async getCourseList(subject: string): Promise<{ subject: string; number: number; numberStr: string }[]> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.createPage();
    const courses: { subject: string; number: number; numberStr: string }[] = [];

    try {
      const url = `${BASE_URL}/${this.config.universityCode}/courses/${subject}/`;
      console.log(`📖 Fetching courses for ${subject} from: ${url}`);
      
      // Navigate and wait for full page load
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for content to load - Coursicle needs extra time for dynamic content
      await this.delay(5000);
      
      // Get all course links using full resolved URL (not attribute value)
      const courseData = await page.evaluate((subj) => {
        const links = Array.from(document.querySelectorAll('a'));
        const results: { subject: string; number: number; numberStr: string }[] = [];
        
        links.forEach(link => {
          // Use the fully resolved href property (not getAttribute)
          const href = link.href;
          if (href) {
            // Match URLs like https://www.coursicle.com/temple/courses/CIS/0822/
            const pattern = new RegExp(`/courses/${subj}/(\\d{3,4})/?$`, 'i');
            const match = href.match(pattern);
            if (match) {
              results.push({
                subject: subj.toUpperCase(),
                number: parseInt(match[1], 10),
                numberStr: match[1], // Preserve leading zeros for URL
              });
            }
          }
        });
        
        return results;
      }, subject);

      courses.push(...courseData);

      console.log(`  Found ${courses.length} courses for ${subject}`);
      return [...new Map(courses.map(c => [`${c.subject}${c.numberStr}`, c])).values()]; // Remove duplicates
    } catch (error) {
      console.error(`❌ Error fetching course list for ${subject}:`, error);
      this.errors.push({
        type: 'network',
        subject,
        message: `Failed to fetch course list: ${error}`,
        timestamp: new Date(),
      });
      return [];
    } finally {
      await page.context().close();
    }
  }

  /**
   * Scrape detailed information for a specific course
   * @param subject - Subject code (e.g., "CIS")
   * @param number - Course number as integer for database
   * @param numberStr - Course number as string with leading zeros for URL (optional, defaults to number.toString())
   */
  async scrapeCourse(subject: string, number: number, numberStr?: string): Promise<ScrapedCourse | null> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.createPage();
    // Use numberStr for URL if provided, otherwise pad number to handle leading zeros
    const urlNumber = numberStr || number.toString();

    try {
      const url = `${BASE_URL}/${this.config.universityCode}/courses/${subject}/${urlNumber}/`;
      console.log(`    Scraping: ${subject} ${urlNumber}`);
      
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      
      // Human-like behavior: wait, scroll, move mouse
      await this.delay(1500);
      await this.simulateHumanBehavior(page);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.delay(1000);

      // Extract course information
      const course = await this.extractCourseInfo(page, subject, number);
      
      return course;
    } catch (error) {
      console.error(`❌ Error scraping ${subject} ${number}:`, error);
      this.errors.push({
        type: 'course',
        subject,
        number,
        message: `Failed to scrape: ${error}`,
        timestamp: new Date(),
      });
      return null;
    } finally {
      await page.context().close();
    }
  }

  /**
   * Simulate human-like behavior to avoid bot detection
   */
  private async simulateHumanBehavior(page: Page): Promise<void> {
    try {
      // Random mouse movement
      const x = 100 + Math.random() * 500;
      const y = 100 + Math.random() * 300;
      await page.mouse.move(x, y, { steps: 10 });
      
      // Scroll down slowly
      await page.evaluate(() => {
        window.scrollBy({ top: 300, behavior: 'smooth' });
      });
      await this.delay(500);
      
      // Scroll back up
      await page.evaluate(() => {
        window.scrollBy({ top: -100, behavior: 'smooth' });
      });
      await this.delay(300);
    } catch {
      // Ignore errors in simulation
    }
  }

  /**
   * Extract course information from the page
   * 
   * Coursicle page structure (as of 2026):
   * - Title: h1 contains "CIS 2168 - Data Structures"
   * - Credits: Listed after "Credits" label
   * - Description: Listed after "Description" label
   * - Prerequisites: May be listed after "Prerequisites" or embedded in description
   */
  private async extractCourseInfo(page: Page, subject: string, number: number): Promise<ScrapedCourse | null> {
    try {
      // Get the full page text for parsing
      const pageText = await page.evaluate(() => document.body.innerText);
      
      // Get course title from h1 or page text
      let title = `${subject} ${number}`;
      const h1Text = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1?.textContent?.trim() || '';
      });
      
      if (h1Text) {
        // Extract title from "CIS 2168 - Data Structures" format
        const titleMatch = h1Text.match(/[A-Z]{2,4}\s*\d{3,4}\s*[-–]\s*(.+)/);
        if (titleMatch) {
          title = titleMatch[1].trim();
        } else {
          title = h1Text.replace(new RegExp(`^${subject}\\s*${number}\\s*[-–:]?\\s*`, 'i'), '').trim();
        }
      }

      // Extract credits from page text - look for "Credits\n4" pattern
      let credits = 3; // default
      const creditsMatch = pageText.match(/Credits\s*\n\s*(\d+)/i);
      if (creditsMatch) {
        credits = parseInt(creditsMatch[1], 10);
      }

      // Extract description - look for "Description\n..." pattern
      let description = '';
      const descMatch = pageText.match(/Description\s*\n\s*([^\n]+(?:\n(?!Usually Held|Recent|Spring|Fall)[^\n]+)*)/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }

      // Extract prerequisites - look for explicit "Prerequisites:" or from description
      let prereqText: string | null = null;
      
      // First try explicit prerequisites section
      const prereqMatch = pageText.match(/Prerequisites?[:\s]*\n?\s*([^\n]+)/i);
      if (prereqMatch && !prereqMatch[1].includes('NOTE:')) {
        prereqText = prereqMatch[1].trim();
      }
      
      // Also check if description mentions prerequisites or "continuation of"
      if (!prereqText && description) {
        const contMatch = description.match(/(?:continuation of|requires?|prerequisite[s:]?)\s+([A-Z]{2,4}\s*\d{4}(?:\s*(?:and|or|,)\s*[A-Z]{2,4}\s*\d{4})*)/i);
        if (contMatch) {
          prereqText = contMatch[1];
        }
      }

      // Parse prerequisites into structured format
      const prerequisites = parsePrerequisites(prereqText);

      // Extract attributes from page text
      const attributes = this.extractAttributesFromText(pageText);

      // Extract section information
      const sections = this.extractSectionsFromText(pageText);

      return {
        subject: subject.toUpperCase(),
        number,
        title: title || `${subject} ${number}`,
        credits,
        description: description.trim(),
        prerequisites,
        prerequisiteText: prereqText || undefined,
        attributes,
        sections,
      };
    } catch (error) {
      console.error(`Error extracting course info:`, error);
      return null;
    }
  }

  /**
   * Extract section information from page text
   * 
   * Parses data like:
   * - "Recent Professors: James Howes, Andrew Rosen, ..."
   * - "Recent Semesters: Spring 2026, Fall 2025, ..."
   * - "Usually Held: MWF (8:30am-9:50am), TR (10:00am-11:20am)"
   */
  private extractSectionsFromText(pageText: string): ScrapedSection[] {
    const sections: ScrapedSection[] = [];
    
    try {
      // Extract recent professors
      const profMatch = pageText.match(/Recent\s*Professors?\s*\n?\s*([^\n]+)/i);
      const professors = profMatch 
        ? profMatch[1].split(',').map(p => p.trim()).filter(p => p && p.length > 1)
        : [];
      
      // Extract recent semesters/terms
      const semesterMatch = pageText.match(/Recent\s*Semesters?\s*\n?\s*([^\n]+)/i);
      const terms = semesterMatch
        ? semesterMatch[1].split(',').map(t => t.trim()).filter(t => t)
        : [];
      
      // Get the most recent term (first one listed)
      const currentTerm = terms.length > 0 ? [terms[0]] : [];
      
      // Extract "Usually Held" times - format: "MWF (8:30am-9:50am), TR (10:00am-11:20am)"
      const heldMatch = pageText.match(/Usually\s*Held\s*\n?\s*([^\n]+)/i);
      
      if (heldMatch) {
        // Parse each time slot like "MWF (8:30am-9:50am)"
        const timeSlots = heldMatch[1].match(/([MTWRFSU]+)\s*\(([^)]+)\)/gi) || [];
        
        for (const slot of timeSlots) {
          const slotMatch = slot.match(/([MTWRFSU]+)\s*\((\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)\)/i);
          if (slotMatch) {
            const daysStr = slotMatch[1];
            const timeFromStr = slotMatch[2];
            const timeToStr = slotMatch[3];
            
            const days = this.parseDays(daysStr);
            const timeFrom = this.parseTimeString(timeFromStr);
            const timeTo = this.parseTimeString(timeToStr);
            
            // Create a section for each professor (or TBA if none)
            const instructorsToUse = professors.length > 0 ? professors : ['TBA'];
            
            // For simplicity, create one section per time slot with first professor
            sections.push({
              instructor: instructorsToUse[0] || 'TBA',
              days,
              timeFrom,
              timeTo,
              terms: currentTerm,
            });
          }
        }
      }
      
      // If no "Usually Held" but we have professors, create placeholder sections
      if (sections.length === 0 && professors.length > 0) {
        for (const prof of professors.slice(0, 3)) { // Limit to 3 professors
          sections.push({
            instructor: prof,
            days: [],
            timeFrom: '00:00:00',
            timeTo: '00:00:00',
            terms: currentTerm,
          });
        }
      }
    } catch (error) {
      console.error('Error extracting sections:', error);
    }
    
    return sections;
  }

  /**
   * Parse a time string like "8:30am" to PostgreSQL time with timezone format
   * Returns format: "08:30:00-05:00" (EST timezone for Philadelphia)
   */
  private parseTimeString(timeStr: string): string {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) return '00:00:00-05:00';
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    // Include timezone offset for EST (Philadelphia)
    return `${hours.toString().padStart(2, '0')}:${minutes}:00-05:00`;
  }

  /**
   * Extract attributes from page text
   */
  private extractAttributesFromText(pageText: string): string[] {
    const attributes: string[] = [];
    
    // Look for GenEd attributes
    const genEdPatterns = [
      /GenEd:\s*([^,\n]+)/gi,
      /Gen\s*Ed[:\s]+([^,\n]+)/gi,
      /Quantitative\s*(?:Reasoning|Literacy)\s*[AB]?/gi,
      /Writing\s*Intensive/gi,
      /Race\s*(?:&|and)?\s*Diversity/gi,
      /Science\s*(?:&|and)?\s*Technology/gi,
      /World\s*Society/gi,
      /Human\s*Behavior/gi,
      /Arts/gi,
      /U\.?S\.?\s*Society/gi,
    ];

    for (const pattern of genEdPatterns) {
      const matches = pageText.match(pattern);
      if (matches) {
        attributes.push(...matches.map(m => m.trim()));
      }
    }

    return [...new Set(attributes)];
  }

  /**
   * Scrape sections for a course (if needed)
   */
  async scrapeSections(subject: string, number: number): Promise<ScrapedSection[]> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.createPage();
    const sections: ScrapedSection[] = [];

    try {
      const url = `${BASE_URL}/${this.config.universityCode}/courses/${subject}/${number}/`;
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.delay(500);

      // Look for section information
      const sectionElements = await page.$$('[class*="section"], [class*="Section"], .classInfo');

      for (const element of sectionElements) {
        const instructor = await this.getTextFromElement(element, '[class*="instructor"], [class*="prof"]') || 'TBA';
        const daysText = await this.getTextFromElement(element, '[class*="days"], [class*="day"]') || '';
        const timeText = await this.getTextFromElement(element, '[class*="time"]') || '';

        const days = this.parseDays(daysText);
        const { timeFrom, timeTo } = this.parseTime(timeText);

        if (days.length > 0 || instructor !== 'TBA') {
          sections.push({
            instructor,
            days,
            timeFrom,
            timeTo,
            terms: [], // Would need to determine current term
          });
        }
      }
    } catch (error) {
      console.error(`Error scraping sections for ${subject} ${number}:`, error);
    } finally {
      await page.context().close();
    }

    return sections;
  }

  /**
   * Helper: Get text content using multiple selectors
   */
  private async getTextContent(page: Page, selectors: string[]): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch {
        // Try next selector
      }
    }
    return null;
  }

  /**
   * Helper: Get text content from a child element
   */
  private async getTextFromElement(parent: any, selector: string): Promise<string | null> {
    try {
      const element = await parent.$(selector);
      if (element) {
        const text = await element.textContent();
        return text?.trim() || null;
      }
    } catch {
      // Element not found
    }
    return null;
  }

  /**
   * Helper: Parse credits from text
   */
  private parseCredits(text: string | null): number {
    if (!text) return 3; // Default to 3 credits
    
    const match = text.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return Math.round(parseFloat(match[1]));
    }
    return 3;
  }

  /**
   * Helper: Parse days from text (e.g., "MWF" -> ["M", "W", "F"])
   */
  private parseDays(text: string): string[] {
    const days: string[] = [];
    const dayMap: Record<string, string> = {
      'M': 'M', 'Mo': 'M', 'Mon': 'M', 'Monday': 'M',
      'T': 'T', 'Tu': 'T', 'Tue': 'T', 'Tuesday': 'T',
      'W': 'W', 'We': 'W', 'Wed': 'W', 'Wednesday': 'W',
      'R': 'R', 'Th': 'R', 'Thu': 'R', 'Thursday': 'R',
      'F': 'F', 'Fr': 'F', 'Fri': 'F', 'Friday': 'F',
      'S': 'S', 'Sa': 'S', 'Sat': 'S', 'Saturday': 'S',
      'U': 'U', 'Su': 'U', 'Sun': 'U', 'Sunday': 'U',
    };

    // Try to match day patterns
    const patterns = [
      /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/gi,
      /Mon|Tue|Wed|Thu|Fri|Sat|Sun/gi,
      /Mo|Tu|We|Th|Fr|Sa|Su/gi,
      /[MTWRFSU]/g,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          const day = dayMap[match] || dayMap[match.charAt(0).toUpperCase()];
          if (day && !days.includes(day)) {
            days.push(day);
          }
        }
        if (days.length > 0) break;
      }
    }

    return days;
  }

  /**
   * Helper: Parse time range from text
   */
  private parseTime(text: string): { timeFrom: string; timeTo: string } {
    const defaultTime = { timeFrom: '00:00:00', timeTo: '00:00:00' };
    
    if (!text) return defaultTime;

    // Try to match time patterns like "9:00 AM - 10:15 AM" or "09:00-10:15"
    const timePattern = /(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?\s*[-–to]+\s*(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i;
    const match = text.match(timePattern);

    if (!match) return defaultTime;

    const parseTimeComponent = (hour: string, minute: string | undefined, ampm: string | undefined): string => {
      let h = parseInt(hour, 10);
      const m = minute ? parseInt(minute, 10) : 0;
      
      if (ampm) {
        const isPM = ampm.toUpperCase() === 'PM';
        if (isPM && h !== 12) h += 12;
        if (!isPM && h === 12) h = 0;
      }

      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
    };

    return {
      timeFrom: parseTimeComponent(match[1], match[2], match[3]),
      timeTo: parseTimeComponent(match[4], match[5], match[6] || match[3]),
    };
  }

  /**
   * Run full scrape for configured subjects or all subjects
   */
  async scrapeAll(subjects?: string[]): Promise<{ courses: ScrapedCourse[]; result: ScrapeResult }> {
    const startTime = Date.now();
    const allCourses: ScrapedCourse[] = [];
    this.errors = [];

    try {
      await this.init();

      // Get subjects to scrape
      const subjectsToScrape = subjects || this.config.subjects || await this.getSubjects();
      console.log(`\n📚 Scraping ${subjectsToScrape.length} subjects: ${subjectsToScrape.join(', ')}\n`);

      for (const subject of subjectsToScrape) {
        console.log(`\n📖 Processing subject: ${subject}`);
        
        // Get course list for this subject
        const courseList = await this.getCourseList(subject);
        await this.delay();

        // Scrape each course
        for (const { subject: subj, number, numberStr } of courseList) {
          const course = await this.scrapeCourse(subj, number, numberStr);
          if (course) {
            allCourses.push(course);
          }
          await this.delay();
        }
      }

      const result: ScrapeResult = {
        success: true,
        coursesScraped: allCourses.length,
        sectionsScraped: 0,
        errors: this.errors,
        duration: Date.now() - startTime,
      };

      console.log(`\n✅ Scraping complete!`);
      console.log(`   Courses: ${result.coursesScraped}`);
      console.log(`   Errors: ${result.errors.length}`);
      console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);

      return { courses: allCourses, result };
    } finally {
      await this.close();
    }
  }
}

/**
 * Create a scraper instance for Temple University
 * Default delay increased to 2000ms to avoid bot detection
 */
export function createTempleScraper(universityId: string): CousicleScraper {
  return new CousicleScraper({
    universityCode: 'temple',
    universityId,
    delayMs: parseInt(process.env.SCRAPE_DELAY_MS || '2000', 10),
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_PAGES || '1', 10),
  });
}

