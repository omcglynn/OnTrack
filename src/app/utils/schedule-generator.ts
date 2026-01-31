import { Course, CourseSchedule, COURSES } from '@/app/data/mock-courses';

// Time slots for classes (24h format)
const TIME_SLOTS = [
  { start: '08:00', end: '09:15' },
  { start: '09:30', end: '10:45' },
  { start: '11:00', end: '12:15' },
  { start: '12:30', end: '13:45' },
  { start: '14:00', end: '15:15' },
  { start: '15:30', end: '16:45' },
  { start: '17:00', end: '18:15' },
  { start: '18:30', end: '19:45' },
];

// Day patterns for different credit courses
const DAY_PATTERNS: { [key: number]: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[][] } = {
  1: [['Mon'], ['Tue'], ['Wed'], ['Thu'], ['Fri']],
  3: [['Mon', 'Wed', 'Fri'], ['Tue', 'Thu']],
  4: [['Mon', 'Wed'], ['Tue', 'Thu'], ['Mon', 'Wed', 'Fri']],
};

const LOCATIONS = [
  'SERC 306', 'SERC 204', 'SERC 116', 'TECH 101', 'TECH 203',
  'Anderson 17', 'Anderson 103', 'Wachman 447', 'Wachman 303',
  'Tuttleman 404', 'Tuttleman 201', 'Gladfelter 247'
];

const PROFESSORS = [
  'Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones',
  'Dr. Garcia', 'Dr. Miller', 'Dr. Davis', 'Dr. Rodriguez', 'Dr. Martinez',
  'Dr. Chen', 'Dr. Kim', 'Dr. Patel', 'Dr. Lee', 'Dr. Wang'
];

// Generate a deterministic but varied schedule based on course code
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateMockSchedule(course: Course, sectionIndex: number = 0): CourseSchedule {
  const hash = hashCode(course.code + sectionIndex);
  
  // Get day pattern based on credits
  const credits = course.credits;
  const patterns = DAY_PATTERNS[credits] || DAY_PATTERNS[3];
  const dayPattern = patterns[hash % patterns.length];
  
  // Get time slot
  const timeSlot = TIME_SLOTS[(hash + sectionIndex) % TIME_SLOTS.length];
  
  // Get location and professor
  const location = LOCATIONS[hash % LOCATIONS.length];
  const professor = PROFESSORS[(hash + 3) % PROFESSORS.length];
  
  return {
    days: dayPattern,
    startTime: timeSlot.start,
    endTime: timeSlot.end,
    location,
    professor,
    section: String(sectionIndex + 1).padStart(3, '0'),
    classType: course.category === 'lab-science' ? 'Lab' : 'Lecture',
  };
}

// Generate multiple section options for a course
export function generateSectionOptions(course: Course, count: number = 3): CourseSchedule[] {
  return Array.from({ length: count }, (_, i) => generateMockSchedule(course, i));
}

export interface ScheduledCourse {
  course: Course;
  schedule: CourseSchedule;
}

export interface GeneratedSchedule {
  courses: ScheduledCourse[];
  totalCredits: number;
  warnings: string[];
}

// Check if two schedules conflict
export function hasTimeConflict(schedule1: CourseSchedule, schedule2: CourseSchedule): boolean {
  // Check if days overlap
  const daysOverlap = schedule1.days.some(day => schedule2.days.includes(day));
  if (!daysOverlap) return false;
  
  // Check if times overlap
  const start1 = timeToMinutes(schedule1.startTime);
  const end1 = timeToMinutes(schedule1.endTime);
  const start2 = timeToMinutes(schedule2.startTime);
  const end2 = timeToMinutes(schedule2.endTime);
  
  return start1 < end2 && start2 < end1;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Find a non-conflicting section for a course given existing schedule
export function findNonConflictingSection(
  course: Course, 
  existingSchedules: CourseSchedule[]
): CourseSchedule | null {
  // Try up to 8 different section options
  for (let i = 0; i < 8; i++) {
    const schedule = generateMockSchedule(course, i);
    const hasConflict = existingSchedules.some(existing => hasTimeConflict(schedule, existing));
    if (!hasConflict) {
      return schedule;
    }
  }
  return null;
}

// Check if prerequisites are met
export function checkPrerequisites(
  courseCode: string, 
  completedCourses: string[]
): { met: boolean; missing: string[] } {
  const course = COURSES.find(c => c.code === courseCode);
  if (!course || !course.prerequisites) {
    return { met: true, missing: [] };
  }
  
  const missing = course.prerequisites.filter(prereq => !completedCourses.includes(prereq));
  return { met: missing.length === 0, missing };
}

// Validate and build a schedule from course codes
export function buildScheduleFromCodes(
  courseCodes: string[],
  completedCourses: string[],
  existingScheduledCourses: ScheduledCourse[] = []
): GeneratedSchedule {
  const scheduledCourses: ScheduledCourse[] = [];
  const warnings: string[] = [];
  const existingSchedules = existingScheduledCourses.map(sc => sc.schedule);
  
  for (const code of courseCodes) {
    const course = COURSES.find(c => c.code === code);
    if (!course) {
      warnings.push(`Course ${code} not found in catalog`);
      continue;
    }
    
    // Check prerequisites
    const prereqCheck = checkPrerequisites(code, completedCourses);
    if (!prereqCheck.met) {
      warnings.push(`${code} missing prerequisites: ${prereqCheck.missing.join(', ')}`);
    }
    
    // Find a non-conflicting section
    const allSchedules = [...existingSchedules, ...scheduledCourses.map(sc => sc.schedule)];
    const schedule = findNonConflictingSection(course, allSchedules);
    
    if (!schedule) {
      warnings.push(`Could not find a non-conflicting time for ${code}`);
      // Still add with a default schedule but mark the conflict
      scheduledCourses.push({
        course,
        schedule: generateMockSchedule(course, 0),
      });
    } else {
      scheduledCourses.push({ course, schedule });
    }
  }
  
  const totalCredits = scheduledCourses.reduce((sum, sc) => sum + sc.course.credits, 0);
  
  return {
    courses: scheduledCourses,
    totalCredits,
    warnings,
  };
}

// Get course by code
export function getCourseByCode(code: string): Course | undefined {
  return COURSES.find(c => c.code === code);
}

