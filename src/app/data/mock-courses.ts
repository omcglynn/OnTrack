export interface CourseSchedule {
  days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[];
  startTime: string; // 24h format "09:00"
  endTime: string;   // 24h format "10:30"
  location: string;
  professor: string;
  section: string;
  classType: 'Lecture' | 'Lab' | 'Seminar' | 'Discussion' | 'Recitation';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string;
  prerequisites?: string[];
  category: 'core' | 'major' | 'elective' | 'gen-ed' | 'lab-science';
  genEdAttribute?: string; // GW, GQ, GY, GZ, GA, GB, GD, GG, GS, GU
  careerRelevance?: {
    [key: string]: number;
  };
  skills?: string[];
  difficulty?: number;
  typicalSemester?: number;
  schedule?: CourseSchedule; // Fixed schedule for this course
}

export interface DegreeRequirement {
  category: string;
  requiredCredits: number;
  courses: string[];
  description?: string;
}

// Temple University Computer Science Major - Complete Course Catalog
export const COURSES: Course[] = [
  // ========================================
  // CIS CORE REQUIREMENTS (46-47 credits)
  // ========================================
  
  {
    id: 'cis1001',
    code: 'CIS 1001',
    name: 'Introduction to Academics in Computer Science',
    credits: 1,
    description: 'Orientation to the Computer Science program at Temple University. Covers academic planning, university resources, career paths in computing, and introduction to the department. Required for all incoming CS majors.',
    category: 'major',
    typicalSemester: 1,
    difficulty: 1,
    careerRelevance: { 'Cybersecurity Analyst': 30, 'Digital Forensics Specialist': 30, 'Software Engineer': 30 },
    skills: ['Academic Planning', 'Career Exploration', 'University Resources']
  },
  {
    id: 'cis1051',
    code: 'CIS 1051',
    name: 'Introduction to Problem Solving and Programming in Python',
    credits: 4,
    description: 'Introduction to computational thinking and programming using Python. Topics include variables, control structures, functions, data structures, file I/O, and basic algorithms. Emphasizes problem-solving strategies and program design. Ideal first programming course.',
    category: 'major',
    typicalSemester: 1,
    difficulty: 2,
    careerRelevance: { 'Cybersecurity Analyst': 85, 'Digital Forensics Specialist': 90, 'Penetration Tester': 95, 'Software Engineer': 95, 'Data Scientist': 90 },
    skills: ['Python', 'Programming Fundamentals', 'Problem Solving', 'Algorithmic Thinking']
  },
  {
    id: 'cis1057',
    code: 'CIS 1057',
    name: 'Computer Programming in C',
    credits: 4,
    description: 'Introduction to programming using the C language. Covers low-level programming concepts including memory management, pointers, arrays, structures, and file operations. Essential for understanding system-level programming and security vulnerabilities.',
    category: 'major',
    typicalSemester: 1,
    difficulty: 3,
    careerRelevance: { 'Cybersecurity Analyst': 90, 'Digital Forensics Specialist': 85, 'Penetration Tester': 95, 'Systems Engineer': 95, 'Malware Analyst': 100 },
    skills: ['C Programming', 'Memory Management', 'Pointers', 'Low-Level Programming']
  },
  {
    id: 'cis1068',
    code: 'CIS 1068',
    name: 'Program Design and Abstraction',
    credits: 4,
    description: 'Object-oriented programming and software design principles using Java. Topics include classes, inheritance, polymorphism, interfaces, exception handling, and GUI development. Builds foundation for large-scale software development.',
    prerequisites: ['CIS 1051'],
    category: 'major',
    typicalSemester: 2,
    difficulty: 3,
    careerRelevance: { 'Software Engineer': 95, 'Cybersecurity Analyst': 75, 'Application Security Engineer': 85, 'Digital Forensics Specialist': 70 },
    skills: ['Java', 'Object-Oriented Programming', 'Software Design', 'Abstraction']
  },
  {
    id: 'cis1166',
    code: 'CIS 1166',
    name: 'Mathematical Concepts in Computing I',
    credits: 4,
    description: 'Discrete mathematics for computer science. Topics include propositional and predicate logic, proof techniques, sets, relations, functions, combinatorics, and graph theory. Critical foundation for algorithm analysis and cryptography.',
    category: 'major',
    typicalSemester: 2,
    difficulty: 4,
    careerRelevance: { 'Cybersecurity Analyst': 85, 'Cryptographer': 100, 'Software Engineer': 80, 'Digital Forensics Specialist': 70 },
    skills: ['Discrete Mathematics', 'Logic', 'Proof Techniques', 'Graph Theory']
  },
  {
    id: 'cis2033',
    code: 'CIS 2033',
    name: 'Computational Probability and Statistics',
    credits: 3,
    description: 'Probability theory and statistics with computational applications. Covers probability distributions, statistical inference, hypothesis testing, and regression analysis. Essential for security analytics, anomaly detection, and forensic analysis.',
    prerequisites: ['MATH 1041'],
    category: 'major',
    typicalSemester: 3,
    difficulty: 3,
    careerRelevance: { 'Cybersecurity Analyst': 90, 'Digital Forensics Specialist': 85, 'Security Data Analyst': 95, 'Threat Intelligence Analyst': 90 },
    skills: ['Probability', 'Statistics', 'Data Analysis', 'Statistical Inference']
  },
  {
    id: 'cis2107',
    code: 'CIS 2107',
    name: 'Computer Systems and Low-Level Programming',
    credits: 4,
    description: 'Computer organization and low-level programming. Topics include assembly language, machine organization, memory hierarchy, I/O systems, and system calls. Critical for understanding vulnerabilities, exploits, and reverse engineering.',
    prerequisites: ['CIS 1057'],
    category: 'major',
    typicalSemester: 3,
    difficulty: 4,
    careerRelevance: { 'Cybersecurity Analyst': 95, 'Penetration Tester': 100, 'Malware Analyst': 100, 'Digital Forensics Specialist': 95, 'Reverse Engineer': 100 },
    skills: ['Assembly Language', 'Computer Architecture', 'Memory Systems', 'System Programming']
  },
  {
    id: 'cis2166',
    code: 'CIS 2166',
    name: 'Mathematical Concepts in Computing II',
    credits: 4,
    description: 'Advanced discrete mathematics including number theory, algebraic structures, and formal languages. Covers modular arithmetic, groups, and automata theory. Foundation for cryptography, security protocols, and computational complexity.',
    prerequisites: ['CIS 1166'],
    category: 'major',
    typicalSemester: 3,
    difficulty: 4,
    careerRelevance: { 'Cryptographer': 100, 'Cybersecurity Analyst': 85, 'Security Researcher': 90, 'Software Engineer': 75 },
    skills: ['Number Theory', 'Abstract Algebra', 'Automata Theory', 'Cryptographic Foundations']
  },
  {
    id: 'cis2168',
    code: 'CIS 2168',
    name: 'Data Structures',
    credits: 4,
    description: 'Fundamental data structures and their applications. Topics include arrays, linked lists, stacks, queues, trees, heaps, hash tables, and graphs. Covers algorithm analysis and complexity. Essential for efficient security tool development.',
    prerequisites: ['CIS 1068', 'CIS 1166'],
    category: 'major',
    typicalSemester: 3,
    difficulty: 4,
    careerRelevance: { 'Software Engineer': 100, 'Cybersecurity Analyst': 85, 'Digital Forensics Specialist': 80, 'Security Tool Developer': 95 },
    skills: ['Data Structures', 'Algorithms', 'Complexity Analysis', 'Problem Solving']
  },
  {
    id: 'cis3207',
    code: 'CIS 3207',
    name: 'Introduction to Systems Programming and Operating Systems',
    credits: 4,
    description: 'Operating system concepts and systems programming. Topics include processes, threads, synchronization, memory management, file systems, and security mechanisms. Critical for understanding system-level attacks and defenses.',
    prerequisites: ['CIS 2107', 'CIS 2168'],
    category: 'major',
    typicalSemester: 4,
    difficulty: 5,
    careerRelevance: { 'Cybersecurity Analyst': 100, 'Penetration Tester': 100, 'Digital Forensics Specialist': 95, 'Systems Security Engineer': 100, 'Malware Analyst': 100 },
    skills: ['Operating Systems', 'Process Management', 'Memory Management', 'System Security']
  },
  {
    id: 'cis3223',
    code: 'CIS 3223',
    name: 'Data Structures and Algorithms',
    credits: 3,
    description: 'Advanced algorithm design and analysis. Topics include divide-and-conquer, dynamic programming, greedy algorithms, graph algorithms, and NP-completeness. Essential for developing efficient security solutions and understanding computational limits.',
    prerequisites: ['CIS 2168'],
    category: 'major',
    typicalSemester: 4,
    difficulty: 4,
    careerRelevance: { 'Software Engineer': 100, 'Security Researcher': 90, 'Cryptographer': 95, 'Digital Forensics Specialist': 75 },
    skills: ['Algorithm Design', 'Dynamic Programming', 'Graph Algorithms', 'Complexity Theory']
  },
  {
    id: 'cis3296',
    code: 'CIS 3296',
    name: 'Software Design',
    credits: 4,
    description: 'Software engineering principles and practices. Topics include requirements analysis, design patterns, testing, version control, agile methodologies, and team collaboration. Prepares students for industry software development.',
    prerequisites: ['CIS 2168'],
    category: 'major',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Software Engineer': 100, 'Security Engineer': 85, 'Application Security': 90, 'DevSecOps Engineer': 95 },
    skills: ['Software Engineering', 'Design Patterns', 'Testing', 'Agile', 'Git']
  },
  {
    id: 'cis4398',
    code: 'CIS 4398',
    name: 'Projects in Computer Science',
    credits: 3,
    description: 'Capstone project course where students work in teams on substantial software projects. Covers full development lifecycle from requirements to deployment. Opportunity to build security-focused projects and portfolio pieces.',
    prerequisites: ['CIS 3296'],
    category: 'major',
    typicalSemester: 8,
    difficulty: 4,
    careerRelevance: { 'Software Engineer': 95, 'Security Engineer': 90, 'Project Manager': 85, 'All Careers': 90 },
    skills: ['Project Management', 'Team Collaboration', 'Full Stack Development', 'Presentation']
  },

  // ========================================
  // MATHEMATICS REQUIREMENTS (8 credits)
  // ========================================
  
  {
    id: 'math1041',
    code: 'MATH 1041',
    name: 'Calculus I',
    credits: 4,
    description: 'Introduction to differential calculus. Topics include limits, continuity, derivatives, applications of differentiation, and introduction to integration. Foundation for advanced mathematics and computational analysis.',
    category: 'core',
    typicalSemester: 1,
    difficulty: 3,
    careerRelevance: { 'Data Scientist': 90, 'Security Analyst': 60, 'Cryptographer': 85, 'Software Engineer': 70 },
    skills: ['Calculus', 'Mathematical Analysis', 'Problem Solving']
  },
  {
    id: 'math1042',
    code: 'MATH 1042',
    name: 'Calculus II',
    credits: 4,
    description: 'Continuation of integral calculus. Topics include integration techniques, applications of integration, infinite sequences and series, and introduction to differential equations. Supports advanced algorithm analysis.',
    prerequisites: ['MATH 1041'],
    category: 'core',
    typicalSemester: 2,
    difficulty: 4,
    careerRelevance: { 'Data Scientist': 90, 'Cryptographer': 85, 'Machine Learning Engineer': 90, 'Software Engineer': 65 },
    skills: ['Integration', 'Series', 'Differential Equations', 'Mathematical Reasoning']
  },

  // ========================================
  // LABORATORY SCIENCE (8 credits - Physics Sequence)
  // ========================================
  
  {
    id: 'phys1061',
    code: 'PHYS 1061',
    name: 'Elementary Classical Physics I',
    credits: 4,
    description: 'Mechanics, thermodynamics, and wave motion with laboratory. Covers kinematics, dynamics, energy, momentum, rotational motion, and oscillations. Develops scientific reasoning and experimental skills applicable to forensic investigation.',
    category: 'lab-science',
    typicalSemester: 3,
    difficulty: 3,
    careerRelevance: { 'Digital Forensics Specialist': 50, 'Hardware Security': 70, 'IoT Security': 65 },
    skills: ['Physics', 'Scientific Method', 'Laboratory Skills', 'Analytical Thinking']
  },
  {
    id: 'phys1062',
    code: 'PHYS 1062',
    name: 'Elementary Classical Physics II',
    credits: 4,
    description: 'Electricity, magnetism, optics, and modern physics with laboratory. Covers electric fields, circuits, magnetism, electromagnetic waves, and introduction to quantum physics. Relevant to understanding electronic systems and signals.',
    prerequisites: ['PHYS 1061'],
    category: 'lab-science',
    typicalSemester: 4,
    difficulty: 3,
    careerRelevance: { 'Hardware Security': 80, 'IoT Security': 75, 'Digital Forensics Specialist': 55 },
    skills: ['Electromagnetism', 'Circuits', 'Optics', 'Modern Physics']
  },

  // ========================================
  // CS ELECTIVES - CYBERSECURITY FOCUS (15-16 credits needed)
  // ========================================
  
  {
    id: 'cis3319',
    code: 'CIS 3319',
    name: 'Wireless Networks and Security',
    credits: 3,
    description: 'Wireless networking technologies and security challenges. Covers WiFi, Bluetooth, cellular networks, and IoT protocols. Examines vulnerabilities in wireless systems and countermeasures. Critical for modern security professionals.',
    prerequisites: ['CIS 3207'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 4,
    careerRelevance: { 'Cybersecurity Analyst': 95, 'Penetration Tester': 100, 'Network Security Engineer': 100, 'IoT Security Specialist': 100 },
    skills: ['Wireless Protocols', 'Network Security', 'WiFi Hacking', 'IoT Security']
  },
  {
    id: 'cis3441',
    code: 'CIS 3441',
    name: 'Software Security',
    credits: 3,
    description: 'Principles of secure software development. Topics include common vulnerabilities (buffer overflows, injection attacks, XSS), secure coding practices, static/dynamic analysis, and security testing. Essential for building secure applications.',
    prerequisites: ['CIS 2107', 'CIS 2168'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 4,
    careerRelevance: { 'Application Security Engineer': 100, 'Penetration Tester': 95, 'Security Developer': 100, 'Software Engineer': 85 },
    skills: ['Secure Coding', 'Vulnerability Analysis', 'Security Testing', 'Code Review']
  },
  {
    id: 'cis3605',
    code: 'CIS 3605',
    name: 'Introduction to Digital Forensics',
    credits: 3,
    description: 'Fundamentals of digital forensic investigation. Covers evidence acquisition, preservation, analysis, and reporting. Topics include file system forensics, memory forensics, network forensics, and legal considerations. Core course for forensics careers.',
    prerequisites: ['CIS 3207'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 4,
    careerRelevance: { 'Digital Forensics Specialist': 100, 'Incident Response Analyst': 100, 'Cybersecurity Analyst': 90, 'Law Enforcement Tech': 95 },
    skills: ['Evidence Collection', 'Forensic Analysis', 'Chain of Custody', 'Forensic Tools']
  },
  {
    id: 'cis4615',
    code: 'CIS 4615',
    name: 'Ethical Hacking and Intrusion Forensics',
    credits: 3,
    description: 'Advanced offensive security and incident investigation. Covers penetration testing methodologies, exploitation techniques, post-exploitation, and forensic analysis of compromised systems. Hands-on labs with real-world scenarios.',
    prerequisites: ['CIS 3207'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 5,
    careerRelevance: { 'Penetration Tester': 100, 'Red Team Operator': 100, 'Digital Forensics Specialist': 95, 'Security Consultant': 100 },
    skills: ['Penetration Testing', 'Exploitation', 'Incident Response', 'Forensic Investigation']
  },
  {
    id: 'cis4419',
    code: 'CIS 4419',
    name: 'Securing the Internet of Things',
    credits: 3,
    description: 'Security challenges and solutions for IoT ecosystems. Covers IoT architectures, embedded systems security, firmware analysis, protocol vulnerabilities, and secure IoT development. Growing field with critical infrastructure implications.',
    prerequisites: ['CIS 3207'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 4,
    careerRelevance: { 'IoT Security Specialist': 100, 'Embedded Security Engineer': 100, 'Penetration Tester': 90, 'Security Researcher': 95 },
    skills: ['IoT Security', 'Embedded Systems', 'Firmware Analysis', 'Protocol Security']
  },
  {
    id: 'cis4319',
    code: 'CIS 4319',
    name: 'Computer Networks and Communications',
    credits: 3,
    description: 'In-depth study of computer networking. Covers OSI/TCP-IP models, routing protocols, network programming, and network security fundamentals. Essential foundation for network security and forensic analysis.',
    prerequisites: ['CIS 3207'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 4,
    careerRelevance: { 'Network Security Engineer': 100, 'Cybersecurity Analyst': 95, 'Digital Forensics Specialist': 85, 'SOC Analyst': 90 },
    skills: ['TCP/IP', 'Network Protocols', 'Network Programming', 'Packet Analysis']
  },
  {
    id: 'cis3203',
    code: 'CIS 3203',
    name: 'Introduction to Artificial Intelligence',
    credits: 3,
    description: 'Fundamentals of artificial intelligence. Covers search algorithms, knowledge representation, machine learning basics, and neural networks. Applicable to security automation, threat detection, and intelligent systems.',
    prerequisites: ['CIS 2168'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 4,
    careerRelevance: { 'Security Data Scientist': 95, 'Threat Intelligence Analyst': 85, 'AI Security Researcher': 100, 'Software Engineer': 85 },
    skills: ['AI Fundamentals', 'Machine Learning', 'Search Algorithms', 'Neural Networks']
  },
  {
    id: 'cis3715',
    code: 'CIS 3715',
    name: 'Principles of Data Science',
    credits: 3,
    description: 'Data science fundamentals for extracting insights from data. Covers data preprocessing, visualization, statistical analysis, and machine learning. Critical for security analytics and forensic data analysis.',
    prerequisites: ['CIS 2168', 'CIS 2033'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Security Data Analyst': 100, 'Threat Intelligence Analyst': 95, 'Digital Forensics Specialist': 85, 'SOC Analyst': 80 },
    skills: ['Data Analysis', 'Python', 'Machine Learning', 'Data Visualization']
  },
  {
    id: 'cis4331',
    code: 'CIS 4331',
    name: 'Principles of Database Systems',
    credits: 3,
    description: 'Database design and implementation. Covers relational model, SQL, normalization, transaction management, and database security. Essential for understanding data storage, SQL injection, and database forensics.',
    prerequisites: ['CIS 2168'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Database Security': 100, 'Digital Forensics Specialist': 85, 'Application Security': 90, 'Software Engineer': 90 },
    skills: ['SQL', 'Database Design', 'Data Modeling', 'Database Security']
  },
  {
    id: 'cis3308',
    code: 'CIS 3308',
    name: 'Web Application Programming',
    credits: 3,
    description: 'Full-stack web development with security considerations. Covers HTML, CSS, JavaScript, server-side programming, and web security. Understanding web technologies is crucial for web application security testing.',
    prerequisites: ['CIS 1068'],
    category: 'elective',
    typicalSemester: 4,
    difficulty: 3,
    careerRelevance: { 'Web Security Analyst': 100, 'Application Security': 95, 'Penetration Tester': 90, 'Full Stack Developer': 100 },
    skills: ['HTML/CSS', 'JavaScript', 'Web Frameworks', 'Web Security']
  },
  {
    id: 'cis4345',
    code: 'CIS 4345',
    name: 'Introduction to Cloud Computing',
    credits: 3,
    description: 'Cloud computing architectures and services. Covers AWS, Azure, virtualization, containers, and cloud security. Understanding cloud infrastructure is essential for modern security professionals.',
    prerequisites: ['CIS 3207'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 3,
    careerRelevance: { 'Cloud Security Engineer': 100, 'DevSecOps Engineer': 95, 'Security Architect': 90, 'Cybersecurity Analyst': 85 },
    skills: ['AWS', 'Azure', 'Docker', 'Cloud Security', 'Infrastructure as Code']
  },
  {
    id: 'cis4526',
    code: 'CIS 4526',
    name: 'Foundations of Machine Learning',
    credits: 3,
    description: 'Machine learning theory and algorithms. Covers supervised/unsupervised learning, deep learning, and model evaluation. Applicable to threat detection, malware classification, and security automation.',
    prerequisites: ['CIS 3715'],
    category: 'elective',
    typicalSemester: 7,
    difficulty: 5,
    careerRelevance: { 'Security Data Scientist': 100, 'Threat Detection Engineer': 95, 'AI Security Researcher': 100, 'Malware Analyst': 85 },
    skills: ['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow/PyTorch']
  },
  {
    id: 'cis4523',
    code: 'CIS 4523',
    name: 'Knowledge Discovery and Data Mining',
    credits: 3,
    description: 'Advanced data mining techniques for discovering patterns in large datasets. Covers clustering, classification, anomaly detection, and text mining. Directly applicable to threat hunting and forensic analysis.',
    prerequisites: ['CIS 3715'],
    category: 'elective',
    typicalSemester: 7,
    difficulty: 4,
    careerRelevance: { 'Threat Hunter': 100, 'Security Data Analyst': 100, 'Digital Forensics Specialist': 90, 'Threat Intelligence Analyst': 95 },
    skills: ['Data Mining', 'Anomaly Detection', 'Pattern Recognition', 'Text Mining']
  },
  {
    id: 'cis4524',
    code: 'CIS 4524',
    name: 'Analysis and Modeling of Social and Information Networks',
    credits: 3,
    description: 'Analysis of social networks and information propagation. Covers network analysis, community detection, influence modeling, and misinformation spread. Critical for understanding social engineering at scale.',
    prerequisites: ['CIS 2168'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 4,
    careerRelevance: { 'Social Engineering Analyst': 100, 'Threat Intelligence Analyst': 95, 'OSINT Specialist': 100, 'Security Researcher': 90 },
    skills: ['Network Analysis', 'Social Network Theory', 'Graph Analysis', 'Information Warfare']
  },
  {
    id: 'cis3515',
    code: 'CIS 3515',
    name: 'Introduction to Mobile Application Development',
    credits: 3,
    description: 'Mobile app development for iOS and Android. Covers mobile UI design, data persistence, networking, and mobile security considerations. Understanding mobile platforms is essential for mobile security testing.',
    prerequisites: ['CIS 1068'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Mobile Security Analyst': 95, 'Application Security': 85, 'Penetration Tester': 80, 'Mobile Developer': 100 },
    skills: ['iOS Development', 'Android Development', 'Mobile Security', 'App Architecture']
  },
  {
    id: 'cis3603',
    code: 'CIS 3603',
    name: 'User Experience Design',
    credits: 3,
    description: 'Principles of human-computer interaction and UX design. Covers user research, prototyping, usability testing, and design thinking. Relevant to security awareness training and social engineering defense.',
    prerequisites: ['CIS 1068'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 2,
    careerRelevance: { 'Security Awareness Trainer': 85, 'Social Engineering Consultant': 80, 'UX Designer': 100, 'Product Security': 70 },
    skills: ['UX Design', 'User Research', 'Prototyping', 'Human-Computer Interaction']
  },
  {
    id: 'cis3211',
    code: 'CIS 3211',
    name: 'Automata, Computability, and Languages',
    credits: 3,
    description: 'Theory of computation covering finite automata, regular expressions, context-free grammars, Turing machines, and computability. Foundation for understanding parsers, compilers, and regex-based security tools.',
    prerequisites: ['CIS 2166'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 5,
    careerRelevance: { 'Security Researcher': 80, 'Malware Analyst': 75, 'Software Engineer': 70 },
    skills: ['Automata Theory', 'Formal Languages', 'Computability', 'Regular Expressions']
  },
  {
    id: 'cis3217',
    code: 'CIS 3217',
    name: 'Computer Architecture',
    credits: 3,
    description: 'Advanced computer organization and architecture. Covers processor design, pipelining, memory hierarchy, multiprocessors, and hardware security. Essential for understanding hardware-level vulnerabilities.',
    prerequisites: ['CIS 2107'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 4,
    careerRelevance: { 'Hardware Security Engineer': 100, 'Reverse Engineer': 95, 'Malware Analyst': 90, 'Systems Security': 85 },
    skills: ['CPU Architecture', 'Hardware Design', 'Performance Optimization', 'Hardware Security']
  },

  // ========================================
  // GEN ED FOUNDATION COURSES (14 credits)
  // ========================================
  
  {
    id: 'gw-eng0802',
    code: 'ENG 0802',
    name: 'Analytical Reading and Writing',
    credits: 4,
    description: 'Development of critical reading and analytical writing skills. Covers argument construction, evidence evaluation, and academic discourse. Essential communication skills for security professionals writing reports and documentation.',
    category: 'gen-ed',
    genEdAttribute: 'GW',
    typicalSemester: 1,
    difficulty: 2,
    careerRelevance: { 'All Careers': 80, 'Security Consultant': 90, 'Threat Intelligence Analyst': 85 },
    skills: ['Academic Writing', 'Critical Reading', 'Argumentation', 'Research']
  },
  {
    id: 'gq-math1022',
    code: 'MATH 1022',
    name: 'Precalculus',
    credits: 4,
    description: 'Preparation for calculus covering functions, trigonometry, and analytic geometry. Builds mathematical foundation for technical courses.',
    category: 'gen-ed',
    genEdAttribute: 'GQ',
    typicalSemester: 1,
    difficulty: 3,
    careerRelevance: { 'All Technical Careers': 70 },
    skills: ['Algebra', 'Trigonometry', 'Functions', 'Mathematical Reasoning']
  },
  {
    id: 'gy-mosaic1',
    code: 'MOSAIC 0851',
    name: 'Intellectual Heritage I: The Good Life',
    credits: 3,
    description: 'Exploration of foundational texts addressing questions of human existence, ethics, and the good life. Examines diverse philosophical and cultural perspectives. Develops critical thinking applicable to ethical hacking and security ethics.',
    category: 'gen-ed',
    genEdAttribute: 'GY',
    typicalSemester: 2,
    difficulty: 2,
    careerRelevance: { 'Security Ethics': 85, 'All Careers': 60 },
    skills: ['Critical Thinking', 'Ethics', 'Philosophical Analysis', 'Cultural Awareness']
  },
  {
    id: 'gz-mosaic2',
    code: 'MOSAIC 0852',
    name: 'Intellectual Heritage II: The Common Good',
    credits: 3,
    description: 'Continuation examining texts on social organization, justice, and collective responsibility. Relevant to understanding cybersecurity policy, digital rights, and societal impact of technology.',
    prerequisites: ['MOSAIC 0851'],
    category: 'gen-ed',
    genEdAttribute: 'GZ',
    typicalSemester: 3,
    difficulty: 2,
    careerRelevance: { 'Security Policy': 85, 'Privacy Specialist': 80, 'All Careers': 60 },
    skills: ['Social Analysis', 'Ethics', 'Policy Understanding', 'Critical Discourse']
  },

  // ========================================
  // GEN ED BREADTH COURSES (21-22 credits)
  // ========================================
  
  // GA - Arts (3-4 credits)
  {
    id: 'ga-art1001',
    code: 'ART 1001',
    name: 'Art and Visual Culture',
    credits: 3,
    description: 'Introduction to visual arts and culture. Develops visual literacy and critical analysis of images. Relevant to social engineering awareness and recognizing visual manipulation techniques.',
    category: 'gen-ed',
    genEdAttribute: 'GA',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'Social Engineering Analyst': 65, 'Security Awareness': 60, 'UX Security': 55 },
    skills: ['Visual Analysis', 'Critical Thinking', 'Cultural Literacy']
  },

  // GB - Human Behavior (3 credits)
  {
    id: 'gb-psy1001',
    code: 'PSY 1001',
    name: 'Introduction to Psychology',
    credits: 3,
    description: 'Scientific study of behavior and mental processes. Covers perception, cognition, motivation, emotion, and social behavior. Critical foundation for understanding social engineering and human vulnerabilities.',
    category: 'gen-ed',
    genEdAttribute: 'GB',
    typicalSemester: 2,
    difficulty: 2,
    careerRelevance: { 'Social Engineering Consultant': 100, 'Security Awareness Trainer': 95, 'Penetration Tester': 80, 'Threat Intelligence': 75 },
    skills: ['Human Behavior', 'Cognitive Psychology', 'Social Psychology', 'Research Methods']
  },

  // GD - Race & Diversity (3 credits)
  {
    id: 'gd-soc2101',
    code: 'SOC 2101',
    name: 'Race and Diversity in Society',
    credits: 3,
    description: 'Analysis of race, ethnicity, and diversity in American society. Examines inequality, discrimination, and social movements. Develops cultural competence for diverse security teams and global operations.',
    category: 'gen-ed',
    genEdAttribute: 'GD',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'Security Leadership': 70, 'Global Security': 75, 'All Careers': 65 },
    skills: ['Cultural Competence', 'Social Analysis', 'Diversity Awareness']
  },

  // GG - World Society (3 credits)
  {
    id: 'gg-pols1101',
    code: 'POLS 1101',
    name: 'Introduction to International Relations',
    credits: 3,
    description: 'Analysis of international political systems, conflict, and cooperation. Covers geopolitics, international organizations, and global challenges. Relevant to understanding nation-state cyber threats and global security landscape.',
    category: 'gen-ed',
    genEdAttribute: 'GG',
    typicalSemester: 5,
    difficulty: 2,
    careerRelevance: { 'Threat Intelligence Analyst': 95, 'Security Policy Analyst': 90, 'Global Security': 85 },
    skills: ['Geopolitics', 'International Relations', 'Global Awareness', 'Policy Analysis']
  },

  // GS - Science & Technology (6 credits - 2 courses)
  {
    id: 'gs-biol1012',
    code: 'BIOL 1012',
    name: 'Life Science for Educators',
    credits: 3,
    description: 'Introduction to biological concepts for non-majors. Covers cell biology, genetics, evolution, and ecology. Useful background for biometric security and understanding biological aspects of forensics.',
    category: 'gen-ed',
    genEdAttribute: 'GS',
    typicalSemester: 3,
    difficulty: 2,
    careerRelevance: { 'Biometric Security': 70, 'Digital Forensics': 55 },
    skills: ['Scientific Literacy', 'Biological Concepts', 'Critical Thinking']
  },
  {
    id: 'gs-envs1001',
    code: 'ENVS 1001',
    name: 'Environment and Society',
    credits: 3,
    description: 'Examination of environmental issues and human impact. Covers sustainability, resource management, and environmental policy. Relevant to understanding infrastructure security and environmental forensics.',
    category: 'gen-ed',
    genEdAttribute: 'GS',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'Infrastructure Security': 60, 'Policy Analysis': 55 },
    skills: ['Environmental Awareness', 'Systems Thinking', 'Policy Understanding']
  },

  // GU - U.S. Society (3 credits)
  {
    id: 'gu-cj1001',
    code: 'CJ 1001',
    name: 'Introduction to Criminal Justice',
    credits: 3,
    description: 'Overview of the American criminal justice system including law enforcement, courts, and corrections. Covers cybercrime legislation and digital evidence procedures. Essential for digital forensics career path.',
    category: 'gen-ed',
    genEdAttribute: 'GU',
    typicalSemester: 3,
    difficulty: 2,
    careerRelevance: { 'Digital Forensics Specialist': 100, 'Law Enforcement Tech': 100, 'Incident Response': 85, 'Security Consultant': 75 },
    skills: ['Legal Knowledge', 'Criminal Justice System', 'Evidence Procedures', 'Cybercrime Law']
  },

  // ========================================
  // INTERDISCIPLINARY COURSES FOR CYBERSECURITY/SOCIAL ENGINEERING
  // ========================================

  // Psychology - Critical for Social Engineering
  {
    id: 'psy2301',
    code: 'PSY 2301',
    name: 'Social Psychology',
    credits: 3,
    description: 'Study of how people think about, influence, and relate to one another. Covers conformity, persuasion, group dynamics, and social influence. Core knowledge for understanding and defending against social engineering attacks.',
    prerequisites: ['PSY 1001'],
    category: 'elective',
    typicalSemester: 4,
    difficulty: 3,
    careerRelevance: { 'Social Engineering Consultant': 100, 'Security Awareness Trainer': 100, 'Penetration Tester': 85, 'Red Team Operator': 90 },
    skills: ['Social Influence', 'Persuasion Techniques', 'Group Dynamics', 'Behavioral Analysis']
  },
  {
    id: 'psy2401',
    code: 'PSY 2401',
    name: 'Cognitive Psychology',
    credits: 3,
    description: 'Study of mental processes including attention, memory, perception, and decision-making. Understanding cognitive biases and heuristics is crucial for exploiting and defending against psychological manipulation.',
    prerequisites: ['PSY 1001'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Social Engineering Consultant': 100, 'Security Awareness Trainer': 95, 'UX Security': 85, 'Behavioral Security': 100 },
    skills: ['Cognitive Biases', 'Decision Making', 'Attention', 'Memory Systems']
  },
  {
    id: 'psy3361',
    code: 'PSY 3361',
    name: 'Psychology of Persuasion and Influence',
    credits: 3,
    description: 'In-depth analysis of persuasion principles and influence tactics. Covers Cialdini\'s principles, propaganda techniques, and resistance strategies. Directly applicable to social engineering offense and defense.',
    prerequisites: ['PSY 2301'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 3,
    careerRelevance: { 'Social Engineering Consultant': 100, 'Red Team Operator': 100, 'Security Awareness Trainer': 100, 'Penetration Tester': 90 },
    skills: ['Influence Principles', 'Persuasion Tactics', 'Manipulation Detection', 'Resistance Strategies']
  },
  {
    id: 'psy3501',
    code: 'PSY 3501',
    name: 'Industrial-Organizational Psychology',
    credits: 3,
    description: 'Application of psychology to workplace settings. Covers employee behavior, motivation, leadership, and organizational culture. Relevant to insider threat detection and security culture development.',
    prerequisites: ['PSY 1001'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 3,
    careerRelevance: { 'Insider Threat Analyst': 100, 'Security Culture Consultant': 95, 'Security Awareness Trainer': 90, 'HR Security': 85 },
    skills: ['Organizational Behavior', 'Employee Psychology', 'Insider Threats', 'Security Culture']
  },

  // Criminology - Digital Forensics Context
  {
    id: 'cj2101',
    code: 'CJ 2101',
    name: 'Criminology',
    credits: 3,
    description: 'Scientific study of crime, criminals, and criminal behavior. Covers theories of crime, victimology, and crime prevention. Essential context for understanding cybercriminal motivations and behavior.',
    prerequisites: ['CJ 1001'],
    category: 'elective',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'Digital Forensics Specialist': 95, 'Threat Intelligence Analyst': 90, 'Cybercrime Investigator': 100, 'Incident Response': 80 },
    skills: ['Criminal Behavior', 'Crime Analysis', 'Victimology', 'Prevention Strategies']
  },
  {
    id: 'cj3201',
    code: 'CJ 3201',
    name: 'Cybercrime and Digital Evidence',
    credits: 3,
    description: 'Examination of cybercrime types, investigation methods, and digital evidence handling. Covers hacking, fraud, identity theft, and cyberterrorism from legal and investigative perspectives.',
    prerequisites: ['CJ 1001'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Digital Forensics Specialist': 100, 'Cybercrime Investigator': 100, 'Incident Response': 95, 'Law Enforcement Tech': 100 },
    skills: ['Cybercrime Investigation', 'Digital Evidence', 'Legal Procedures', 'Case Building']
  },
  {
    id: 'cj3301',
    code: 'CJ 3301',
    name: 'Criminal Investigation',
    credits: 3,
    description: 'Principles and techniques of criminal investigation. Covers evidence collection, interviewing, case management, and investigative procedures. Applicable to incident response and forensic investigation.',
    prerequisites: ['CJ 1001'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Digital Forensics Specialist': 95, 'Incident Response Analyst': 90, 'Cybercrime Investigator': 100, 'Security Consultant': 75 },
    skills: ['Investigation Techniques', 'Evidence Collection', 'Interviewing', 'Case Management']
  },

  // Communication - Social Engineering Skills
  {
    id: 'smc1001',
    code: 'SMC 1001',
    name: 'Introduction to Strategic Communication',
    credits: 3,
    description: 'Fundamentals of strategic communication including message design, audience analysis, and media selection. Applicable to security awareness campaigns and understanding manipulation tactics.',
    category: 'elective',
    typicalSemester: 3,
    difficulty: 2,
    careerRelevance: { 'Security Awareness Trainer': 95, 'Social Engineering Consultant': 90, 'Security Communications': 100 },
    skills: ['Strategic Messaging', 'Audience Analysis', 'Communication Planning']
  },
  {
    id: 'smc2101',
    code: 'SMC 2101',
    name: 'Interpersonal Communication',
    credits: 3,
    description: 'Study of face-to-face communication processes. Covers verbal/nonverbal communication, relationship dynamics, and conflict resolution. Essential for social engineering and building rapport during pretexting.',
    prerequisites: ['SMC 1001'],
    category: 'elective',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'Social Engineering Consultant': 100, 'Penetration Tester': 85, 'Security Interviewer': 95, 'Red Team Operator': 90 },
    skills: ['Verbal Communication', 'Nonverbal Cues', 'Rapport Building', 'Active Listening']
  },
  {
    id: 'smc3201',
    code: 'SMC 3201',
    name: 'Deception and Communication',
    credits: 3,
    description: 'Analysis of deception in human communication. Covers lie detection, deceptive communication patterns, and truth assessment techniques. Directly applicable to social engineering and insider threat detection.',
    prerequisites: ['SMC 2101'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 3,
    careerRelevance: { 'Social Engineering Consultant': 100, 'Insider Threat Analyst': 100, 'Security Interviewer': 100, 'Red Team Operator': 95 },
    skills: ['Deception Detection', 'Behavioral Analysis', 'Truth Assessment', 'Interview Techniques']
  },

  // Sociology - Understanding Social Systems
  {
    id: 'soc1001',
    code: 'SOC 1001',
    name: 'Introduction to Sociology',
    credits: 3,
    description: 'Study of human society, social institutions, and group behavior. Covers social structures, culture, and collective behavior. Foundation for understanding social dynamics exploited in social engineering.',
    category: 'elective',
    typicalSemester: 2,
    difficulty: 2,
    careerRelevance: { 'Social Engineering Consultant': 85, 'Security Awareness Trainer': 80, 'Threat Intelligence': 70 },
    skills: ['Social Analysis', 'Cultural Understanding', 'Group Dynamics']
  },
  {
    id: 'soc3151',
    code: 'SOC 3151',
    name: 'Sociology of Deviance',
    credits: 3,
    description: 'Study of deviant behavior and social control. Examines rule-breaking, labeling, and social reactions to deviance. Provides context for understanding hacker culture and cybercriminal subcultures.',
    prerequisites: ['SOC 1001'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Threat Intelligence Analyst': 90, 'Cybercrime Investigator': 85, 'Security Researcher': 80 },
    skills: ['Deviance Theory', 'Subculture Analysis', 'Social Control']
  },
  {
    id: 'soc3301',
    code: 'SOC 3301',
    name: 'Technology and Society',
    credits: 3,
    description: 'Examination of technology\'s impact on social life. Covers digital divide, surveillance, privacy, and technological change. Relevant to understanding social implications of cybersecurity.',
    prerequisites: ['SOC 1001'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 2,
    careerRelevance: { 'Privacy Specialist': 90, 'Security Policy Analyst': 85, 'Security Ethics': 80 },
    skills: ['Technology Impact', 'Privacy Issues', 'Digital Society', 'Ethical Analysis']
  },

  // Anthropology - Cultural Context
  {
    id: 'anth1001',
    code: 'ANTH 1001',
    name: 'Introduction to Cultural Anthropology',
    credits: 3,
    description: 'Study of human cultures and social organization. Covers cultural diversity, social practices, and ethnographic methods. Useful for understanding cross-cultural communication in global security operations.',
    category: 'elective',
    typicalSemester: 3,
    difficulty: 2,
    careerRelevance: { 'Global Security': 80, 'International Operations': 85, 'Cultural Intelligence': 90 },
    skills: ['Cultural Analysis', 'Cross-Cultural Communication', 'Ethnographic Methods']
  },

  // Philosophy - Ethics and Logic
  {
    id: 'phil1003',
    code: 'PHIL 1003',
    name: 'Introduction to Logic',
    credits: 3,
    description: 'Formal and informal logic including argument analysis, fallacy detection, and symbolic logic. Develops critical reasoning skills essential for security analysis and detecting deceptive arguments.',
    category: 'elective',
    typicalSemester: 2,
    difficulty: 3,
    careerRelevance: { 'Security Analyst': 80, 'Social Engineering Defense': 85, 'All Technical Careers': 75 },
    skills: ['Logical Reasoning', 'Fallacy Detection', 'Argument Analysis', 'Critical Thinking']
  },
  {
    id: 'phil2101',
    code: 'PHIL 2101',
    name: 'Ethics',
    credits: 3,
    description: 'Examination of ethical theories and moral reasoning. Covers major ethical frameworks and applied ethics. Essential for ethical hacking, responsible disclosure, and security decision-making.',
    category: 'elective',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'Ethical Hacker': 95, 'Security Consultant': 85, 'Security Policy': 90, 'All Security Careers': 80 },
    skills: ['Ethical Reasoning', 'Moral Philosophy', 'Professional Ethics', 'Decision Making']
  },
  {
    id: 'phil3101',
    code: 'PHIL 3101',
    name: 'Ethics of Technology',
    credits: 3,
    description: 'Ethical issues in technology including privacy, surveillance, AI ethics, and cybersecurity ethics. Examines moral responsibilities of technology professionals and societal impacts.',
    prerequisites: ['PHIL 2101'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 3,
    careerRelevance: { 'Security Ethics': 100, 'Privacy Specialist': 95, 'AI Security': 90, 'Security Policy': 95 },
    skills: ['Tech Ethics', 'Privacy Ethics', 'Professional Responsibility', 'Policy Analysis']
  },

  // Business/Management - Security Leadership
  {
    id: 'mgmt1001',
    code: 'MGMT 1001',
    name: 'Introduction to Business',
    credits: 3,
    description: 'Overview of business fundamentals including management, marketing, finance, and operations. Provides business context for security professionals working in corporate environments.',
    category: 'elective',
    typicalSemester: 3,
    difficulty: 2,
    careerRelevance: { 'Security Manager': 85, 'CISO': 90, 'Security Consultant': 80, 'All Business Roles': 85 },
    skills: ['Business Fundamentals', 'Organizational Understanding', 'Professional Context']
  },
  {
    id: 'risk2001',
    code: 'RISK 2001',
    name: 'Introduction to Risk Management',
    credits: 3,
    description: 'Fundamentals of risk identification, assessment, and mitigation. Covers risk frameworks, quantitative analysis, and risk communication. Directly applicable to cybersecurity risk management.',
    category: 'elective',
    typicalSemester: 5,
    difficulty: 3,
    careerRelevance: { 'Security Risk Analyst': 100, 'CISO': 95, 'Security Consultant': 95, 'GRC Analyst': 100 },
    skills: ['Risk Assessment', 'Risk Frameworks', 'Quantitative Analysis', 'Risk Communication']
  },

  // Biology - Forensic Science Context
  {
    id: 'biol1111',
    code: 'BIOL 1111',
    name: 'Introduction to Organismal Biology',
    credits: 4,
    description: 'Study of living organisms and their interactions. Covers anatomy, physiology, ecology, and evolution. Lab science option that provides foundation for understanding biological aspects of forensic science.',
    category: 'lab-science',
    typicalSemester: 3,
    difficulty: 3,
    careerRelevance: { 'Forensic Science': 75, 'Biometric Security': 70 },
    skills: ['Biological Systems', 'Scientific Method', 'Laboratory Techniques']
  },
  {
    id: 'biol2112',
    code: 'BIOL 2112',
    name: 'Introduction to Cellular and Molecular Biology',
    credits: 4,
    description: 'Study of cellular structure, function, and molecular processes. Covers genetics, cell biology, and biochemistry. Relevant to DNA forensics and biometric authentication technologies.',
    prerequisites: ['BIOL 1111'],
    category: 'lab-science',
    typicalSemester: 4,
    difficulty: 4,
    careerRelevance: { 'Forensic Science': 80, 'Biometric Security': 75, 'DNA Analysis': 90 },
    skills: ['Cell Biology', 'Genetics', 'Molecular Biology', 'Lab Techniques']
  },

  // Statistics - Data Analysis
  {
    id: 'stat2103',
    code: 'STAT 2103',
    name: 'Statistical Methods',
    credits: 3,
    description: 'Introduction to statistical reasoning and methods. Covers descriptive statistics, probability, inference, and regression. Essential for security analytics, threat detection, and forensic analysis.',
    category: 'elective',
    typicalSemester: 4,
    difficulty: 3,
    careerRelevance: { 'Security Data Analyst': 100, 'Threat Intelligence': 90, 'Digital Forensics': 85, 'Security Researcher': 90 },
    skills: ['Statistics', 'Data Analysis', 'Probability', 'Statistical Inference']
  },

  // Technical Writing
  {
    id: 'eng2101',
    code: 'ENG 2101',
    name: 'Technical Writing',
    credits: 3,
    description: 'Development of technical communication skills. Covers documentation, reports, proposals, and technical presentations. Essential for writing security reports, incident documentation, and forensic reports.',
    prerequisites: ['ENG 0802'],
    category: 'elective',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'All Security Careers': 90, 'Security Consultant': 95, 'Digital Forensics': 100, 'Incident Response': 95 },
    skills: ['Technical Writing', 'Documentation', 'Report Writing', 'Professional Communication']
  },

  // Law - Legal Context
  {
    id: 'lgls2001',
    code: 'LGLS 2001',
    name: 'Introduction to Law',
    credits: 3,
    description: 'Overview of the American legal system including constitutional, criminal, civil, and administrative law. Foundation for understanding cybersecurity regulations and legal aspects of digital forensics.',
    category: 'elective',
    typicalSemester: 4,
    difficulty: 2,
    careerRelevance: { 'Digital Forensics Specialist': 95, 'Security Compliance': 100, 'GRC Analyst': 95, 'Security Consultant': 85 },
    skills: ['Legal Knowledge', 'Regulatory Understanding', 'Compliance', 'Legal Analysis']
  },
  {
    id: 'lgls3101',
    code: 'LGLS 3101',
    name: 'Cyberlaw and Policy',
    credits: 3,
    description: 'Legal issues in cyberspace including privacy law, intellectual property, cybercrime legislation, and internet governance. Essential for security compliance and understanding legal boundaries.',
    prerequisites: ['LGLS 2001'],
    category: 'elective',
    typicalSemester: 6,
    difficulty: 3,
    careerRelevance: { 'Security Compliance': 100, 'Privacy Specialist': 100, 'GRC Analyst': 100, 'Digital Forensics': 95 },
    skills: ['Cyber Law', 'Privacy Regulations', 'Compliance', 'Policy Analysis']
  },

  // Neuroscience - Understanding Human Cognition
  {
    id: 'nsci2001',
    code: 'NSCI 2001',
    name: 'Introduction to Neuroscience',
    credits: 3,
    description: 'Study of the nervous system and brain function. Covers neural processes, perception, and behavior. Provides biological basis for understanding human cognition and decision-making exploited in social engineering.',
    prerequisites: ['PSY 1001'],
    category: 'elective',
    typicalSemester: 5,
    difficulty: 4,
    careerRelevance: { 'Behavioral Security': 85, 'Social Engineering Consultant': 80, 'Security Researcher': 75 },
    skills: ['Neuroscience', 'Brain Function', 'Cognitive Processes', 'Behavioral Science']
  },
];

export const CAREER_PATHS = [
  { id: 'cybersec', name: 'Cybersecurity Analyst', description: 'Protect organizations from cyber threats and monitor security systems' },
  { id: 'forensics', name: 'Digital Forensics Specialist', description: 'Investigate cybercrimes and analyze digital evidence' },
  { id: 'pentest', name: 'Penetration Tester', description: 'Ethically hack systems to identify vulnerabilities' },
  { id: 'soceng', name: 'Social Engineering Consultant', description: 'Test human vulnerabilities and develop awareness programs' },
  { id: 'incident', name: 'Incident Response Analyst', description: 'Respond to security breaches and coordinate remediation' },
  { id: 'threat', name: 'Threat Intelligence Analyst', description: 'Analyze threat actors and provide strategic intelligence' },
  { id: 'malware', name: 'Malware Analyst', description: 'Reverse engineer and analyze malicious software' },
  { id: 'swe', name: 'Software Engineer', description: 'Build scalable applications and systems' },
  { id: 'seceng', name: 'Security Engineer', description: 'Design and implement security architectures' },
  { id: 'grc', name: 'GRC Analyst', description: 'Manage governance, risk, and compliance programs' },
];

export const DEGREE_REQUIREMENTS: DegreeRequirement[] = [
  { 
    category: 'CIS Core', 
    requiredCredits: 47, 
    description: 'Required Computer Science courses for the major',
    courses: ['CIS 1001', 'CIS 1051', 'CIS 1068', 'CIS 1166', 'CIS 2033', 'CIS 2107', 'CIS 2166', 'CIS 2168', 'CIS 3207', 'CIS 3223', 'CIS 3296', 'CIS 4398']
  },
  { 
    category: 'Mathematics', 
    requiredCredits: 8, 
    description: 'Required Calculus sequence',
    courses: ['MATH 1041', 'MATH 1042']
  },
  { 
    category: 'Lab Science', 
    requiredCredits: 8, 
    description: 'Two-course laboratory science sequence',
    courses: ['PHYS 1061', 'PHYS 1062']
  },
  { 
    category: 'CS Electives', 
    requiredCredits: 16, 
    description: 'Computer Science elective courses',
    courses: []
  },
  { 
    category: 'Gen Ed Foundation', 
    requiredCredits: 14, 
    description: 'Analytical Reading & Writing, Quantitative Literacy, Intellectual Heritage I & II',
    courses: ['ENG 0802', 'MATH 1022', 'MOSAIC 0851', 'MOSAIC 0852']
  },
  { 
    category: 'Gen Ed Breadth', 
    requiredCredits: 22, 
    description: 'Arts, Human Behavior, Race & Diversity, World Society, Science & Technology (x2), U.S. Society',
    courses: []
  },
];
