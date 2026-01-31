import { Course, COURSES } from '@/app/data/mock-courses';
import { SemesterPlan } from '@/app/components/roadmap-view';
import { UserProfile } from '@/app/components/onboarding';

export function generatePlans(profile: UserProfile) {
  const allPlans = [
    generateBalancedPlan(profile),
    generateFastTrackPlan(profile),
    generateInternshipHeavyPlan(profile),
  ];

  return allPlans;
}

function generateBalancedPlan(profile: UserProfile): any {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: [
      COURSES.find(c => c.code === 'CIS 1051')!,
      COURSES.find(c => c.code === 'MATH 1041')!,
      COURSES.find(c => c.code === 'ENGL 0802')!,
      COURSES.find(c => c.code === 'GEN 1001')!,
    ],
    totalCredits: 11,
  });

  // Year 1 Spring
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: [
      COURSES.find(c => c.code === 'CIS 1057')!,
      COURSES.find(c => c.code === 'MATH 1042')!,
      COURSES.find(c => c.code === 'PHYS 1061')!,
      COURSES.find(c => c.code === 'HIST 2051')!,
    ],
    totalCredits: 14,
  });

  // Year 2 Fall
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: [
      COURSES.find(c => c.code === 'CIS 2033')!,
      COURSES.find(c => c.code === 'CIS 2107')!,
      COURSES.find(c => c.code === 'CIS 2168')!,
      COURSES.find(c => c.code === 'STAT 2103')!,
    ],
    totalCredits: 12,
  });

  // Year 2 Spring
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: [
      COURSES.find(c => c.code === 'CIS 3207')!,
      COURSES.find(c => c.code === 'CIS 3223')!,
      COURSES.find(c => c.code === 'CIS 3296')!,
      COURSES.find(c => c.code === 'ECON 1101')!,
    ],
    totalCredits: 12,
  });

  // Year 3 Fall
  semesters.push({
    semester: 5,
    season: 'Fall',
    year: 3,
    courses: [
      COURSES.find(c => c.code === 'CIS 3309')!,
      COURSES.find(c => c.code === 'CIS 3715')!,
      COURSES.find(c => c.code === 'CIS 4360')!,
      COURSES.find(c => c.code === 'CIS 4398')!,
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
      COURSES.find(c => c.code === 'CIS 3800')!,
      COURSES.find(c => c.code === 'CIS 4526')!,
      COURSES.find(c => c.code === 'PHIL 2101')!,
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
      COURSES.find(c => c.code === 'CIS 4515')!,
      COURSES.find(c => c.code === 'CIS 4909')!,
      COURSES.find(c => c.code === 'CIS 4396')!,
      COURSES.find(c => c.code === 'CIS 4301')!,
    ],
    totalCredits: 12,
  });

  // Year 4 Spring
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [
      COURSES.find(c => c.code === 'CIS 4997')!,
      COURSES.find(c => c.code === 'CIS 4555')!,
      COURSES.find(c => c.code === 'CIS 4528')!,
      COURSES.find(c => c.code === 'ART 2101')!,
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

function generateFastTrackPlan(profile: UserProfile): any {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall - Heavy load
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: [
      COURSES.find(c => c.code === 'CIS 1051')!,
      COURSES.find(c => c.code === 'MATH 1041')!,
      COURSES.find(c => c.code === 'ENGL 0802')!,
      COURSES.find(c => c.code === 'GEN 1001')!,
      COURSES.find(c => c.code === 'HIST 2051')!,
    ],
    totalCredits: 14,
  });

  // Year 1 Spring
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: [
      COURSES.find(c => c.code === 'CIS 1057')!,
      COURSES.find(c => c.code === 'MATH 1042')!,
      COURSES.find(c => c.code === 'PHYS 1061')!,
      COURSES.find(c => c.code === 'STAT 2103')!,
    ],
    totalCredits: 14,
  });

  // Year 2 Fall
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: [
      COURSES.find(c => c.code === 'CIS 2033')!,
      COURSES.find(c => c.code === 'CIS 2107')!,
      COURSES.find(c => c.code === 'CIS 2168')!,
      COURSES.find(c => c.code === 'CIS 3207')!,
      COURSES.find(c => c.code === 'ECON 1101')!,
    ],
    totalCredits: 15,
  });

  // Year 2 Spring - Lighter for early internship
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: [
      COURSES.find(c => c.code === 'CIS 3223')!,
      COURSES.find(c => c.code === 'CIS 3296')!,
      COURSES.find(c => c.code === 'PHIL 2101')!,
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
      COURSES.find(c => c.code === 'CIS 3309')!,
      COURSES.find(c => c.code === 'CIS 3715')!,
      COURSES.find(c => c.code === 'CIS 4360')!,
      COURSES.find(c => c.code === 'CIS 4398')!,
      COURSES.find(c => c.code === 'CIS 4515')!,
    ],
    totalCredits: 15,
  });

  // Year 3 Spring
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [
      COURSES.find(c => c.code === 'CIS 3800')!,
      COURSES.find(c => c.code === 'CIS 4526')!,
      COURSES.find(c => c.code === 'CIS 4909')!,
      COURSES.find(c => c.code === 'CIS 4396')!,
    ],
    totalCredits: 12,
  });

  // Year 4 Fall
  semesters.push({
    semester: 7,
    season: 'Fall',
    year: 4,
    courses: [
      COURSES.find(c => c.code === 'CIS 4301')!,
      COURSES.find(c => c.code === 'CIS 4997')!,
      COURSES.find(c => c.code === 'CIS 4555')!,
    ],
    totalCredits: 9,
  });

  // Year 4 Spring - Light final semester
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [
      COURSES.find(c => c.code === 'CIS 4528')!,
      COURSES.find(c => c.code === 'ART 2101')!,
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

function generateInternshipHeavyPlan(profile: UserProfile): any {
  const semesters: SemesterPlan[] = [];
  
  // Year 1 Fall
  semesters.push({
    semester: 1,
    season: 'Fall',
    year: 1,
    courses: [
      COURSES.find(c => c.code === 'CIS 1051')!,
      COURSES.find(c => c.code === 'MATH 1041')!,
      COURSES.find(c => c.code === 'ENGL 0802')!,
      COURSES.find(c => c.code === 'GEN 1001')!,
    ],
    totalCredits: 11,
  });

  // Year 1 Spring
  semesters.push({
    semester: 2,
    season: 'Spring',
    year: 1,
    courses: [
      COURSES.find(c => c.code === 'CIS 1057')!,
      COURSES.find(c => c.code === 'MATH 1042')!,
      COURSES.find(c => c.code === 'PHYS 1061')!,
      COURSES.find(c => c.code === 'HIST 2051')!,
    ],
    totalCredits: 14,
  });

  // Year 2 Fall
  semesters.push({
    semester: 3,
    season: 'Fall',
    year: 2,
    courses: [
      COURSES.find(c => c.code === 'CIS 2033')!,
      COURSES.find(c => c.code === 'CIS 2107')!,
      COURSES.find(c => c.code === 'CIS 2168')!,
      COURSES.find(c => c.code === 'STAT 2103')!,
      COURSES.find(c => c.code === 'ECON 1101')!,
    ],
    totalCredits: 15,
  });

  // Year 2 Spring - Internship prep
  semesters.push({
    semester: 4,
    season: 'Spring',
    year: 2,
    courses: [
      COURSES.find(c => c.code === 'CIS 3207')!,
      COURSES.find(c => c.code === 'CIS 3223')!,
      COURSES.find(c => c.code === 'CIS 3296')!,
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
      COURSES.find(c => c.code === 'CIS 3309')!,
      COURSES.find(c => c.code === 'CIS 3715')!,
      COURSES.find(c => c.code === 'CIS 4360')!,
      COURSES.find(c => c.code === 'CIS 4398')!,
    ],
    totalCredits: 12,
  });

  // Year 3 Spring - Second internship
  semesters.push({
    semester: 6,
    season: 'Spring',
    year: 3,
    courses: [
      COURSES.find(c => c.code === 'CIS 3800')!,
      COURSES.find(c => c.code === 'PHIL 2101')!,
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
      COURSES.find(c => c.code === 'CIS 4515')!,
      COURSES.find(c => c.code === 'CIS 4909')!,
      COURSES.find(c => c.code === 'CIS 4396')!,
      COURSES.find(c => c.code === 'CIS 4526')!,
    ],
    totalCredits: 12,
  });

  // Year 4 Spring
  semesters.push({
    semester: 8,
    season: 'Spring',
    year: 4,
    courses: [
      COURSES.find(c => c.code === 'CIS 4997')!,
      COURSES.find(c => c.code === 'CIS 4301')!,
      COURSES.find(c => c.code === 'CIS 4555')!,
      COURSES.find(c => c.code === 'CIS 4528')!,
      COURSES.find(c => c.code === 'ART 2101')!,
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
