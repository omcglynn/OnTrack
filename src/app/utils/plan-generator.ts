import { Course, COURSES } from '@/app/data/mock-courses';
import { SemesterPlan, PlannedCourse } from '@/app/components/roadmap-view';
import { UserProfile } from '@/app/components/onboarding';

// Helper to safely get a course, returns a placeholder if not found
function getCourse(code: string, options?: { completed?: boolean; grade?: string; inProgress?: boolean }): PlannedCourse {
  const course = COURSES.find(c => c.code === code);
  if (!course) {
    console.warn(`Course not found: ${code}`);
    return {
      id: `missing-${code}`,
      code: code,
      name: `Course ${code}`,
      credits: 3,
      description: 'Course not found',
      category: 'elective',
      careerRelevance: {},
      skills: [],
      difficulty: 3,
      ...options,
    };
  }
  return { ...course, ...options };
}

// Generate realistic grades for a completed course
function generateGrade(difficulty?: number): string {
  const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
  const weights = difficulty && difficulty >= 4 
    ? [10, 15, 25, 25, 15, 7, 3] // Harder courses = more B's
    : [25, 25, 20, 15, 10, 3, 2]; // Easier courses = more A's
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < grades.length; i++) {
    random -= weights[i];
    if (random <= 0) return grades[i];
  }
  return 'B';
}

export function generatePlans(profile: UserProfile) {
  const allPlans = [
    generateBalancedPlan(profile),
    generateCybersecurityPlan(profile),
    generateForensicsPlan(profile),
  ];

  return allPlans;
}

function generateBalancedPlan(profile: UserProfile): any {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall - COMPLETED
  const y1FallCourses = [
    getCourse('CIS 1001', { completed: true, grade: 'A' }),
    getCourse('CIS 1051', { completed: true, grade: 'A-' }),
    getCourse('MATH 1041', { completed: true, grade: 'B+' }),
    getCourse('ENG 0802', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: y1FallCourses,
    totalCredits: y1FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 1 Spring - COMPLETED
  const y1SpringCourses = [
    getCourse('CIS 1068', { completed: true, grade: 'B+' }),
    getCourse('CIS 1166', { completed: true, grade: 'B' }),
    getCourse('MATH 1042', { completed: true, grade: 'B+' }),
    getCourse('MOSAIC 0851', { completed: true, grade: 'A-' }),
  ];
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: y1SpringCourses,
    totalCredits: y1SpringCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 2 Fall - COMPLETED
  const y2FallCourses = [
    getCourse('CIS 2107', { completed: true, grade: 'B+' }),
    getCourse('CIS 2168', { completed: true, grade: 'B' }),
    getCourse('CIS 2033', { completed: true, grade: 'A-' }),
    getCourse('MOSAIC 0852', { completed: true, grade: 'A' }),
    getCourse('PSY 1001', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: y2FallCourses,
    totalCredits: y2FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 2 Spring - COMPLETED
  const y2SpringCourses = [
    getCourse('CIS 2166', { completed: true, grade: 'B' }),
    getCourse('CIS 3207', { completed: true, grade: 'B-' }),
    getCourse('PHYS 1061', { completed: true, grade: 'B+' }),
    getCourse('CJ 1001', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: y2SpringCourses,
    totalCredits: y2SpringCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 3 Fall - IN PROGRESS (Current Semester)
  const y3FallCourses = [
    getCourse('CIS 3223', { inProgress: true }),
    getCourse('CIS 3296', { inProgress: true }),
    getCourse('CIS 3605', { inProgress: true }),
    getCourse('PHYS 1062', { inProgress: true }),
  ];
  semesters.push({
    semester: 5,
    season: 'Fall',
    year: 3,
    courses: y3FallCourses,
    totalCredits: y3FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'in-progress',
  });

  // Year 3 Spring - UNPLANNED
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
    isInternshipSemester: true,
  });

  // Year 4 Fall - UNPLANNED
  semesters.push({
    semester: 7,
    season: 'Fall',
    year: 4,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
  });

  // Year 4 Spring - UNPLANNED
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
  });

  return {
    id: 'balanced',
    name: 'Balanced Plan',
    description: 'Steady progress with flexibility for cybersecurity exploration',
    semesters,
    highlights: [
      'Manageable 12-17 credit semesters',
      'Core security courses in Year 3-4',
      'Lighter spring semester before summer internship',
      'Psychology courses for social engineering understanding',
    ],
    bestFor: 'Students who want a well-rounded cybersecurity education with time for clubs, research, or part-time work',
  };
}

function generateCybersecurityPlan(profile: UserProfile): any {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall - COMPLETED
  const y1FallCourses = [
    getCourse('CIS 1001', { completed: true, grade: 'A' }),
    getCourse('CIS 1051', { completed: true, grade: 'A' }),
    getCourse('MATH 1041', { completed: true, grade: 'B+' }),
    getCourse('ENG 0802', { completed: true, grade: 'A-' }),
    getCourse('PSY 1001', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: y1FallCourses,
    totalCredits: y1FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 1 Spring - COMPLETED
  const y1SpringCourses = [
    getCourse('CIS 1068', { completed: true, grade: 'A-' }),
    getCourse('CIS 1166', { completed: true, grade: 'B+' }),
    getCourse('MATH 1042', { completed: true, grade: 'B' }),
    getCourse('MOSAIC 0851', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: y1SpringCourses,
    totalCredits: y1SpringCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 2 Fall - COMPLETED
  const y2FallCourses = [
    getCourse('CIS 2107', { completed: true, grade: 'A-' }),
    getCourse('CIS 2168', { completed: true, grade: 'B+' }),
    getCourse('CIS 2033', { completed: true, grade: 'A' }),
    getCourse('MOSAIC 0852', { completed: true, grade: 'A-' }),
    getCourse('PHIL 1003', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: y2FallCourses,
    totalCredits: y2FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 2 Spring - COMPLETED
  const y2SpringCourses = [
    getCourse('CIS 2166', { completed: true, grade: 'B+' }),
    getCourse('CIS 3207', { completed: true, grade: 'B' }),
    getCourse('CIS 3308', { completed: true, grade: 'A-' }),
    getCourse('CJ 1001', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: y2SpringCourses,
    totalCredits: y2SpringCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 3 Fall - IN PROGRESS (Current Semester)
  const y3FallCourses = [
    getCourse('CIS 3223', { inProgress: true }),
    getCourse('CIS 3296', { inProgress: true }),
    getCourse('CIS 3441', { inProgress: true }),
    getCourse('CIS 3319', { inProgress: true }),
    getCourse('PHYS 1061', { inProgress: true }),
  ];
  semesters.push({
    semester: 5,
    season: 'Fall',
    year: 3,
    courses: y3FallCourses,
    totalCredits: y3FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'in-progress',
  });

  // Year 3 Spring - UNPLANNED
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
  });

  // Year 4 Fall - UNPLANNED
  semesters.push({
    semester: 7,
    season: 'Fall',
    year: 4,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
  });

  // Year 4 Spring - UNPLANNED
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
  });

  return {
    id: 'cybersecurity',
    name: 'Cybersecurity Focus',
    description: 'Specialized path for offensive and defensive security careers',
    semesters,
    highlights: [
      'Early systems and networking courses',
      'All core security electives included',
      'Psychology for social engineering defense',
      'Legal foundation for ethical practice',
    ],
    bestFor: 'Students targeting SOC analyst, penetration tester, or security engineer roles',
  };
}

function generateForensicsPlan(profile: UserProfile): any {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall - COMPLETED
  const y1FallCourses = [
    getCourse('CIS 1001', { completed: true, grade: 'A' }),
    getCourse('CIS 1051', { completed: true, grade: 'A-' }),
    getCourse('MATH 1041', { completed: true, grade: 'B+' }),
    getCourse('CJ 1001', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: y1FallCourses,
    totalCredits: y1FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 1 Spring - COMPLETED
  const y1SpringCourses = [
    getCourse('CIS 1068', { completed: true, grade: 'B+' }),
    getCourse('CIS 1166', { completed: true, grade: 'B' }),
    getCourse('MATH 1042', { completed: true, grade: 'B' }),
    getCourse('ENG 0802', { completed: true, grade: 'A' }),
    getCourse('CJ 2101', { completed: true, grade: 'A-' }),
  ];
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: y1SpringCourses,
    totalCredits: y1SpringCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 2 Fall - COMPLETED
  const y2FallCourses = [
    getCourse('CIS 2107', { completed: true, grade: 'B+' }),
    getCourse('CIS 2168', { completed: true, grade: 'B' }),
    getCourse('CIS 2033', { completed: true, grade: 'A-' }),
    getCourse('MOSAIC 0851', { completed: true, grade: 'A' }),
    getCourse('PSY 1001', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: y2FallCourses,
    totalCredits: y2FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 2 Spring - COMPLETED
  const y2SpringCourses = [
    getCourse('CIS 2166', { completed: true, grade: 'B' }),
    getCourse('CIS 3207', { completed: true, grade: 'B-' }),
    getCourse('MOSAIC 0852', { completed: true, grade: 'A-' }),
    getCourse('CJ 3201', { completed: true, grade: 'A' }),
  ];
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: y2SpringCourses,
    totalCredits: y2SpringCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'completed',
  });

  // Year 3 Fall - IN PROGRESS (Current Semester)
  const y3FallCourses = [
    getCourse('CIS 3223', { inProgress: true }),
    getCourse('CIS 3296', { inProgress: true }),
    getCourse('CIS 3605', { inProgress: true }),
    getCourse('CJ 3301', { inProgress: true }),
    getCourse('PHYS 1061', { inProgress: true }),
  ];
  semesters.push({
    semester: 5,
    season: 'Fall',
    year: 3,
    courses: y3FallCourses,
    totalCredits: y3FallCourses.reduce((sum, c) => sum + c.credits, 0),
    status: 'in-progress',
  });

  // Year 3 Spring - UNPLANNED
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
    isInternshipSemester: true,
  });

  // Year 4 Fall - UNPLANNED
  semesters.push({
    semester: 7,
    season: 'Fall',
    year: 4,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
  });

  // Year 4 Spring - UNPLANNED
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [],
    totalCredits: 0,
    status: 'unplanned',
  });

  return {
    id: 'forensics',
    name: 'Digital Forensics Focus',
    description: 'Specialized path for incident response and forensic investigation careers',
    semesters,
    highlights: [
      'Criminal justice and legal foundation',
      'Core forensics and investigation courses',
      'Technical writing for forensic reports',
      'Data analysis for evidence discovery',
    ],
    bestFor: 'Students targeting digital forensics, incident response, or law enforcement tech roles',
  };
}
