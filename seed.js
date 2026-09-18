const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Job = require('./models/Job');
const Skill = require('./models/Skill');
const Course = require('./models/Course');
const Resume = require('./models/Resume');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const SavedJob = require('./models/SavedJob');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_careerhub');
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error('Database connection error during seeding:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Skill.deleteMany();
    await Course.deleteMany();
    await Resume.deleteMany();
    await Application.deleteMany();
    await Notification.deleteMany();
    await SavedJob.deleteMany();

    console.log('Cleared existing collection data...');

    // 1. Create Admin & Student Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@smartcareerhub.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 800-555-0199',
      location: 'San Francisco, CA',
      education: 'Master of Science in Computer Science',
      college: 'Stanford University',
      bio: 'Smart CareerHub Platform Administrator and Talent Lead.'
    });

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'student@smartcareerhub.com',
      password: 'student123',
      role: 'student',
      phone: '+1 415-555-0142',
      location: 'Seattle, WA',
      education: 'B.Tech in Computer Science',
      college: 'Washington State University',
      degree: 'Bachelor of Technology',
      gradYear: '2025',
      careerGoal: 'Full Stack Developer',
      skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'HTML', 'CSS', 'Git', 'Express'],
      bio: 'Passionate computer science graduate seeking full-stack web developer opportunities.'
    });

    console.log('Users seeded: Admin & Student created.');

    // 2. Create Skills Taxonomy Catalog
    const skillsData = [
      { name: 'React', category: 'Frontend', description: 'Popular declarative UI library for building single-page applications.', level: 'Advanced', importance: 9 },
      { name: 'JavaScript', category: 'Frontend', description: 'Core programming language of the modern web platform.', level: 'Advanced', importance: 10 },
      { name: 'Node.js', category: 'Backend', description: 'Asynchronous event-driven JavaScript runtime engine.', level: 'Intermediate', importance: 9 },
      { name: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database system.', level: 'Intermediate', importance: 8 },
      { name: 'Express', category: 'Backend', description: 'Fast, unopinionated web framework for Node.js.', level: 'Intermediate', importance: 8 },
      { name: 'HTML5', category: 'Frontend', description: 'Standard markup language for web document structure.', level: 'Advanced', importance: 7 },
      { name: 'CSS3', category: 'Frontend', description: 'Style sheet language used for visual web layout.', level: 'Advanced', importance: 7 },
      { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework for rapid UI development.', level: 'Intermediate', importance: 8 },
      { name: 'TypeScript', category: 'Frontend', description: 'Strongly typed programming language built on JavaScript.', level: 'Intermediate', importance: 9 },
      { name: 'Python', category: 'Backend', description: 'High-level programming language widely used in AI/ML & Web APIs.', level: 'Intermediate', importance: 9 },
      { name: 'FastAPI', category: 'Backend', description: 'Modern, high-performance web framework for Python 3.8+ APIs.', level: 'Intermediate', importance: 8 },
      { name: 'Docker', category: 'Cloud & DevOps', description: 'Platform for developing, shipping, and running containerized apps.', level: 'Beginner', importance: 9 },
      { name: 'AWS', category: 'Cloud & DevOps', description: 'Amazon Web Services cloud computing suite.', level: 'Beginner', importance: 9 },
      { name: 'Git', category: 'Tools & Workflow', description: 'Distributed version control system for tracking source code.', level: 'Advanced', importance: 10 },
      { name: 'PostgreSQL', category: 'Database', description: 'Powerful open-source object-relational database system.', level: 'Intermediate', importance: 8 },
      { name: 'GraphQL', category: 'Backend', description: 'Query language for APIs and runtime for fulfilling queries.', level: 'Beginner', importance: 7 }
    ];
    await Skill.insertMany(skillsData);
    console.log('Skills seeded.');

    // 3. Create Learning Courses Catalog
    const coursesData = [
      {
        title: 'Mastering Docker & Containerization',
        skill: 'Docker',
        level: 'Beginner',
        description: 'Learn container fundamentals, Dockerfile creation, multi-container orchestration with Docker Compose, and CI/CD integration.',
        duration: '3 Weeks',
        resourceUrl: 'https://docker.com/getting-started',
        category: 'DevOps & Cloud'
      },
      {
        title: 'AWS Cloud Practitioner & Core Services',
        skill: 'AWS',
        level: 'Beginner',
        description: 'Comprehensive introduction to EC2, S3, RDS, Lambda, VPC networking, and cloud architecture best practices.',
        duration: '4 Weeks',
        resourceUrl: 'https://aws.amazon.com/training',
        category: 'DevOps & Cloud'
      },
      {
        title: 'Full-Stack TypeScript Developer Certification',
        skill: 'TypeScript',
        level: 'Intermediate',
        description: 'Master generics, interfaces, strict type guards, decorated backend APIs, and React TypeScript integration.',
        duration: '4 Weeks',
        resourceUrl: 'https://www.typescriptlang.org/docs',
        category: 'Web Development'
      },
      {
        title: 'Microservices & Redis Caching with Node.js',
        skill: 'Node.js',
        level: 'Intermediate',
        description: 'Build scalable distributed Node.js microservices with messaging queues, Redis memory cache, and JWT security.',
        duration: '3 Weeks',
        resourceUrl: 'https://nodejs.org/en/docs',
        category: 'Backend Architecture'
      },
      {
        title: 'Python for AI & NLP Data Engineering',
        skill: 'Python',
        level: 'Intermediate',
        description: 'Learn text mining, TF-IDF vectorization, RegEx extraction, and FastAPI microservice building.',
        duration: '5 Weeks',
        resourceUrl: 'https://fastapi.tiangolo.com',
        category: 'Data & AI'
      }
    ];
    await Course.insertMany(coursesData);
    console.log('Courses seeded.');

    // 4. Create Jobs Catalog
    const jobsData = [
      {
        title: 'MERN Stack Developer',
        company: 'CloudScale Technologies',
        location: 'Remote (US/Canada)',
        type: 'Full-Time',
        salary: '$85,000 - $110,000 / year',
        description: 'We are seeking a high-energy MERN Stack Developer to engineer scalable customer dashboards and microservice backend APIs. You will collaborate with product designers and cloud engineers to launch web services used by over 500k active users.',
        responsibilities: [
          'Architect and build responsive frontend user interfaces in React.js and Tailwind CSS',
          'Design RESTful microservices and MongoDB database schemas',
          'Optimize web performance, client caching, and API latency',
          'Write automated unit and integration tests using Jest'
        ],
        requiredSkills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Git'],
        preferredSkills: ['TypeScript', 'Docker', 'AWS', 'Tailwind CSS'],
        experience: '0-2 Years',
        category: 'Software Engineering',
        createdBy: adminUser._id
      },
      {
        title: 'Frontend React Engineer',
        company: 'Apex Digital SaaS',
        location: 'New York, NY (Hybrid)',
        type: 'Full-Time',
        salary: '$90,000 - $115,000 / year',
        description: 'Apex Digital is looking for a passionate Frontend React Engineer to join our core UI team. You will lead client-side feature development, build component libraries, and deliver sleek user experiences.',
        responsibilities: [
          'Build pixel-perfect UI components from Figma mockups',
          'Manage global application state using Zustand/Redux',
          'Integrate REST and WebSocket APIs'
        ],
        requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git'],
        preferredSkills: ['TypeScript', 'Next.js', 'Redux'],
        experience: '1-3 Years',
        category: 'Frontend Engineering',
        createdBy: adminUser._id
      },
      {
        title: 'Backend Node.js Developer',
        company: 'DataStream Systems',
        location: 'Austin, TX (On-site)',
        type: 'Full-Time',
        salary: '$95,000 - $120,000 / year',
        description: 'DataStream Systems is seeking a skilled Backend Developer specializing in Node.js, Express, and MongoDB. You will maintain high-throughput data processing pipelines and secure identity authentication endpoints.',
        responsibilities: [
          'Design and maintain scalable Express REST APIs',
          'Optimize MongoDB indexes and query execution plans',
          'Implement secure JWT authorization & role control'
        ],
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'Git'],
        preferredSkills: ['Docker', 'AWS', 'Redis', 'TypeScript'],
        experience: '1-3 Years',
        category: 'Backend Engineering',
        createdBy: adminUser._id
      },
      {
        title: 'Python AI & NLP Engineer',
        company: 'NeuroAI Labs',
        location: 'San Francisco, CA (Hybrid)',
        type: 'Full-Time',
        salary: '$105,000 - $135,000 / year',
        description: 'Join NeuroAI Labs to build intelligent text processing, resume analysis, and recommendation algorithms using Python, FastAPI, and NLP techniques.',
        responsibilities: [
          'Develop FastAPI microservices for document text extraction and parsing',
          'Implement skill match vectors and TF-IDF similarity algorithms',
          'Deploy Python AI containers to cloud infrastructure'
        ],
        requiredSkills: ['Python', 'FastAPI', 'Git', 'JavaScript'],
        preferredSkills: ['Docker', 'AWS', 'MongoDB', 'React'],
        experience: '0-2 Years',
        category: 'AI & Data Science',
        createdBy: adminUser._id
      },
      {
        title: 'Junior DevOps & Cloud Associate',
        company: 'Vanguard Cyber Cloud',
        location: 'Remote',
        type: 'Full-Time',
        salary: '$75,000 - $95,000 / year',
        description: 'Exciting entry-level opportunity for a passionate cloud enthusiast to maintain Docker environments, CI/CD pipelines, and AWS cloud instances.',
        responsibilities: [
          'Maintain GitHub Actions deployment workflows',
          'Monitor Docker container cluster health',
          'Automate routine infrastructure scripting'
        ],
        requiredSkills: ['Docker', 'AWS', 'Git', 'Node.js'],
        preferredSkills: ['Linux', 'TypeScript', 'Python'],
        experience: '0-1 Years',
        category: 'DevOps & Infrastructure',
        createdBy: adminUser._id
      }
    ];

    const insertedJobs = await Job.insertMany(jobsData);
    console.log('Jobs seeded.');

    // 5. Create Demo Resume for Student
    const sampleResume = await Resume.create({
      userId: studentUser._id,
      fileName: 'Alex_Johnson_Resume.pdf',
      fileUrl: '/uploads/sample-resume.pdf',
      extractedText: 'Alex Johnson - Full Stack Web Developer. Proficient in React, JavaScript, Node.js, Express, MongoDB, HTML, CSS, Git, REST APIs. Built multiple MERN stack web applications and e-commerce portals. B.Tech Computer Science graduate 2025.',
      detectedSkills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'HTML5', 'CSS3', 'Git'],
      resumeScore: 82,
      categoryScores: {
        skills: 85,
        projects: 80,
        education: 90,
        experience: 65,
        keywords: 75
      },
      detectedSections: ['Education', 'Skills', 'Projects', 'Experience'],
      suggestions: [
        'Add quantitative achievements in project descriptions (e.g. improved loading speed by 35%).',
        'Include DevOps skills like Docker & AWS to qualify for senior full-stack roles.'
      ],
      wordCount: 320
    });
    console.log('Student Resume seeded.');

    // 6. Create Demo Applications
    const firstJob = insertedJobs[0];
    const secondJob = insertedJobs[1];

    await Application.create({
      userId: studentUser._id,
      jobId: firstJob._id,
      status: 'Shortlisted',
      notes: 'Passed initial resume screening. Technical interview scheduled.',
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    await Application.create({
      userId: studentUser._id,
      jobId: secondJob._id,
      status: 'Under Review',
      notes: 'Application submitted to engineering hiring manager.',
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    // 7. Seed Notifications
    await Notification.create({
      userId: studentUser._id,
      title: 'Resume Analysis Complete',
      message: 'Your resume has been processed. Readiness score: 82/100.',
      type: 'resume',
      link: '/resume-analysis'
    });

    await Notification.create({
      userId: studentUser._id,
      title: 'Application Shortlisted!',
      message: 'CloudScale Technologies has shortlisted your application for MERN Stack Developer.',
      type: 'application',
      link: '/applications'
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
