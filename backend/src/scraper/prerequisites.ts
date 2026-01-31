import type { PrerequisiteNode } from '../types/index.js';

/**
 * Prerequisite Parser
 * 
 * Parses prerequisite strings from Coursicle into a structured format
 * that can be used to determine if a student can take a course.
 * 
 * Examples of input formats:
 * - "CIS 1057"
 * - "CIS 1057 and MATH 1041"
 * - "CIS 1057 or CIS 1068"
 * - "(CIS 1057 or CIS 1068) and MATH 1041"
 * - "CIS 1057 (min grade C)"
 * - "CIS 1057 (may be taken concurrently)"
 */

// Regex patterns
const COURSE_PATTERN = /([A-Z]{2,4})\s*(\d{4})/g;
const GRADE_PATTERN = /\(?(?:min(?:imum)?\s+)?grade\s*(?:of\s+)?([A-DF][+-]?)\)?/i;
const CONCURRENT_PATTERN = /\(?(?:may\s+be\s+)?(?:taken\s+)?concurrent(?:ly)?\)?/i;

/**
 * Parse a prerequisite string into a structured PrerequisiteNode
 */
export function parsePrerequisites(text: string | null | undefined): PrerequisiteNode | null {
  if (!text || text.trim() === '' || text.toLowerCase() === 'none') {
    return null;
  }

  // Clean the text
  let cleaned = text
    .replace(/\s+/g, ' ')
    .trim();

  // Try to parse the structure
  try {
    return parseExpression(cleaned);
  } catch (error) {
    console.warn(`Failed to parse prerequisites: "${text}"`, error);
    // Fallback: extract all courses as AND requirements
    return fallbackParse(cleaned);
  }
}

/**
 * Parse a prerequisite expression (handles AND/OR/parentheses)
 */
function parseExpression(text: string): PrerequisiteNode | null {
  text = text.trim();
  
  if (!text) return null;

  // Remove outer parentheses if they wrap the entire expression
  if (text.startsWith('(') && text.endsWith(')')) {
    const inner = text.slice(1, -1);
    if (isBalanced(inner)) {
      text = inner;
    }
  }

  // Check for OR at the top level (lowest precedence)
  const orParts = splitAtTopLevel(text, /\s+or\s+/i);
  if (orParts.length > 1) {
    const children = orParts
      .map(part => parseExpression(part))
      .filter((node): node is PrerequisiteNode => node !== null);
    
    if (children.length === 0) return null;
    if (children.length === 1) return children[0];
    
    return { type: 'OR', children };
  }

  // Check for AND at the top level
  const andParts = splitAtTopLevel(text, /\s+and\s+/i);
  if (andParts.length > 1) {
    const children = andParts
      .map(part => parseExpression(part))
      .filter((node): node is PrerequisiteNode => node !== null);
    
    if (children.length === 0) return null;
    if (children.length === 1) return children[0];
    
    return { type: 'AND', children };
  }

  // Parse as a single course
  return parseSingleCourse(text);
}

/**
 * Parse a single course requirement
 */
function parseSingleCourse(text: string): PrerequisiteNode | null {
  // Extract course code
  const courseMatch = text.match(/([A-Z]{2,4})\s*(\d{4})/i);
  if (!courseMatch) {
    return null;
  }

  const course = `${courseMatch[1].toUpperCase()} ${courseMatch[2]}`;
  const node: PrerequisiteNode = { type: 'course', course };

  // Check for minimum grade requirement
  const gradeMatch = text.match(GRADE_PATTERN);
  if (gradeMatch) {
    node.minGrade = gradeMatch[1].toUpperCase();
  }

  // Check for concurrent enrollment
  if (CONCURRENT_PATTERN.test(text)) {
    node.concurrent = true;
  }

  return node;
}

/**
 * Split text at a pattern, respecting parentheses nesting
 */
function splitAtTopLevel(text: string, pattern: RegExp): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let i = 0;

  while (i < text.length) {
    if (text[i] === '(') {
      depth++;
      current += text[i];
      i++;
    } else if (text[i] === ')') {
      depth--;
      current += text[i];
      i++;
    } else if (depth === 0) {
      // Check if pattern matches at this position
      const remaining = text.slice(i);
      const match = remaining.match(pattern);
      if (match && match.index === 0) {
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = '';
        i += match[0].length;
        continue;
      }
      current += text[i];
      i++;
    } else {
      current += text[i];
      i++;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * Check if parentheses are balanced
 */
function isBalanced(text: string): boolean {
  let depth = 0;
  for (const char of text) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/**
 * Fallback parser: extract all courses as AND requirements
 */
function fallbackParse(text: string): PrerequisiteNode | null {
  const courses: PrerequisiteNode[] = [];
  let match;
  
  COURSE_PATTERN.lastIndex = 0;
  while ((match = COURSE_PATTERN.exec(text)) !== null) {
    courses.push({
      type: 'course',
      course: `${match[1].toUpperCase()} ${match[2]}`,
    });
  }

  if (courses.length === 0) return null;
  if (courses.length === 1) return courses[0];
  
  return { type: 'AND', children: courses };
}

/**
 * Check if a user has completed the prerequisites for a course
 * 
 * @param prerequisites - The prerequisite structure for a course
 * @param completedCourses - Array of course codes the user has completed (e.g., ["CIS 1057", "MATH 1041"])
 * @param inProgressCourses - Optional array of courses currently being taken (for concurrent check)
 * @returns true if prerequisites are satisfied
 */
export function checkPrerequisites(
  prerequisites: PrerequisiteNode | null,
  completedCourses: string[],
  inProgressCourses: string[] = []
): boolean {
  if (!prerequisites) return true;

  // Normalize course codes for comparison
  const completed = new Set(completedCourses.map(c => c.toUpperCase().replace(/\s+/g, ' ')));
  const inProgress = new Set(inProgressCourses.map(c => c.toUpperCase().replace(/\s+/g, ' ')));

  return evaluateNode(prerequisites, completed, inProgress);
}

function evaluateNode(
  node: PrerequisiteNode,
  completed: Set<string>,
  inProgress: Set<string>
): boolean {
  switch (node.type) {
    case 'course': {
      if (!node.course) return true;
      const course = node.course.toUpperCase().replace(/\s+/g, ' ');
      
      // If concurrent is allowed, check both completed and in-progress
      if (node.concurrent) {
        return completed.has(course) || inProgress.has(course);
      }
      
      return completed.has(course);
    }
    
    case 'AND': {
      if (!node.children || node.children.length === 0) return true;
      return node.children.every(child => evaluateNode(child, completed, inProgress));
    }
    
    case 'OR': {
      if (!node.children || node.children.length === 0) return true;
      return node.children.some(child => evaluateNode(child, completed, inProgress));
    }
    
    default:
      return true;
  }
}

/**
 * Get all required courses from a prerequisite structure (flattened)
 */
export function getAllPrerequisiteCourses(prerequisites: PrerequisiteNode | null): string[] {
  if (!prerequisites) return [];
  
  const courses: string[] = [];
  collectCourses(prerequisites, courses);
  return [...new Set(courses)]; // Remove duplicates
}

function collectCourses(node: PrerequisiteNode, courses: string[]): void {
  if (node.type === 'course' && node.course) {
    courses.push(node.course);
  } else if (node.children) {
    for (const child of node.children) {
      collectCourses(child, courses);
    }
  }
}

/**
 * Convert a PrerequisiteNode back to a human-readable string
 */
export function prerequisitesToString(node: PrerequisiteNode | null): string {
  if (!node) return 'None';
  
  switch (node.type) {
    case 'course': {
      let str = node.course || '';
      if (node.minGrade) str += ` (min grade ${node.minGrade})`;
      if (node.concurrent) str += ' (may be concurrent)';
      return str;
    }
    
    case 'AND': {
      if (!node.children || node.children.length === 0) return '';
      const parts = node.children.map(c => prerequisitesToString(c));
      return parts.length > 1 ? `(${parts.join(' AND ')})` : parts[0];
    }
    
    case 'OR': {
      if (!node.children || node.children.length === 0) return '';
      const parts = node.children.map(c => prerequisitesToString(c));
      return parts.length > 1 ? `(${parts.join(' OR ')})` : parts[0];
    }
    
    default:
      return '';
  }
}

