#!/usr/bin/env tsx
/**
 * Temple University Course Scraper Script
 * 
 * Usage:
 *   npm run scrape                    # Scrape all subjects
 *   npm run scrape -- CIS MATH        # Scrape specific subjects
 *   npm run scrape -- --dry-run CIS   # Preview without saving to DB
 * 
 * Make sure to set up your .env file first!
 */

import dotenv from 'dotenv';
dotenv.config();

import { createTempleScraper } from '../scraper/coursicle.js';
import { getOrCreateTempleUniversity, batchUpsertCourses } from '../utils/db.js';
import { testConnection } from '../config/supabase.js';

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎓 Temple University Course Scraper                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const subjects = args.filter(arg => !arg.startsWith('--') && /^[A-Z]{2,4}$/i.test(arg)).map(s => s.toUpperCase());

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - Will not save to database\n');
  }

  if (subjects.length > 0) {
    console.log(`📚 Subjects to scrape: ${subjects.join(', ')}\n`);
  } else {
    console.log('📚 Scraping ALL subjects (this may take a while...)\n');
  }

  // Test database connection
  if (!dryRun) {
    console.log('🔌 Testing database connection...');
    const connected = await testConnection();
    if (!connected) {
      console.error('\n❌ Database connection failed. Please check your .env file.');
      console.error('Required variables:');
      console.error('  SUPABASE_URL=your-supabase-url');
      console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
      process.exit(1);
    }
  }

  // Get or create Temple University
  let universityId = 'dry-run-id';
  if (!dryRun) {
    const university = await getOrCreateTempleUniversity();
    if (!university) {
      console.error('❌ Failed to get/create Temple University in database');
      process.exit(1);
    }
    universityId = university.id;
    console.log(`✅ Using university: ${university.name} (${university.id})\n`);
  }

  // Create scraper and run
  const scraper = createTempleScraper(universityId);
  
  try {
    const { courses, result } = await scraper.scrapeAll(subjects.length > 0 ? subjects : undefined);

    // Display results
    console.log('\n' + '═'.repeat(55));
    console.log('📊 SCRAPE RESULTS');
    console.log('═'.repeat(55));
    console.log(`   Total courses found: ${courses.length}`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(1)} seconds`);
    console.log(`   Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      result.errors.slice(0, 10).forEach(err => {
        console.log(`   - ${err.type}: ${err.message}`);
      });
      if (result.errors.length > 10) {
        console.log(`   ... and ${result.errors.length - 10} more`);
      }
    }

    // Show sample courses
    if (courses.length > 0) {
      console.log('\n📋 Sample courses scraped:');
      courses.slice(0, 5).forEach(course => {
        console.log(`   ${course.subject} ${course.number}: ${course.title} (${course.credits} cr)`);
        if (course.prerequisiteText) {
          console.log(`      Prerequisites: ${course.prerequisiteText}`);
        }
      });
      if (courses.length > 5) {
        console.log(`   ... and ${courses.length - 5} more courses`);
      }
    }

    // Save to database
    if (!dryRun && courses.length > 0) {
      console.log('\n💾 Saving to database...');
      const dbResult = await batchUpsertCourses(courses, universityId);
      console.log('═'.repeat(55));
      console.log(`✅ Database update complete!`);
      console.log(`   Inserted: ${dbResult.inserted}`);
      console.log(`   Updated: ${dbResult.updated}`);
      console.log(`   Failed: ${dbResult.failed}`);
    } else if (dryRun) {
      console.log('\n🔍 DRY RUN - Skipped database save');
    }

    console.log('\n✅ Scraping complete!\n');
  } catch (error) {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

