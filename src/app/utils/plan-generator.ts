import { Course, COURSES } from '@/app/data/mock-courses';
import { SemesterPlan } from '@/app/components/roadmap-view';
import { UserProfile } from '@/app/components/onboarding';

export interface Plan {
  id: string;
  name: string;
  description: string;
  semesters: SemesterPlan[];
  highlights: string[];
  bestFor: string;
}

// Helper function to safely get a course by code
function getCourse(code: string): Course {
  const course = COURSES.find(c => c.code === code);
  if (!course) {
    console.warn(`Course not found: ${code}`);
    // Return a placeholder course to prevent crashes
    return {
      id: `missing-${code}`,
      code,
      name: `${code} (Not Found)`,
      credits: 3,
      description: 'Course data not available',
      category: 'major',
    };
  }
  return course;
}

export function generatePlans(profile: UserProfile): Plan[] {
  return [
    generateBalancedPlan(profile),
    generateFastTrackPlan(profile),
    generateInternshipHeavyPlan(profile),
  ];
}

function generateBalancedPlan(profile: UserProfile): Plan {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: [
      getCourse('CIS 1051'),
      getCourse('MATH 1041'),
      getCourse('ENGL 0802'),
      getCourse('GEN 1001'),
    ],
    totalCredits: 11,
  });

  // Year 1 Spring
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: [
      getCourse('CIS 1057'),
      getCourse('MATH 1042'),
      getCourse('PHYS 1061'),
      getCourse('HIST 2051'),
    ],
    totalCredits: 14,
  });

  // Year 2 Fall
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: [
      getCourse('CIS 2033'),
      getCourse('CIS 2107'),
      getCourse('CIS 2168'),
      getCourse('STAT 2103'),
    ],
    totalCredits: 12,
  });

  // Year 2 Spring
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: [
      getCourse('CIS 3207'),
      getCourse('CIS 3223'),
      getCourse('CIS 3296'),
      getCourse('ECON 1101'),
    ],
    totalCredits: 12,
  });

  // Year 3 Fall
  semesters.push({
    semester: 5,
    season: 'Fall',
    year: 3,
    courses: [
      getCourse('CIS 3309'),
      getCourse('CIS 3715'),
      getCourse('CIS 4360'),
      getCourse('CIS 4398'),
    ],
    totalCredits: 12,
  });

  // Year 3 Spring (Internship semester)
  const isInternshipSemester = profile.internshipPreference === 'summer-year3';
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [
      getCourse('CIS 3800'),
      getCourse('CIS 4526'),
      getCourse('PHIL 2101'),
    ],
    totalCredits: 9,
    isInternshipSemester,
  });

  // Year 4 Fall
  semesters.push({
    semester: 7,
    season: 'Fall',
    year: 4,
    courses: [
      getCourse('CIS 4515'),
      getCourse('CIS 4909'),
      getCourse('CIS 4396'),
      getCourse('CIS 4301'),
    ],
    totalCredits: 12,
  });

  // Year 4 Spring
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [
      getCourse('CIS 4997'),
      getCourse('CIS 4555'),
      getCourse('CIS 4528'),
      getCourse('ART 2101'),
    ],
    totalCredits: 12,
  });

  return {
    id: 'balanced',
    name: 'Balanced Plan',
    description: 'Steady progress with flexibility for exploration',
    semesters,
    highlights: [
      'Manageable 12-14 credit semesters',
      'Time for extracurriculars and networking',
      'Lighter spring semester before summer internship',
      'Diverse elective choices in final year',
    ],
    bestFor: 'Students who want a well-rounded college experience with time for clubs, research, or part-time work',
  };
}

function generateFastTrackPlan(profile: UserProfile): Plan {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall - Heavy load
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: [
      getCourse('CIS 1051'),
      getCourse('MATH 1041'),
      getCourse('ENGL 0802'),
      getCourse('GEN 1001'),
      getCourse('HIST 2051'),
    ],
    totalCredits: 14,
  });

  // Year 1 Spring
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: [
      getCourse('CIS 1057'),
      getCourse('MATH 1042'),
      getCourse('PHYS 1061'),
      getCourse('STAT 2103'),
    ],
    totalCredits: 14,
  });

  // Year 2 Fall
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: [
      getCourse('CIS 2033'),
      getCourse('CIS 2107'),
      getCourse('CIS 2168'),
      getCourse('CIS 3207'),
      getCourse('ECON 1101'),
    ],
    totalCredits: 15,
  });

  // Year 2 Spring - Lighter for early internship
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: [
      getCourse('CIS 3223'),
      getCourse('CIS 3296'),
      getCourse('PHIL 2101'),
    ],
    totalCredits: 9,
    isInternshipSemester: true,
  });

  // Year 3 Fall
  semesters.push({
    semester: 5,
    season: 'Fall',
    year: 3,
    courses: [
      getCourse('CIS 3309'),
      getCourse('CIS 3715'),
      getCourse('CIS 4360'),
      getCourse('CIS 4398'),
      getCourse('CIS 4515'),
    ],
    totalCredits: 15,
  });

  // Year 3 Spring
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [
      getCourse('CIS 3800'),
      getCourse('CIS 4526'),
      getCourse('CIS 4909'),
      getCourse('CIS 4396'),
    ],
    totalCredits: 12,
  });

  // Year 4 Fall
  semesters.push({
    semester: 7,
    season: 'Fall',
    year: 4,
    courses: [
      getCourse('CIS 4301'),
      getCourse('CIS 4997'),
      getCourse('CIS 4555'),
    ],
    totalCredits: 9,
  });

  // Year 4 Spring - Light final semester
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [
      getCourse('CIS 4528'),
      getCourse('ART 2101'),
    ],
    totalCredits: 6,
  });

  return {
    id: 'fast-track',
    name: 'Fast Track',
    description: 'Graduate with advanced skills and early specialization',
    semesters,
    highlights: [
      'Early internship after sophomore year',
      'Front-loaded major courses',
      'Light senior year for job search',
      'Build strong technical portfolio early',
    ],
    bestFor: 'Motivated students who want to enter the workforce quickly or pursue graduate school',
  };
}

function generateInternshipHeavyPlan(profile: UserProfile): Plan {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: [
      getCourse('CIS 1051'),
      getCourse('MATH 1041'),
      getCourse('ENGL 0802'),
      getCourse('GEN 1001'),
    ],
    totalCredits: 11,
  });

  // Year 1 Spring
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: [
      getCourse('CIS 1057'),
      getCourse('MATH 1042'),
      getCourse('PHYS 1061'),
      getCourse('HIST 2051'),
    ],
    totalCredits: 14,
  });

  // Year 2 Fall
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: [
      getCourse('CIS 2033'),
      getCourse('CIS 2107'),
      getCourse('CIS 2168'),
      getCourse('STAT 2103'),
      getCourse('ECON 1101'),
    ],
    totalCredits: 15,
  });

  // Year 2 Spring - Internship prep
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: [
      getCourse('CIS 3207'),
      getCourse('CIS 3223'),
      getCourse('CIS 3296'),
    ],
    totalCredits: 9,
    isInternshipSemester: true,
  });

  // Year 3 Fall
  semesters.push({
    semester: 5,
    season: 'Fall',
    year: 3,
    courses: [
      getCourse('CIS 3309'),
      getCourse('CIS 3715'),
      getCourse('CIS 4360'),
      getCourse('CIS 4398'),
    ],
    totalCredits: 12,
  });

  // Year 3 Spring - Second internship
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [
      getCourse('CIS 3800'),
      getCourse('PHIL 2101'),
    ],
    totalCredits: 6,
    isInternshipSemester: true,
  });

  // Year 4 Fall
  semesters.push({
    semester: 7,
    season: 'Fall',
    year: 4,
    courses: [
      getCourse('CIS 4515'),
      getCourse('CIS 4909'),
      getCourse('CIS 4396'),
      getCourse('CIS 4526'),
    ],
    totalCredits: 12,
  });

  // Year 4 Spring
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [
      getCourse('CIS 4997'),
      getCourse('CIS 4301'),
      getCourse('CIS 4555'),
      getCourse('CIS 4528'),
      getCourse('ART 2101'),
    ],
    totalCredits: 15,
  });

  return {
    id: 'internship-heavy',
    name: 'Internship-Focused',
    description: 'Maximize real-world experience with multiple internships',
    semesters,
    highlights: [
      'Two internship-optimized semesters',
      'Build extensive professional network',
      'Multiple companies on resume',
      'Strong practical skills development',
    ],
    bestFor: 'Career-focused students who want extensive industry experience before graduation',
  };
}
