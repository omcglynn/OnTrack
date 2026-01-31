import { Course, CourseSchedule, COURSES } from '@/app/data/mock-courses';
import { PlannedCourse, SemesterPlan } from '@/app/components/roadmap-view';

// Predefined schedule patterns for variety
const SCHEDULE_PATTERNS: Omit<CourseSchedule, 'professor' | 'location' | 'section'>[] = [
  // MWF Morning patterns
  { days: ['Mon', 'Wed', 'Fri'], startTime: '08:00', endTime: '08:50', classType: 'Lecture' },
  { days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', classType: 'Lecture' },
  { days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '10:50', classType: 'Lecture' },
  { days: ['Mon', 'Wed', 'Fri'], startTime: '11:00', endTime: '11:50', classType: 'Lecture' },
  
  // MWF Afternoon patterns  
  { days: ['Mon', 'Wed', 'Fri'], startTime: '12:00', endTime: '12:50', classType: 'Lecture' },
  { days: ['Mon', 'Wed', 'Fri'], startTime: '13:00', endTime: '13:50', classType: 'Lecture' },
  { days: ['Mon', 'Wed', 'Fri'], startTime: '14:00', endTime: '14:50', classType: 'Lecture' },
  { days: ['Mon', 'Wed', 'Fri'], startTime: '15:00', endTime: '15:50', classType: 'Lecture' },
  
  // TTh patterns (longer classes)
  { days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:20', classType: 'Lecture' },
  { days: ['Tue', 'Thu'], startTime: '09:30', endTime: '10:50', classType: 'Lecture' },
  { days: ['Tue', 'Thu'], startTime: '11:00', endTime: '12:20', classType: 'Lecture' },
  { days: ['Tue', 'Thu'], startTime: '12:30', endTime: '13:50', classType: 'Lecture' },
  { days: ['Tue', 'Thu'], startTime: '14:00', endTime: '15:20', classType: 'Lecture' },
  { days: ['Tue', 'Thu'], startTime: '15:30', endTime: '16:50', classType: 'Lecture' },
  
  // Lab patterns (longer, once a week)
  { days: ['Mon'], startTime: '14:00', endTime: '16:50', classType: 'Lab' },
  { days: ['Tue'], startTime: '14:00', endTime: '16:50', classType: 'Lab' },
  { days: ['Wed'], startTime: '14:00', endTime: '16:50', classType: 'Lab' },
  { days: ['Thu'], startTime: '14:00', endTime: '16:50', classType: 'Lab' },
  { days: ['Fri'], startTime: '13:00', endTime: '15:50', classType: 'Lab' },
  
  // Seminar patterns (once a week)
  { days: ['Mon'], startTime: '16:00', endTime: '17:50', classType: 'Seminar' },
  { days: ['Wed'], startTime: '16:00', endTime: '17:50', classType: 'Seminar' },
  { days: ['Fri'], startTime: '16:00', endTime: '17:50', classType: 'Seminar' },
];

const PROFESSORS = [
  'Dr. Chen', 'Dr. Williams', 'Dr. Garcia', 'Dr. Johnson', 'Dr. Kim',
  'Dr. Smith', 'Dr. Brown', 'Dr. Davis', 'Dr. Miller', 'Dr. Wilson',
  'Dr. Moore', 'Dr. Taylor', 'Dr. Anderson', 'Dr. Thomas', 'Dr. Jackson',
  'Dr. White', 'Dr. Harris', 'Dr. Martin', 'Dr. Thompson', 'Dr. Robinson'
];

const BUILDINGS = ['SERC', 'Tech Center', 'Anderson Hall', 'Wachman Hall', 'Tuttleman'];

// Generate a deterministic schedule for a course based on its code
export function getCourseSchedule(course: Course): CourseSchedule {
  // Use course code hash to get consistent but varied schedules
  const hash = course.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const patternIndex = hash % SCHEDULE_PATTERNS.length;
  const professorIndex = hash % PROFESSORS.length;
  const buildingIndex = hash % BUILDINGS.length;
  const roomNumber = 100 + (hash % 400);
  
  const pattern = SCHEDULE_PATTERNS[patternIndex];
  
  return {
    ...pattern,
    professor: PROFESSORS[professorIndex],
    location: `${BUILDINGS[buildingIndex]} ${roomNumber}`,
    section: `00${(hash % 3) + 1}`,
  };
}

// Convert time string to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if two time ranges overlap
export function timesOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  return s1 < e2 && s2 < e1;
}

// Check if two schedules conflict
export function schedulesConflict(sched1: CourseSchedule, sched2: CourseSchedule): boolean {
  // Check if they share any days
  const sharedDays = sched1.days.filter(d => sched2.days.includes(d));
  if (sharedDays.length === 0) return false;
  
  // Check if times overlap on shared days
  return timesOverlap(sched1.startTime, sched1.endTime, sched2.startTime, sched2.endTime);
}

// Check if a course can be added to a semester (no conflicts)
export function checkTimeConflicts(
  newCourse: Course,
  existingCourses: PlannedCourse[]
): { hasConflict: boolean; conflictingCourse?: PlannedCourse } {
  const newSchedule = newCourse.schedule || getCourseSchedule(newCourse);
  
  for (const existing of existingCourses) {
    const existingSchedule = existing.schedule || getCourseSchedule(existing);
    
    if (schedulesConflict(newSchedule, existingSchedule)) {
      return { hasConflict: true, conflictingCourse: existing };
    }
  }
  
  return { hasConflict: false };
}

// Check if prerequisites are met
export function checkPrerequisites(
  course: Course,
  completedCourses: PlannedCourse[],
  inProgressCourses: PlannedCourse[]
): { met: boolean; missing: string[] } {
  if (!course.prerequisites || course.prerequisites.length === 0) {
    return { met: true, missing: [] };
  }
  
  const completedCodes = completedCourses.map(c => c.code);
  const inProgressCodes = inProgressCourses.map(c => c.code);
  const availableCodes = [...completedCodes, ...inProgressCodes];
  
  const missing = course.prerequisites.filter(prereq => !availableCodes.includes(prereq));
  
  return {
    met: missing.length === 0,
    missing,
  };
}

// Check if a course can be added to a specific semester
export function canAddCourse(
  course: Course,
  targetSemester: SemesterPlan,
  allSemesters: SemesterPlan[]
): { canAdd: boolean; reason?: string; conflictingCourse?: PlannedCourse; missingPrereqs?: string[] } {
  // Can't add to completed semesters
  if (targetSemester.status === 'completed') {
    return { canAdd: false, reason: 'Cannot modify completed semesters' };
  }
  
  // Check time conflicts
  const conflictCheck = checkTimeConflicts(course, targetSemester.courses);
  if (conflictCheck.hasConflict) {
    return { 
      canAdd: false, 
      reason: `Time conflict with ${conflictCheck.conflictingCourse?.code}`,
      conflictingCourse: conflictCheck.conflictingCourse 
    };
  }
  
  // Check prerequisites
  const priorSemesters = allSemesters.filter(s => s.semester < targetSemester.semester);
  const completedCourses = priorSemesters
    .filter(s => s.status === 'completed')
    .flatMap(s => s.courses);
  const inProgressCourses = priorSemesters
    .filter(s => s.status === 'in-progress')
    .flatMap(s => s.courses);
  
  const prereqCheck = checkPrerequisites(course, completedCourses, inProgressCourses);
  if (!prereqCheck.met) {
    return {
      canAdd: false,
      reason: `Missing prerequisites: ${prereqCheck.missing.join(', ')}`,
      missingPrereqs: prereqCheck.missing,
    };
  }
  
  // Check if course already in any semester
  const allCourses = allSemesters.flatMap(s => s.courses);
  if (allCourses.some(c => c.code === course.code)) {
    return { canAdd: false, reason: 'Course already in your plan' };
  }
  
  return { canAdd: true };
}

// Format schedule for display
export function formatScheduleDisplay(schedule: CourseSchedule): string {
  const days = schedule.days.join('');
  return `${days} ${schedule.startTime}-${schedule.endTime}`;
}

// Format schedule for short display (course cards)
export function formatScheduleShort(schedule: CourseSchedule): string {
  const dayAbbrev = schedule.days.map(d => d.charAt(0)).join('');
  const startHour = parseInt(schedule.startTime.split(':')[0]);
  const period = startHour >= 12 ? 'pm' : 'am';
  const displayHour = startHour > 12 ? startHour - 12 : startHour;
  return `${dayAbbrev} ${displayHour}${period}`;
}

// Get a course by code
export function getCourseByCode(code: string): Course | undefined {
  return COURSES.find(c => c.code === code);
}

