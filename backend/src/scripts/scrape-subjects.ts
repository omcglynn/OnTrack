#!/usr/bin/env tsx
/**
 * List Available Subjects Script
 * 
 * Fetches and displays all available subject codes from Coursicle
 * for Temple University without scraping course details.
 * 
 * Usage:
 *   npm run scrape:subjects
 */

import { createTempleScraper } from '../scraper/coursicle.js';

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   📚 Temple University - Available Subjects           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  const scraper = createTempleScraper('preview');

  try {
    await scraper.init();
    const subjects = await scraper.getSubjects();
    await scraper.close();

    if (subjects.length === 0) {
      console.log('❌ No subjects found. The page structure may have changed.');
      return;
    }

    console.log(`Found ${subjects.length} subjects:\n`);
    
    // Display in columns
    const columns = 5;
    const rows = Math.ceil(subjects.length / columns);
    
    for (let i = 0; i < rows; i++) {
      let row = '';
      for (let j = 0; j < columns; j++) {
        const idx = i + j * rows;
        if (idx < subjects.length) {
          row += subjects[idx].padEnd(10);
        }
      }
      console.log('  ' + row);
    }

    console.log(`\n💡 To scrape specific subjects, run:`);
    console.log(`   npm run scrape -- ${subjects.slice(0, 3).join(' ')}`);
    console.log(`\n💡 To scrape all subjects, run:`);
    console.log(`   npm run scrape`);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);

