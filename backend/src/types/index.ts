/**
 * OnTrack Backend Types
 * 
 * These types define the structure for courses, prerequisites,
 * and database models used throughout the backend.
 */

// ============================================
// PREREQUISITE TYPES
// ============================================

/**
 * Prerequisite node structure for representing complex prerequisite logic.
 * This allows for AND/OR combinations like:
 * - "CIS 1057" -> { type: 'course', course: 'CIS 1057' }
 * - "CIS 1057 AND MATH 1041" -> { type: 'AND', children: [...] }
 * - "(CIS 1057 OR CIS 1068) AND MATH 1041" -> nested structure
 */
export interface PrerequisiteNode {
  type: 'course' | 'AND' | 'OR';
  /** Course code in "SUBJ XXXX" format (only for type: 'course') */
  course?: string;
  /** Child nodes (only for type: 'AND' or 'OR') */
  children?: PrerequisiteNode[];
  /** Minimum grade required (e.g., 'C', 'B') */
  minGrade?: string;
  /** Whether this can be taken concurrently */
  concurrent?: boolean;
}

/**
 * Flattened prerequisite for simpler cases
 * Used when prerequisites don't have complex logic
 */
export interface SimplePrerequisite {
  course: string;
  minGrade?: string;
  concurrent?: boolean;
}

// ============================================
// COURSE TYPES
// ============================================

export interface ScrapedCourse {
  subject: string;           // e.g., "CIS"
  number: number;            // e.g., 1051
  title: string;             // e.g., "Introduction to Problem Solving"
  credits: number;
  description: string;
  prerequisites: PrerequisiteNode | null;
  /** Raw prerequisite string from Coursicle for debugging */
  prerequisiteText?: string;
  attributes: string[];      // e.g., ["GenEd: Quantitative Literacy"]
  /** Sections parsed from the course page */
  sections: ScrapedSection[];
}

export interface ScrapedSection {
  instructor: string;
  days: string[];            // e.g., ["M", "W", "F"]
  timeFrom: string | null;   // e.g., "09:00:00-05:00" (time with timezone) or null if unknown
  timeTo: string | null;     // e.g., "09:50:00-05:00" (time with timezone) or null if unknown
  terms: string[];           // e.g., ["Spring 2026"]
}

// ============================================
// DATABASE TYPES (matches Supabase schema)
// ============================================

export interface DBUniversity {
  id: string;
  name: string;
  aliases: string[];
  terms: string[];
  timezone: string;
  majors: string[];
  attributes: string[];
}

export interface DBCourse {
  id?: string;
  subject: string;
  number: number;
  credits: number;
  university: string;        // UUID reference
  title: string;
  attributes: string[];
  prerequisites: PrerequisiteNode | string[] | null;
  description: string;
}

export interface DBSection {
  id?: number;
  instructor: string;
  courseid: string;          // UUID reference
  days: string[];
  terms: string[];
  timeFrom: string;
  timeTo: string;
}

export interface DBMajor {
  id?: number;
  uniId: string;
  name: string;
  creditReq: number;
}

export interface DBGradReq {
  id?: number;
  uniId: string;
  majorId: number;
  courses: string[];         // Array of course IDs or codes
  howMany: number;
}

// ============================================
// SCRAPER CONFIG TYPES
// ============================================

export interface ScraperConfig {
  universityCode: string;    // e.g., "temple"
  universityId: string;      // UUID in database
  subjects?: string[];       // Specific subjects to scrape, or all if empty
  delayMs: number;           // Delay between requests
  maxConcurrent: number;     // Max concurrent pages
}

export interface ScrapeResult {
  success: boolean;
  coursesScraped: number;
  sectionsScraped: number;
  errors: ScrapeError[];
  duration: number;          // milliseconds
}

export interface ScrapeError {
  type: 'course' | 'section' | 'network' | 'parse';
  subject?: string;
  number?: number;
  message: string;
  timestamp: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

