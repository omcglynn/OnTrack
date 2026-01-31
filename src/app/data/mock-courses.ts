export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string;
  prerequisites?: string[];
  category: 'core' | 'major' | 'elective' | 'gen-ed';
  careerRelevance?: {
    [key: string]: number; // career type -> relevance score (0-100)
  };
  skills?: string[];
  difficulty?: number; // 1-5
  typicalSemester?: number;
}

export interface DegreeRequirement {
  category: string;
  requiredCredits: number;
  courses: string[]; // course codes or 'any-elective'
  description?: string;
}

// Mock courses for Computer Science at Temple University
export const COURSES: Course[] = [
  // Year 1 - Fall
  {
    id: 'cs1', code: 'CIS 1051', name: 'Introduction to Computer Science', credits: 3,
    description: 'Fundamental programming concepts using Python',
    category: 'major', typicalSemester: 1, difficulty: 2,
    careerRelevance: { 'Software Engineer': 95, 'Data Scientist': 80, 'UX Designer': 50, 'Product Manager': 60 },
    skills: ['Python', 'Programming Basics', 'Problem Solving']
  },
  {
    id: 'math1', code: 'MATH 1041', name: 'Calculus I', credits: 4,
    description: 'Differential and integral calculus',
    category: 'core', typicalSemester: 1, difficulty: 3,
    careerRelevance: { 'Software Engineer': 70, 'Data Scientist': 90, 'Machine Learning Engineer': 95 },
    skills: ['Mathematics', 'Analytical Thinking']
  },
  {
    id: 'eng1', code: 'ENGL 0802', name: 'Analytical Reading and Writing', credits: 3,
    description: 'Critical reading and writing skills',
    category: 'gen-ed', typicalSemester: 1, difficulty: 2,
    careerRelevance: { 'Product Manager': 80, 'UX Designer': 70, 'Technical Writer': 95 },
    skills: ['Communication', 'Writing']
  },
  {
    id: 'gen1', code: 'GEN 1001', name: 'First Year Seminar', credits: 1,
    description: 'Introduction to university life and academic skills',
    category: 'gen-ed', typicalSemester: 1, difficulty: 1,
    careerRelevance: {},
    skills: ['Academic Skills', 'Time Management']
  },

  // Year 1 - Spring
  {
    id: 'cs2', code: 'CIS 1057', name: 'Computer Science II', credits: 3,
    description: 'Object-oriented programming in C++',
    prerequisites: ['CIS 1051'],
    category: 'major', typicalSemester: 2, difficulty: 3,
    careerRelevance: { 'Software Engineer': 95, 'Game Developer': 90, 'Systems Engineer': 85 },
    skills: ['C++', 'OOP', 'Data Structures']
  },
  {
    id: 'math2', code: 'MATH 1042', name: 'Calculus II', credits: 4,
    description: 'Advanced integration and infinite series',
    prerequisites: ['MATH 1041'],
    category: 'core', typicalSemester: 2, difficulty: 3,
    careerRelevance: { 'Data Scientist': 85, 'Machine Learning Engineer': 90 },
    skills: ['Advanced Mathematics']
  },
  {
    id: 'phys1', code: 'PHYS 1061', name: 'Physics for Scientists I', credits: 4,
    description: 'Mechanics and thermodynamics',
    category: 'core', typicalSemester: 2, difficulty: 3,
    careerRelevance: { 'Robotics Engineer': 85, 'Game Developer': 60 },
    skills: ['Physics', 'Scientific Method']
  },
  {
    id: 'gen2', code: 'HIST 2051', name: 'World History', credits: 3,
    description: 'Survey of world civilizations',
    category: 'gen-ed', typicalSemester: 2, difficulty: 2,
    careerRelevance: {},
    skills: ['Critical Thinking', 'Cultural Awareness']
  },

  // Year 2 - Fall
  {
    id: 'cs3', code: 'CIS 2033', name: 'Computational Mathematics', credits: 3,
    description: 'Discrete mathematics and logic',
    prerequisites: ['CIS 1057'],
    category: 'major', typicalSemester: 3, difficulty: 3,
    careerRelevance: { 'Software Engineer': 80, 'Cybersecurity': 85, 'Data Scientist': 75 },
    skills: ['Discrete Math', 'Logic', 'Algorithms']
  },
  {
    id: 'cs4', code: 'CIS 2107', name: 'Computer Systems', credits: 3,
    description: 'Low-level programming and computer architecture',
    prerequisites: ['CIS 1057'],
    category: 'major', typicalSemester: 3, difficulty: 4,
    careerRelevance: { 'Systems Engineer': 95, 'Embedded Systems': 90, 'Software Engineer': 75 },
    skills: ['C', 'Assembly', 'Computer Architecture']
  },
  {
    id: 'cs5', code: 'CIS 2168', name: 'Data Structures', credits: 3,
    description: 'Advanced data structures and algorithms',
    prerequisites: ['CIS 1057', 'CIS 2033'],
    category: 'major', typicalSemester: 3, difficulty: 4,
    careerRelevance: { 'Software Engineer': 100, 'Data Scientist': 90, 'Algorithm Engineer': 95 },
    skills: ['Data Structures', 'Algorithms', 'Problem Solving']
  },
  {
    id: 'stat1', code: 'STAT 2103', name: 'Statistical Methods', credits: 3,
    description: 'Introduction to probability and statistics',
    category: 'core', typicalSemester: 3, difficulty: 3,
    careerRelevance: { 'Data Scientist': 100, 'Machine Learning Engineer': 95, 'Business Analyst': 85 },
    skills: ['Statistics', 'Data Analysis']
  },

  // Year 2 - Spring
  {
    id: 'cs6', code: 'CIS 3207', name: 'Operating Systems', credits: 3,
    description: 'OS concepts, concurrency, and system programming',
    prerequisites: ['CIS 2107'],
    category: 'major', typicalSemester: 4, difficulty: 4,
    careerRelevance: { 'Systems Engineer': 100, 'DevOps Engineer': 90, 'Backend Developer': 80 },
    skills: ['OS Concepts', 'Concurrency', 'System Programming']
  },
  {
    id: 'cs7', code: 'CIS 3223', name: 'Data Structures and Algorithms', credits: 3,
    description: 'Algorithm analysis and design',
    prerequisites: ['CIS 2168'],
    category: 'major', typicalSemester: 4, difficulty: 4,
    careerRelevance: { 'Software Engineer': 100, 'Algorithm Engineer': 100, 'Competitive Programmer': 95 },
    skills: ['Advanced Algorithms', 'Complexity Analysis']
  },
  {
    id: 'cs8', code: 'CIS 3296', name: 'Software Design', credits: 3,
    description: 'Software engineering principles and design patterns',
    prerequisites: ['CIS 2168'],
    category: 'major', typicalSemester: 4, difficulty: 3,
    careerRelevance: { 'Software Engineer': 95, 'Product Manager': 70, 'Tech Lead': 90 },
    skills: ['Software Engineering', 'Design Patterns', 'Best Practices']
  },
  {
    id: 'gen3', code: 'ECON 1101', name: 'Microeconomics', credits: 3,
    description: 'Introduction to economic principles',
    category: 'gen-ed', typicalSemester: 4, difficulty: 2,
    careerRelevance: { 'Product Manager': 75, 'Business Analyst': 85 },
    skills: ['Economics', 'Business Thinking']
  },

  // Year 3 - Fall
  {
    id: 'cs9', code: 'CIS 3309', name: 'Database Management', credits: 3,
    description: 'Database design, SQL, and transaction management',
    prerequisites: ['CIS 2168'],
    category: 'major', typicalSemester: 5, difficulty: 3,
    careerRelevance: { 'Backend Developer': 95, 'Database Administrator': 100, 'Data Engineer': 90 },
    skills: ['SQL', 'Database Design', 'Data Modeling']
  },
  {
    id: 'cs10', code: 'CIS 3715', name: 'Principles of Data Science', credits: 3,
    description: 'Data analysis, machine learning, and visualization',
    prerequisites: ['STAT 2103', 'CIS 2168'],
    category: 'major', typicalSemester: 5, difficulty: 4,
    careerRelevance: { 'Data Scientist': 100, 'Machine Learning Engineer': 95, 'AI Researcher': 90 },
    skills: ['Machine Learning', 'Python', 'Data Visualization']
  },
  {
    id: 'cs11', code: 'CIS 4360', name: 'Computer Networks', credits: 3,
    description: 'Network protocols and distributed systems',
    prerequisites: ['CIS 3207'],
    category: 'major', typicalSemester: 5, difficulty: 4,
    careerRelevance: { 'Network Engineer': 100, 'DevOps Engineer': 85, 'Cloud Architect': 80 },
    skills: ['Networking', 'Protocols', 'Distributed Systems']
  },
  {
    id: 'elec1', code: 'CIS 4398', name: 'Web Application Development', credits: 3,
    description: 'Full-stack web development with modern frameworks',
    prerequisites: ['CIS 3296'],
    category: 'elective', typicalSemester: 5, difficulty: 3,
    careerRelevance: { 'Frontend Developer': 100, 'Full Stack Developer': 100, 'Web Developer': 100 },
    skills: ['React', 'Node.js', 'Web Development']
  },

  // Year 3 - Spring (Internship Semester - Light Load)
  {
    id: 'cs12', code: 'CIS 3800', name: 'Algorithms and Computation', credits: 3,
    description: 'Advanced computational theory',
    prerequisites: ['CIS 3223'],
    category: 'major', typicalSemester: 6, difficulty: 4,
    careerRelevance: { 'Algorithm Engineer': 95, 'Research Scientist': 90 },
    skills: ['Theory', 'Computational Complexity']
  },
  {
    id: 'elec2', code: 'CIS 4526', name: 'Mobile App Development', credits: 3,
    description: 'iOS and Android development',
    prerequisites: ['CIS 3296'],
    category: 'elective', typicalSemester: 6, difficulty: 3,
    careerRelevance: { 'Mobile Developer': 100, 'iOS Developer': 95, 'Android Developer': 95 },
    skills: ['Swift', 'Kotlin', 'Mobile Development']
  },
  {
    id: 'gen4', code: 'PHIL 2101', name: 'Ethics', credits: 3,
    description: 'Moral philosophy and ethical reasoning',
    category: 'gen-ed', typicalSemester: 6, difficulty: 2,
    careerRelevance: { 'Product Manager': 70, 'AI Ethics Researcher': 90 },
    skills: ['Ethics', 'Critical Thinking']
  },

  // Year 4 - Fall
  {
    id: 'cs13', code: 'CIS 4515', name: 'Cybersecurity', credits: 3,
    description: 'Security principles, cryptography, and secure systems',
    prerequisites: ['CIS 3207'],
    category: 'major', typicalSemester: 7, difficulty: 4,
    careerRelevance: { 'Cybersecurity Analyst': 100, 'Security Engineer': 100, 'Penetration Tester': 95 },
    skills: ['Security', 'Cryptography', 'Ethical Hacking']
  },
  {
    id: 'elec3', code: 'CIS 4909', name: 'Machine Learning', credits: 3,
    description: 'Advanced ML algorithms and deep learning',
    prerequisites: ['CIS 3715'],
    category: 'elective', typicalSemester: 7, difficulty: 5,
    careerRelevance: { 'Machine Learning Engineer': 100, 'AI Researcher': 100, 'Data Scientist': 95 },
    skills: ['Deep Learning', 'TensorFlow', 'Neural Networks']
  },
  {
    id: 'elec4', code: 'CIS 4396', name: 'Cloud Computing', credits: 3,
    description: 'Cloud platforms and distributed computing',
    prerequisites: ['CIS 4360'],
    category: 'elective', typicalSemester: 7, difficulty: 3,
    careerRelevance: { 'Cloud Architect': 100, 'DevOps Engineer': 95, 'Backend Developer': 80 },
    skills: ['AWS', 'Cloud Architecture', 'Microservices']
  },
  {
    id: 'elec5', code: 'CIS 4301', name: 'UX Design', credits: 3,
    description: 'User experience and interface design',
    category: 'elective', typicalSemester: 7, difficulty: 2,
    careerRelevance: { 'UX Designer': 100, 'Product Manager': 85, 'Frontend Developer': 75 },
    skills: ['UX Design', 'Figma', 'User Research']
  },

  // Year 4 - Spring
  {
    id: 'cs14', code: 'CIS 4997', name: 'Senior Capstone Project', credits: 3,
    description: 'Team-based software development project',
    prerequisites: ['CIS 3296'],
    category: 'major', typicalSemester: 8, difficulty: 4,
    careerRelevance: { 'Software Engineer': 90, 'Product Manager': 85, 'Tech Lead': 95 },
    skills: ['Project Management', 'Teamwork', 'Full Development Cycle']
  },
  {
    id: 'elec6', code: 'CIS 4555', name: 'Game Development', credits: 3,
    description: 'Game engines and interactive entertainment',
    prerequisites: ['CIS 3223'],
    category: 'elective', typicalSemester: 8, difficulty: 4,
    careerRelevance: { 'Game Developer': 100, 'Graphics Engineer': 90 },
    skills: ['Unity', 'Game Design', 'Graphics Programming']
  },
  {
    id: 'elec7', code: 'CIS 4528', name: 'Blockchain Technology', credits: 3,
    description: 'Distributed ledgers and smart contracts',
    prerequisites: ['CIS 3207'],
    category: 'elective', typicalSemester: 8, difficulty: 4,
    careerRelevance: { 'Blockchain Developer': 100, 'Web3 Engineer': 100 },
    skills: ['Blockchain', 'Smart Contracts', 'Solidity']
  },
  {
    id: 'gen5', code: 'ART 2101', name: 'Digital Art', credits: 3,
    description: 'Creative expression through digital media',
    category: 'gen-ed', typicalSemester: 8, difficulty: 2,
    careerRelevance: { 'UX Designer': 75, 'Game Developer': 70 },
    skills: ['Creativity', 'Visual Design']
  },
];

export const CAREER_PATHS = [
  { id: 'swe', name: 'Software Engineer', description: 'Build scalable applications and systems' },
  { id: 'ds', name: 'Data Scientist', description: 'Analyze data and build ML models' },
  { id: 'ml', name: 'Machine Learning Engineer', description: 'Develop AI and ML systems' },
  { id: 'web', name: 'Full Stack Developer', description: 'Create web applications from front to back' },
  { id: 'mobile', name: 'Mobile Developer', description: 'Build iOS and Android apps' },
  { id: 'security', name: 'Cybersecurity Analyst', description: 'Protect systems and data' },
  { id: 'cloud', name: 'Cloud Architect', description: 'Design cloud infrastructure' },
  { id: 'ux', name: 'UX Designer', description: 'Create user-centered digital experiences' },
  { id: 'pm', name: 'Product Manager', description: 'Guide product strategy and development' },
  { id: 'devops', name: 'DevOps Engineer', description: 'Bridge development and operations' },
];

export const DEGREE_REQUIREMENTS: DegreeRequirement[] = [
  { category: 'Major Core', requiredCredits: 45, description: 'Required CS courses', courses: [] },
  { category: 'Math/Science', requiredCredits: 18, description: 'Supporting sciences', courses: [] },
  { category: 'General Education', requiredCredits: 30, description: 'Breadth requirements', courses: [] },
  { category: 'Electives', requiredCredits: 27, description: 'Choose based on interests', courses: [] },
];
