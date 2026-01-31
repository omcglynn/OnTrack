import { supabase } from '../config/supabase.js';
import type { ScrapedCourse, ScrapedSection, DBCourse, DBUniversity, PrerequisiteNode } from '../types/index.js';

/**
 * Convert a PrerequisiteNode structure to a flat array of course codes
 * for storage in PostgreSQL ARRAY column
 */
function flattenPrerequisites(node: PrerequisiteNode | null): string[] {
  if (!node) return [];
  
  const courses: string[] = [];
  
  function collect(n: PrerequisiteNode) {
    if (n.type === 'course' && n.course) {
      courses.push(n.course);
    } else if (n.children) {
      n.children.forEach(collect);
    }
  }
  
  collect(node);
  return [...new Set(courses)]; // Remove duplicates
}

/**
 * Database Utility Functions
 * 
 * Functions for inserting and managing scraped course data in Supabase
 */

/**
 * Get or create Temple University in the database
 */
export async function getOrCreateTempleUniversity(): Promise<DBUniversity | null> {
  // First, try to find existing Temple University
  const { data: existing, error: findError } = await supabase
    .from('universities')
    .select('*')
    .or('name.ilike.%temple%,aliases.cs.{temple,tu}')
    .single();

  if (existing) {
    console.log('✅ Found existing Temple University:', existing.id);
    return existing as DBUniversity;
  }

  // Create Temple University if it doesn't exist
  const { data: created, error: createError } = await supabase
    .from('universities')
    .insert({
      name: 'Temple University',
      aliases: ['Temple', 'TU', 'temple'],
      terms: ['Fall', 'Spring', 'Summer I', 'Summer II'],
      timezone: 'America/New_York',
      majors: [],
      attributes: [
        'GenEd: Quantitative Literacy',
        'GenEd: Science & Technology',
        'GenEd: Race & Diversity',
        'GenEd: World Society',
        'Writing Intensive',
      ],
    })
    .select()
    .single();

  if (createError) {
    console.error('❌ Error creating Temple University:', createError);
    return null;
  }

  console.log('✅ Created Temple University:', created.id);
  return created as DBUniversity;
}

/**
 * Insert or update a course in the database
 */
export async function upsertCourse(course: ScrapedCourse, universityId: string): Promise<string | null> {
  // Convert structured prerequisites to flat array for PostgreSQL ARRAY column
  const prerequisitesArray = flattenPrerequisites(course.prerequisites);
  
  const dbCourse = {
    subject: course.subject,
    number: course.number,
    credits: course.credits,
    university: universityId,
    title: course.title,
    attributes: course.attributes,
    prerequisites: prerequisitesArray.length > 0 ? prerequisitesArray : null,
    description: course.description,
  };

  // Check if course already exists
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('university', universityId)
    .eq('subject', course.subject)
    .eq('number', course.number)
    .single();

  if (existing) {
    // Update existing course
    const { data, error } = await supabase
      .from('courses')
      .update(dbCourse)
      .eq('id', existing.id)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Error updating ${course.subject} ${course.number}:`, error);
      return null;
    }
    return data.id;
  } else {
    // Insert new course
    const { data, error } = await supabase
      .from('courses')
      .insert(dbCourse)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Error inserting ${course.subject} ${course.number}:`, error);
      return null;
    }
    return data.id;
  }
}

/**
 * Insert sections for a course
 */
export async function insertSections(
  courseId: string,
  sections: ScrapedSection[]
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;

  for (const section of sections) {
    const dbSection = {
      courseid: courseId,
      instructor: section.instructor || 'TBA',
      days: section.days,
      terms: section.terms,
      timeFrom: section.timeFrom || null,
      timeTo: section.timeTo || null,
    };

    const { error } = await supabase
      .from('sections')
      .insert(dbSection);

    if (error) {
      console.error(`  ❌ Section insert error: ${error.message}`);
      failed++;
    } else {
      inserted++;
    }
  }

  return { inserted, failed };
}

/**
 * Delete existing sections for a course (before re-inserting)
 */
export async function deleteSectionsForCourse(courseId: string): Promise<number> {
  const { data, error } = await supabase
    .from('sections')
    .delete()
    .eq('courseid', courseId)
    .select('id');

  if (error) {
    console.error(`Error deleting sections: ${error.message}`);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Upsert course with sections
 */
export async function upsertCourseWithSections(
  course: ScrapedCourse,
  universityId: string
): Promise<{ courseId: string | null; sectionsInserted: number }> {
  // First upsert the course
  const courseId = await upsertCourse(course, universityId);
  
  if (!courseId) {
    return { courseId: null, sectionsInserted: 0 };
  }

  // Delete existing sections and insert new ones
  if (course.sections && course.sections.length > 0) {
    await deleteSectionsForCourse(courseId);
    const { inserted } = await insertSections(courseId, course.sections);
    return { courseId, sectionsInserted: inserted };
  }

  return { courseId, sectionsInserted: 0 };
}

/**
 * Batch insert courses
 */
export async function batchUpsertCourses(
  courses: ScrapedCourse[],
  universityId: string
): Promise<{ inserted: number; updated: number; failed: number }> {
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  console.log(`\n📤 Saving ${courses.length} courses to database...`);

  for (const course of courses) {
    // Check if course exists
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('university', universityId)
      .eq('subject', course.subject)
      .eq('number', course.number)
      .single();

    // Convert structured prerequisites to flat array for PostgreSQL ARRAY column
    const prerequisitesArray = flattenPrerequisites(course.prerequisites);

    const dbCourse = {
      subject: course.subject,
      number: course.number,
      credits: course.credits,
      university: universityId,
      title: course.title,
      attributes: course.attributes,
      prerequisites: prerequisitesArray.length > 0 ? prerequisitesArray : null,
      description: course.description,
    };

    if (existing) {
      const { error } = await supabase
        .from('courses')
        .update(dbCourse)
        .eq('id', existing.id);

      if (error) {
        console.error(`  ❌ ${course.subject} ${course.number}: ${error.message}`);
        failed++;
      } else {
        updated++;
      }
    } else {
      const { error } = await supabase
        .from('courses')
        .insert(dbCourse);

      if (error) {
        console.error(`  ❌ ${course.subject} ${course.number}: ${error.message}`);
        failed++;
      } else {
        inserted++;
      }
    }
  }

  console.log(`\n📊 Database Results:`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);

  return { inserted, updated, failed };
}

/**
 * Get all courses for a university
 */
export async function getCourses(universityId: string): Promise<DBCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('university', universityId)
    .order('subject')
    .order('number');

  if (error) {
    console.error('❌ Error fetching courses:', error);
    return [];
  }

  return data as DBCourse[];
}

/**
 * Get course by subject and number
 */
export async function getCourseByCode(
  universityId: string,
  subject: string,
  number: number
): Promise<DBCourse | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('university', universityId)
    .eq('subject', subject.toUpperCase())
    .eq('number', number)
    .single();

  if (error) {
    return null;
  }

  return data as DBCourse;
}

/**
 * Delete all courses for a university (use with caution!)
 */
export async function deleteAllCourses(universityId: string): Promise<number> {
  const { data, error } = await supabase
    .from('courses')
    .delete()
    .eq('university', universityId)
    .select('id');

  if (error) {
    console.error('❌ Error deleting courses:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Get statistics about the courses in the database
 */
export async function getCourseStats(universityId: string): Promise<{
  totalCourses: number;
  bySubject: Record<string, number>;
  avgCredits: number;
}> {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('subject, credits')
    .eq('university', universityId);

  if (error || !courses) {
    return { totalCourses: 0, bySubject: {}, avgCredits: 0 };
  }

  const bySubject: Record<string, number> = {};
  let totalCredits = 0;

  for (const course of courses) {
    bySubject[course.subject] = (bySubject[course.subject] || 0) + 1;
    totalCredits += course.credits || 0;
  }

  return {
    totalCourses: courses.length,
    bySubject,
    avgCredits: courses.length > 0 ? totalCredits / courses.length : 0,
  };
}

