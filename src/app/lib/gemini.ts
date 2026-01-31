import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { COURSES, CAREER_PATHS, DEGREE_REQUIREMENTS, Course } from '@/app/data/mock-courses';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('VITE_GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ChatContext {
  userName?: string;
  major?: string;
  careerGoal?: string;
  completedCourses?: string[]; // Course codes like ['CIS 1051', 'MATH 1041']
  currentSemester?: number; // 1-8
  targetGraduationSemesters?: number; // How many semesters until graduation
}

// Format a single course for the AI
const formatCourseForAI = (course: Course): string => {
  const prereqs = course.prerequisites?.length ? `Prerequisites: ${course.prerequisites.join(', ')}` : 'No prerequisites';
  const skills = course.skills?.length ? `Skills: ${course.skills.join(', ')}` : '';
  const careerRel = course.careerRelevance 
    ? `Career Relevance: ${Object.entries(course.careerRelevance).map(([career, score]) => `${career}(${score}%)`).join(', ')}`
    : '';
  
  return `- **${course.code}** - ${course.name} (${course.credits} cr, Difficulty: ${course.difficulty || 'N/A'}/5, Typical Sem: ${course.typicalSemester || 'N/A'})
  ${course.description}
  ${prereqs}
  ${skills}
  ${careerRel}
  Category: ${course.category}${course.genEdAttribute ? ` (${course.genEdAttribute})` : ''}`;
};

// Group courses by category for better organization
const formatCourseCatalog = (): string => {
  const categories: { [key: string]: Course[] } = {};
  
  COURSES.forEach(course => {
    const cat = course.category;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(course);
  });

  let catalog = '';
  
  const categoryOrder = ['major', 'core', 'lab-science', 'elective', 'gen-ed'];
  const categoryNames: { [key: string]: string } = {
    'major': 'CIS MAJOR REQUIREMENTS',
    'core': 'MATHEMATICS REQUIREMENTS', 
    'lab-science': 'LABORATORY SCIENCE',
    'elective': 'ELECTIVE COURSES (CIS & Interdisciplinary)',
    'gen-ed': 'GENERAL EDUCATION'
  };

  for (const cat of categoryOrder) {
    if (categories[cat]) {
      catalog += `\n### ${categoryNames[cat] || cat.toUpperCase()}\n`;
      categories[cat].forEach(course => {
        catalog += formatCourseForAI(course) + '\n';
      });
    }
  }

  return catalog;
};

// Format career paths
const formatCareerPaths = (): string => {
  return CAREER_PATHS.map(cp => 
    `- **${cp.name}** (ID: ${cp.id}): ${cp.description}`
  ).join('\n');
};

// Format degree requirements
const formatDegreeRequirements = (): string => {
  return DEGREE_REQUIREMENTS.map(req =>
    `- **${req.category}**: ${req.requiredCredits} credits required. ${req.description || ''}\n  Core courses: ${req.courses.length > 0 ? req.courses.join(', ') : 'Student choice from electives'}`
  ).join('\n');
};

const buildSystemPrompt = (context: ChatContext): string => {
  const { userName, major, careerGoal, completedCourses, currentSemester, targetGraduationSemesters } = context;
  
  // Build student profile section
  const studentProfile = `
## Student Profile
${userName ? `- **Name**: ${userName}` : '- Name: Not provided'}
${major ? `- **Major**: ${major}` : '- Major: Computer Science (assumed)'}
${careerGoal ? `- **Career Goal**: ${careerGoal}` : '- Career Goal: Not specified yet'}
${currentSemester ? `- **Current Semester**: ${currentSemester} of 8` : ''}
${targetGraduationSemesters ? `- **Semesters Until Graduation**: ${targetGraduationSemesters}` : ''}
${completedCourses?.length ? `- **Completed Courses**: ${completedCourses.join(', ')}` : '- Completed Courses: None recorded yet'}
`;

  return `You are **OnTrack AI**, an expert academic advisor for Temple University Computer Science students. Your mission is to help students make intelligent course selections that align with their career goals and ensure timely graduation.

${studentProfile}

## Your Primary Objectives (in order of priority)

### 1. CAREER-FOCUSED RECOMMENDATIONS (Highest Priority)
- **Always prioritize the student's career goal** when suggesting courses
- Look at the "Career Relevance" scores in the course catalog - higher percentages = more relevant
- **Actively suggest courses OUTSIDE their major** if they provide critical skills for their career goal
- For example: A future Penetration Tester should take Psychology courses (social engineering), a Digital Forensics specialist should take Criminal Justice courses
- Think holistically about what skills and knowledge will make them successful in their chosen career

### 2. DEGREE REQUIREMENT FULFILLMENT
- Help students fulfill all graduation requirements efficiently
- Track which requirements they've completed vs. what remains
- Suggest courses that can fulfill multiple purposes (e.g., an elective that also builds career skills)

### 3. PREREQUISITE AWARENESS
- Always check prerequisites before recommending a course
- Help students plan prerequisite chains (e.g., "Take CIS 1051 → CIS 1068 → CIS 2168")
- Warn if they're missing prerequisites for a desired course

### 4. ON-TIME GRADUATION
- Default assumption: Student wants to graduate in 8 semesters (4 years)
- Help them balance course loads across semesters
- Flag if their plan might delay graduation

## Available Career Paths
${formatCareerPaths()}

## Degree Requirements (Temple University BS in Computer Science)
${formatDegreeRequirements()}

## COMPLETE COURSE CATALOG
${formatCourseCatalog()}

## Response Guidelines

1. **Be specific**: Reference actual course codes and names from the catalog
2. **Explain career connections**: When recommending a course, explain HOW it helps their career goal
3. **Think cross-disciplinary**: Don't limit suggestions to CIS courses - Psychology, Criminal Justice, Communication, and other courses can be crucial for certain careers
4. **Use the Career Relevance scores**: Courses with 90%+ relevance to their goal are high priority
5. **Consider difficulty balance**: Don't recommend all difficulty-5 courses in one semester
6. **Be concise but complete**: Aim for helpful responses that get to the point
7. **Proactively suggest**: If you notice their career goal would benefit from courses they might not consider, suggest them!

## Special Recommendations by Career Path

- **Penetration Tester / Red Team**: Emphasize PSY courses (social engineering), CIS 3319 (wireless), CIS 4615 (ethical hacking), SMC courses (communication/deception)
- **Digital Forensics**: Emphasize CJ courses (criminal justice, evidence), CIS 3605 (forensics), LGLS courses (cyberlaw)
- **Social Engineering Consultant**: Heavy emphasis on PSY 2301, PSY 3361 (persuasion), SMC 3201 (deception), interpersonal skills
- **Cybersecurity Analyst**: Balance of technical (CIS 3207, 4319) and analytical (CIS 3715 data science, threat intelligence)
- **Software Engineer**: Focus on CIS 3296 (software design), CIS 4398 (capstone), CIS 3308 (web), CIS 4331 (databases)
- **Malware Analyst**: CIS 2107 (low-level), CIS 3217 (architecture), reverse engineering focus

Remember: Your goal is to be the student's strategic partner in building a career-optimized education path. Don't just answer questions—proactively guide them toward success!`;
};

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const convertToGeminiHistory = (
  messages: { role: 'user' | 'assistant'; content: string }[]
): Content[] => {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
};

export const sendMessage = async (
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(context),
  });

  // Convert conversation history to Gemini format (excluding the current message)
  const history = convertToGeminiHistory(conversationHistory);

  // Start a chat session with history
  const chat = model.startChat({
    history,
  });

  // Send the new message
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  
  return response.text();
};

// Enable code execution for technical questions
export const sendMessageWithCodeExecution = async (
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(context),
    tools: [{ codeExecution: {} }],
  });

  const history = convertToGeminiHistory(conversationHistory);

  const chat = model.startChat({
    history,
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  
  // Process the response - it may contain code execution results
  let responseText = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if ('text' in part) {
      responseText += part.text;
    }
    if ('executableCode' in part && part.executableCode) {
      responseText += `\n\`\`\`python\n${part.executableCode.code}\n\`\`\`\n`;
    }
    if ('codeExecutionResult' in part && part.codeExecutionResult) {
      responseText += `\n**Output:**\n\`\`\`\n${part.codeExecutionResult.output}\n\`\`\`\n`;
    }
  }
  
  return responseText || response.text();
};

// Schedule generation specific types
export interface ScheduleGenerationRequest {
  prompt: string;
  targetCredits?: number; // e.g., 15-18 credits
  existingCoursesInSemester?: string[]; // Courses already in the target semester
}

export interface AIScheduleRecommendation {
  courseCodes: string[];
  reasoning: string;
  totalCredits: number;
}

// Build a specialized prompt for schedule generation
const buildScheduleGenerationPrompt = (
  context: ChatContext,
  request: ScheduleGenerationRequest
): string => {
  const { completedCourses = [], careerGoal } = context;
  const { prompt, targetCredits = 15, existingCoursesInSemester = [] } = request;
  
  // Get available courses (not completed, prerequisites met)
  const availableCourses = COURSES.filter(course => {
    // Not already completed
    if (completedCourses.includes(course.code)) return false;
    // Not already in the semester
    if (existingCoursesInSemester.includes(course.code)) return false;
    // Prerequisites met
    if (course.prerequisites) {
      const prereqsMet = course.prerequisites.every(prereq => completedCourses.includes(prereq));
      if (!prereqsMet) return false;
    }
    return true;
  });
  
  const availableCoursesStr = availableCourses.map(c => 
    `${c.code} (${c.credits}cr, ${c.category}${c.careerRelevance && careerGoal ? `, Career: ${Object.entries(c.careerRelevance).map(([k,v]) => `${k}:${v}%`).join(', ')}` : ''})`
  ).join('\n');

  return `Generate a semester schedule based on this request: "${prompt}"

## Context
- Career Goal: ${careerGoal || 'Not specified'}
- Target Credits: Around ${targetCredits} credits
- Already Completed: ${completedCourses.length > 0 ? completedCourses.join(', ') : 'None'}
- Already in this semester: ${existingCoursesInSemester.length > 0 ? existingCoursesInSemester.join(', ') : 'None'}

## Available Courses (prerequisites met, not yet taken)
${availableCoursesStr}

## Instructions
1. Select courses that best match the student's request and career goal
2. Aim for ${targetCredits} total credits (can be slightly over/under)
3. Balance difficulty levels
4. Prioritize career-relevant courses
5. Include a mix of major requirements and electives that support career goals

## Required Response Format
You MUST respond with ONLY a JSON object in this exact format, no other text:
{
  "courseCodes": ["CIS XXXX", "MATH XXXX", ...],
  "reasoning": "Brief explanation of why these courses were chosen",
  "totalCredits": 15
}`;
};

// Generate a schedule recommendation from the AI
export const generateScheduleRecommendation = async (
  context: ChatContext,
  request: ScheduleGenerationRequest
): Promise<AIScheduleRecommendation> => {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = buildScheduleGenerationPrompt(context, request);
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    const parsed = JSON.parse(text) as AIScheduleRecommendation;
    
    // Validate the response
    if (!parsed.courseCodes || !Array.isArray(parsed.courseCodes)) {
      throw new Error('Invalid response: missing courseCodes array');
    }
    
    // Calculate actual total credits
    const actualCredits = parsed.courseCodes.reduce((sum, code) => {
      const course = COURSES.find(c => c.code === code);
      return sum + (course?.credits || 0);
    }, 0);
    
    return {
      ...parsed,
      totalCredits: actualCredits,
    };
  } catch (e) {
    console.error('Failed to parse AI schedule response:', text);
    throw new Error('Failed to generate schedule. Please try again.');
  }
};
