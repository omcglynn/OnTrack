#!/usr/bin/env tsx
/**
 * Test Database Insert
 * 
 * Scrapes 3 courses and saves them to Supabase to verify DB integration.
 * 
 * Usage: npx tsx src/scripts/test-db-insert.ts
 * 
 * Requires .env file with:
 *   SUPABASE_URL=your-url
 *   SUPABASE_SERVICE_ROLE_KEY=your-key
 */

import dotenv from 'dotenv';
dotenv.config();

import { createTempleScraper } from '../scraper/coursicle.js';
import { testConnection } from '../config/supabase.js';
import { supabase } from '../config/supabase.js';
import { 
  getOrCreateTempleUniversity, 
  getCourseByCode,
  getCourseStats,
  upsertCourseWithSections,
} from '../utils/db.js';
import { getAllPrerequisiteCourses } from '../scraper/prerequisites.js';

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧪 Database Insert Test                             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Step 1: Test database connection
  console.log('1️⃣  Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Database connection failed!');
    console.error('   Please check your .env file has:');
    console.error('   SUPABASE_URL=your-url');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=your-key');
    process.exit(1);
  }
  console.log('   ✅ Connected to database\n');

  // Step 2: Get/create Temple University
  console.log('2️⃣  Getting/creating Temple University...');
  const university = await getOrCreateTempleUniversity();
  if (!university) {
    console.error('   ❌ Failed to get/create university');
    process.exit(1);
  }
  console.log(`   ✅ University ID: ${university.id}\n`);

  // Step 3: Scrape 3 test courses (using headed browser to avoid bot detection)
  console.log('3️⃣  Scraping 3 test courses (headed browser mode)...');
  const scraper = createTempleScraper(university.id);
  await scraper.init(false); // false = headed mode (visible browser)

  const testCourses = [
    { subject: 'CIS', number: 1051 },
    { subject: 'CIS', number: 1057 },
    { subject: 'CIS', number: 2168 },
  ];

  const scrapedCourses = [];
  for (const { subject, number } of testCourses) {
    console.log(`   Scraping ${subject} ${number}...`);
    const course = await scraper.scrapeCourse(subject, number);
    if (course) {
      scrapedCourses.push(course);
      console.log(`   ✅ ${course.title}`);
      const prereqs = getAllPrerequisiteCourses(course.prerequisites);
      console.log(`      Prerequisites: ${prereqs.length > 0 ? prereqs.join(', ') : 'None'}`);
      console.log(`      Sections found: ${course.sections?.length || 0}`);
      if (course.sections && course.sections.length > 0) {
        course.sections.slice(0, 2).forEach((s, i) => {
          console.log(`        [${i + 1}] ${s.instructor} | ${s.days.join('')} | ${s.timeFrom}-${s.timeTo} | ${s.terms.join(', ')}`);
        });
      }
    } else {
      console.log(`   ❌ Failed to scrape`);
    }
  }
  await scraper.close();
  console.log('');

  // Step 4: Insert courses AND sections into database
  console.log('4️⃣  Inserting courses and sections into database...\n');
  
  let insertedCount = 0;
  let totalSections = 0;
  
  for (const course of scrapedCourses) {
    const result = await upsertCourseWithSections(course, university.id);
    
    if (result.courseId) {
      console.log(`   ✅ ${course.subject} ${course.number} -> ${result.courseId}`);
      console.log(`      Sections inserted: ${result.sectionsInserted}`);
      insertedCount++;
      totalSections += result.sectionsInserted;
    } else {
      console.log(`   ❌ ${course.subject} ${course.number}: Failed to insert`);
    }
  }
  console.log(`\n   📊 Total: ${insertedCount} courses, ${totalSections} sections\n`);

  // Step 5: Verify data was saved (including sections)
  console.log('5️⃣  Verifying data in database...');
  for (const { subject, number } of testCourses) {
    const dbCourse = await getCourseByCode(university.id, subject, number);
    if (dbCourse) {
      console.log(`   ✅ ${subject} ${number}: "${dbCourse.title}"`);
      console.log(`      Credits: ${dbCourse.credits}`);
      console.log(`      Prerequisites: ${JSON.stringify(dbCourse.prerequisites)}`);
      
      // Query sections for this course
      const { data: sections } = await supabase
        .from('sections')
        .select('*')
        .eq('courseid', dbCourse.id);
      
      console.log(`      Sections in DB: ${sections?.length || 0}`);
      if (sections && sections.length > 0) {
        sections.slice(0, 2).forEach((s: any) => {
          console.log(`        - ${s.instructor} | ${s.days?.join('') || 'TBA'} | ${s.timeFrom || 'TBA'}-${s.timeTo || 'TBA'}`);
        });
      }
    } else {
      console.log(`   ❌ ${subject} ${number} not found in database`);
    }
  }
  console.log('');

  // Step 6: Show stats
  console.log('6️⃣  Database statistics...');
  const stats = await getCourseStats(university.id);
  console.log(`   Total courses: ${stats.totalCourses}`);
  console.log(`   By subject:`, stats.bySubject);
  console.log(`   Avg credits: ${stats.avgCredits.toFixed(1)}`);

  console.log(`
═══════════════════════════════════════════════════════
✅ Test complete! ${insertedCount}/${scrapedCourses.length} courses saved.
═══════════════════════════════════════════════════════

💡 If prerequisites failed to save, run this SQL to fix your schema:

   ALTER TABLE courses 
   ALTER COLUMN prerequisites TYPE text[] 
   USING prerequisites::text[];

  `);
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
