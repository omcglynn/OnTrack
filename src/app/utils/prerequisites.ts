/**
 * Prerequisite Checker Utility for Frontend
 * 
 * This module provides functions to check if a user has completed
 * the prerequisites for a course.
 * 
 * Works with the structured prerequisite format from the scraper:
 * { type: 'course' | 'AND' | 'OR', course?: string, children?: PrerequisiteNode[] }
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
 * Check if a user has completed the prerequisites for a course
 * 
 * @param prerequisites - The prerequisite structure for a course (can be null, undefined, or PrerequisiteNode)
 * @param completedCourses - Array of course codes the user has completed (e.g., ["CIS 1057", "MATH 1041"])
 * @param inProgressCourses - Optional array of courses currently being taken (for concurrent check)
 * @returns true if prerequisites are satisfied, false otherwise
 * 
 * @example
 * const canTake = checkPrerequisites(
 *   course.prerequisites,
 *   ['CIS 1057', 'MATH 1041'],
 *   ['CIS 2168'] // currently enrolled
 * );
 */
export function checkPrerequisites(
  prerequisites: PrerequisiteNode | null | undefined,
  completedCourses: string[],
  inProgressCourses: string[] = []
): boolean {
  // No prerequisites = can take the course
  if (!prerequisites) return true;

  // Normalize course codes for comparison (uppercase, single space)
  const completed = new Set(
    completedCourses.map(c => normalizeCourseCode(c))
  );
  const inProgress = new Set(
    inProgressCourses.map(c => normalizeCourseCode(c))
  );

  return evaluateNode(prerequisites, completed, inProgress);
}

/**
 * Evaluate a single prerequisite node
 */
function evaluateNode(
  node: PrerequisiteNode,
  completed: Set<string>,
  inProgress: Set<string>
): boolean {
  switch (node.type) {
    case 'course': {
      if (!node.course) return true;
      const course = normalizeCourseCode(node.course);
      
      // If concurrent enrollment is allowed, check both completed and in-progress
      if (node.concurrent) {
        return completed.has(course) || inProgress.has(course);
      }
      
      return completed.has(course);
    }
    
    case 'AND': {
      // All children must be satisfied
      if (!node.children || node.children.length === 0) return true;
      return node.children.every(child => evaluateNode(child, completed, inProgress));
    }
    
    case 'OR': {
      // At least one child must be satisfied
      if (!node.children || node.children.length === 0) return true;
      return node.children.some(child => evaluateNode(child, completed, inProgress));
    }
    
    default:
      return true;
  }
}

/**
 * Normalize a course code for comparison
 * "cis1057" -> "CIS 1057"
 * "CIS  1057" -> "CIS 1057"
 */
function normalizeCourseCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/([A-Z]+)\s*(\d+)/, '$1 $2')
    .trim();
}

/**
 * Get all required courses from a prerequisite structure (flattened list)
 * Useful for displaying "required courses" to the user
 * 
 * @param prerequisites - The prerequisite structure
 * @returns Array of unique course codes
 * 
 * @example
 * const required = getAllPrerequisiteCourses(course.prerequisites);
 * // ["CIS 1057", "MATH 1041", "CIS 1068"]
 */
export function getAllPrerequisiteCourses(prerequisites: PrerequisiteNode | null | undefined): string[] {
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
 * Get the missing prerequisites for a course
 * Returns the courses the user still needs to complete
 * 
 * @param prerequisites - The prerequisite structure
 * @param completedCourses - Courses the user has completed
 * @returns Array of missing course codes
 */
export function getMissingPrerequisites(
  prerequisites: PrerequisiteNode | null | undefined,
  completedCourses: string[]
): string[] {
  const allRequired = getAllPrerequisiteCourses(prerequisites);
  const completedSet = new Set(completedCourses.map(c => normalizeCourseCode(c)));
  
  return allRequired.filter(course => !completedSet.has(normalizeCourseCode(course)));
}

/**
 * Convert a PrerequisiteNode back to a human-readable string
 * Useful for displaying prerequisites to users
 * 
 * @param node - The prerequisite structure
 * @returns Human-readable string
 * 
 * @example
 * prerequisitesToString(prereqs);
 * // "(CIS 1057 OR CIS 1068) AND MATH 1041"
 */
export function prerequisitesToString(node: PrerequisiteNode | null | undefined): string {
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

/**
 * Check if prerequisites exist (not null/undefined and has actual requirements)
 */
export function hasPrerequisites(prerequisites: PrerequisiteNode | null | undefined): boolean {
  if (!prerequisites) return false;
  if (prerequisites.type === 'course') return !!prerequisites.course;
  return (prerequisites.children?.length ?? 0) > 0;
}

