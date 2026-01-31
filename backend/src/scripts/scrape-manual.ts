#!/usr/bin/env tsx
/**
 * Manual-Assist Scraper
 * 
 * Opens a browser window and waits for you to solve any CAPTCHA/bot detection.
 * After solving, press Enter to continue scraping.
 * 
 * Usage: npx tsx src/scripts/scrape-manual.ts [subjects...]
 * Example: npx tsx src/scripts/scrape-manual.ts CIS MATH
 */

import dotenv from 'dotenv';
dotenv.config();

import * as readline from 'readline';
import { chromium, Browser, Page } from 'playwright';
import { createTempleScraper } from '../scraper/coursicle.js';
import { testConnection } from '../config/supabase.js';
import { getOrCreateTempleUniversity, upsertCourseWithSections } from '../utils/db.js';

const BASE_URL = 'https://www.coursicle.com';

function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise(resolve => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🔧 Manual-Assist Course Scraper                     ║
║                                                       ║
║   This mode opens a visible browser. If a CAPTCHA     ║
║   appears, solve it manually, then press Enter.       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Parse arguments
  const args = process.argv.slice(2);
  const subjects = args.filter(a => /^[A-Z]{2,4}$/i.test(a)).map(s => s.toUpperCase());
  
  if (subjects.length === 0) {
    console.log('Usage: npx tsx src/scripts/scrape-manual.ts CIS MATH PHYS');
    console.log('Please specify at least one subject code.\n');
    process.exit(1);
  }

  console.log(`📚 Subjects to scrape: ${subjects.join(', ')}\n`);

  // Test database connection
  console.log('🔌 Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Check your .env file.');
    process.exit(1);
  }

  // Get university
  const university = await getOrCreateTempleUniversity();
  if (!university) {
    console.error('❌ Failed to get university');
    process.exit(1);
  }
  console.log(`✅ University: ${university.name} (${university.id})\n`);

  // Launch browser in headed mode
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    slowMo: 50,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();

  try {
    // First, navigate to main courses page and wait for user to solve any CAPTCHA
    const mainUrl = `${BASE_URL}/temple/courses/`;
    console.log(`\n🌐 Opening: ${mainUrl}`);
    await page.goto(mainUrl, { waitUntil: 'load' });
    
    console.log('\n' + '='.repeat(60));
    console.log('👀 CHECK THE BROWSER WINDOW');
    console.log('If you see a CAPTCHA or "You don\'t smell human", solve it now.');
    console.log('='.repeat(60));
    
    await waitForEnter('\n✋ Press ENTER when the page loads correctly...');

    // Now scrape each subject
    let totalCourses = 0;
    let totalSections = 0;

    for (const subject of subjects) {
      console.log(`\n📖 Processing subject: ${subject}`);
      
      // Get course list for this subject
      const subjectUrl = `${BASE_URL}/temple/courses/${subject}/`;
      await page.goto(subjectUrl, { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      
      // Check if we hit bot detection
      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.includes("don't smell human") || pageText.includes('robot')) {
        console.log('\n⚠️  Bot detection triggered!');
        await waitForEnter('Solve the CAPTCHA and press ENTER to continue...');
      }

      // Extract course list - keep numberStr for URLs, number for DB
      const courses = await page.evaluate((subj) => {
        const links = Array.from(document.querySelectorAll('a'));
        const results: { subject: string; number: number; numberStr: string }[] = [];
        
        links.forEach(link => {
          const href = link.href;
          const match = href.match(new RegExp(`/courses/${subj}/(\\d{3,4})/?$`, 'i'));
          if (match) {
            results.push({
              subject: subj.toUpperCase(),
              number: parseInt(match[1], 10),
              numberStr: match[1], // Keep original string with leading zeros
            });
          }
        });
        
        return [...new Map(results.map(c => [`${c.subject}${c.numberStr}`, c])).values()];
      }, subject);

      console.log(`   Found ${courses.length} courses`);

      // Scrape each course
      for (const course of courses) {
        // Use numberStr (preserves leading zeros) for the URL
        const courseUrl = `${BASE_URL}/temple/courses/${course.subject}/${course.numberStr}/`;
        console.log(`   Scraping ${course.subject} ${course.numberStr}...`);
        
        await page.goto(courseUrl, { waitUntil: 'load' });
        await page.waitForTimeout(1500);
        
        // Check for bot detection
        const courseText = await page.evaluate(() => document.body.innerText);
        if (courseText.includes("don't smell human")) {
          console.log('   ⚠️  Bot detection! Please solve...');
          await waitForEnter('   Press ENTER after solving...');
        }

        // Extract course data (reuse existing scraper logic inline)
        const courseData = await page.evaluate(([subj, numStr]: [string, string]) => {
          const text = document.body.innerText;
          const h1 = document.querySelector('h1')?.textContent?.trim() || '';
          
          // Title
          let title = `${subj} ${numStr}`;
          const titleMatch = h1.match(/[A-Z]{2,4}\s*\d{3,4}\s*[-–]\s*(.+)/);
          if (titleMatch) title = titleMatch[1].trim();
          
          // Credits
          let credits = 3;
          const creditsMatch = text.match(/Credits\s*\n\s*(\d+)/i);
          if (creditsMatch) credits = parseInt(creditsMatch[1], 10);
          
          // Description
          let description = '';
          const descMatch = text.match(/Description\s*\n\s*([^\n]+(?:\n(?!Usually Held|Recent|Spring|Fall)[^\n]+)*)/i);
          if (descMatch) description = descMatch[1].trim();
          
          // Professors
          const profMatch = text.match(/Recent\s*Professors?\s*\n?\s*([^\n]+)/i);
          const professors = profMatch 
            ? profMatch[1].split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 1)
            : [];
          
          // Terms
          const termMatch = text.match(/Recent\s*Semesters?\s*\n?\s*([^\n]+)/i);
          const terms = termMatch
            ? termMatch[1].split(',').map((t: string) => t.trim()).filter((t: string) => t)
            : [];
          
          // Times - extract from "Usually Held" section
          // Format: "MWF (8:30am-9:50am), TR (10:00am-11:20am)"
          const heldMatch = text.match(/Usually\s*Held\s*\n?\s*([^\n]+)/i);
          const sections: any[] = [];
          
          // Debug: log what we found
          const debugHeld = heldMatch ? heldMatch[1] : 'NOT FOUND';
          
          if (heldMatch) {
            const heldText = heldMatch[1];
            // Match patterns like "MWF (8:30am-9:50am)"
            const slots = heldText.match(/([MTWRFSU]+)\s*\((\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)\)/gi) || [];
            
            for (const slot of slots) {
              const m = slot.match(/([MTWRFSU]+)\s*\((\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)\)/i);
              if (m) {
                sections.push({
                  instructor: professors[0] || 'TBA',
                  days: m[1].split(''),
                  timeFrom: m[2],
                  timeTo: m[3],
                  terms: terms.slice(0, 1),
                });
              }
            }
          }
          
          return {
            title,
            credits,
            description,
            sections,
            professors,
            terms,
            debugHeld, // For debugging time extraction
          };
        }, [course.subject, course.numberStr] as [string, string]);

        // Check if we got valid data
        if (courseData.title.includes("don't smell human")) {
          console.log(`   ❌ Bot detection on ${course.subject} ${course.numberStr}, skipping`);
          continue;
        }

        // Debug: show what was found for "Usually Held"
        console.log(`      📋 Usually Held raw: "${courseData.debugHeld || 'NOT FOUND'}"`);
        
        // Debug: show what sections were extracted
        if (courseData.sections && courseData.sections.length > 0) {
          console.log(`      📅 Sections parsed: ${courseData.sections.length}`);
          courseData.sections.forEach((s: any, i: number) => {
            console.log(`         [${i + 1}] ${s.days?.join('') || '?'} ${s.timeFrom}-${s.timeTo} (${s.instructor})`);
          });
        } else {
          console.log(`      📅 No sections with times found`);
        }

        // Save to database (use integer for DB, string was for URL)
        const scrapedCourse = {
          subject: course.subject,
          number: course.number, // Integer for database
          title: courseData.title,
          credits: courseData.credits,
          description: courseData.description,
          prerequisites: null,
          attributes: [],
          sections: courseData.sections.map((s: any) => ({
            instructor: s.instructor,
            days: s.days,
            timeFrom: parseTime(s.timeFrom),
            timeTo: parseTime(s.timeTo),
            terms: s.terms,
          })),
        };
        
        // Debug: show parsed times
        if (scrapedCourse.sections.length > 0) {
          console.log(`      🕐 Parsed times: ${scrapedCourse.sections[0].timeFrom} - ${scrapedCourse.sections[0].timeTo}`);
        }

        const result = await upsertCourseWithSections(scrapedCourse, university.id);
        if (result.courseId) {
          console.log(`   ✅ ${course.subject} ${course.numberStr}: ${courseData.title} (${result.sectionsInserted} sections)`);
          totalCourses++;
          totalSections += result.sectionsInserted;
        }

        // Small delay between courses
        await page.waitForTimeout(1000 + Math.random() * 1000);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Scraping complete!`);
    console.log(`   Courses saved: ${totalCourses}`);
    console.log(`   Sections saved: ${totalSections}`);
    console.log(`${'='.repeat(60)}\n`);

  } finally {
    await browser.close();
  }
}

/**
 * Parse time string like "8:30am" to PostgreSQL time with time zone format
 * Returns format: "08:30:00-05:00" (EST timezone for Philadelphia)
 */
function parseTime(timeStr: string): string | null {
  if (!timeStr) return null;
  
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) {
    console.log(`      ⚠️ Could not parse time: "${timeStr}"`);
    return null;
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toLowerCase();
  
  if (ampm === 'pm' && hours !== 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  
  // Return with timezone offset for EST (Philadelphia)
  // Using -05:00 for EST (standard time)
  return `${hours.toString().padStart(2, '0')}:${minutes}:00-05:00`;
}

main().catch(console.error);

