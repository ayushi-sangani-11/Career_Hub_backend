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
const SkillGapAnalysis = require('./models/SkillGapAnalysis');

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
    await SkillGapAnalysis.deleteMany();

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
      careerGoal: 'Software Engineer',
      skills: ['Java', 'SQL', 'Git', 'Data Structures', 'Python', 'React', 'HTML', 'CSS'],
      bio: 'Enthusiastic computer science student seeking engineering, software development, and data roles.'
    });

    console.log('Users seeded: Admin & Student created.');

    // 2. Create Skills Taxonomy Catalog
    const skillsData = [
      { name: 'Java', category: 'Software Development', description: 'Enterprise object-oriented programming language.', level: 'Advanced', importance: 10 },
      { name: 'SQL', category: 'Database', description: 'Standard relational query language for databases.', level: 'Advanced', importance: 10 },
      { name: 'Git', category: 'Tools & Workflow', description: 'Distributed version control system.', level: 'Advanced', importance: 10 },
      { name: 'React', category: 'Software Development', description: 'Popular frontend library for single-page web applications.', level: 'Intermediate', importance: 9 },
      { name: 'Node.js', category: 'Software Development', description: 'Asynchronous event-driven JavaScript backend runtime.', level: 'Intermediate', importance: 9 },
      { name: 'Express.js', category: 'Software Development', description: 'Minimalist Node.js web application framework.', level: 'Intermediate', importance: 8 },
      { name: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database system.', level: 'Intermediate', importance: 8 },
      { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud computing suite.', level: 'Beginner', importance: 9 },
      { name: 'Docker', category: 'Cloud', description: 'Containerization engine for developing & deploying applications.', level: 'Beginner', importance: 9 },
      { name: 'Python', category: 'Data', description: 'High-level programming language widely used in AI, Data Science & APIs.', level: 'Intermediate', importance: 10 },
      { name: 'Power BI', category: 'Data', description: 'Business intelligence and data visualization software.', level: 'Beginner', importance: 8 },
      { name: 'Tableau', category: 'Data', description: 'Interactive visual data analytics platform.', level: 'Beginner', importance: 8 },
      { name: 'Figma', category: 'Design', description: 'Collaborative cloud interface design and prototyping tool.', level: 'Intermediate', importance: 9 },
      { name: 'SEO', category: 'Marketing', description: 'Search engine optimization strategies and tools.', level: 'Intermediate', importance: 8 },
      { name: 'Financial Analysis', category: 'Finance', description: 'Evaluating business performance, budgets, and financial metrics.', level: 'Intermediate', importance: 8 }
    ];
    await Skill.insertMany(skillsData);
    console.log('Skills seeded.');

    // 3. Create Learning Courses Catalog
    const coursesData = [
      {
        title: 'React.js Fundamentals & Modern Frontend',
        skill: 'React',
        level: 'Beginner',
        description: 'Learn JSX, state management, custom hooks, component composition, and API integration.',
        duration: '3 Weeks',
        resourceUrl: 'https://react.dev/learn',
        category: 'Software Development'
      },
      {
        title: 'Mastering Docker & Containerization',
        skill: 'Docker',
        level: 'Beginner',
        description: 'Learn container fundamentals, Dockerfile creation, multi-container orchestration with Docker Compose, and deployment.',
        duration: '3 Weeks',
        resourceUrl: 'https://docker.com/getting-started',
        category: 'Cloud'
      },
      {
        title: 'AWS Cloud Practitioner & Core Services',
        skill: 'AWS',
        level: 'Beginner',
        description: 'Comprehensive introduction to EC2, S3, RDS, Lambda, VPC networking, and cloud architecture best practices.',
        duration: '4 Weeks',
        resourceUrl: 'https://aws.amazon.com/training',
        category: 'Cloud'
      },
      {
        title: 'Power BI Data Analytics & Dashboards',
        skill: 'Power BI',
        level: 'Intermediate',
        description: 'Build interactive dashboards, DAX queries, data modeling, and automated business reporting.',
        duration: '3 Weeks',
        resourceUrl: 'https://learn.microsoft.com/en-us/power-bi',
        category: 'Data'
      },
      {
        title: 'Figma UI/UX Design System Certification',
        skill: 'Figma',
        level: 'Beginner',
        description: 'Master auto-layout, interactive prototypes, design systems, and responsive screen wireframes.',
        duration: '3 Weeks',
        resourceUrl: 'https://help.figma.com',
        category: 'Design'
      }
    ];
    await Course.insertMany(coursesData);
    console.log('Courses seeded.');

    // 4. Create Multi-Domain Jobs Catalog
    const jobsData = [
      {
        title: 'TCS Software Developer',
        company: 'Tata Consultancy Services (TCS)',
        location: 'Mumbai, India / Hybrid',
        type: 'Full-Time',
        salary: '₹6,50,000 - ₹9,00,000 / year',
        description: 'TCS is hiring Software Developers for enterprise software engineering projects. You will work on full-lifecycle application development, database queries, and cloud-native services.',
        responsibilities: [
          'Develop enterprise application modules in Java and SQL',
          'Participate in code reviews, version control, and automated testing',
          'Collaborate with cloud engineers to deploy services on AWS and Docker'
        ],
        requiredSkills: ['Java', 'SQL', 'Git', 'Data Structures', 'React', 'AWS', 'Docker'],
        preferredSkills: ['Spring Boot', 'PostgreSQL', 'Linux'],
        education: 'B.Tech / B.E in Computer Science or related IT field',
        experience: '0-2 Years',
        applicationUrl: 'https://tcs.com/careers',
        category: 'Software Development',
        createdBy: adminUser._id
      },
      {
        title: 'Accenture Data Analyst',
        company: 'Accenture',
        location: 'Bengaluru, India / Remote',
        type: 'Full-Time',
        salary: '₹7,00,000 - ₹10,50,000 / year',
        description: 'Accenture analytics team is seeking a Data Analyst to transform complex client data into actionable insights, dashboards, and automated business intelligence pipelines.',
        responsibilities: [
          'Query relational databases using advanced SQL',
          'Analyze dataset trends in Python and Pandas',
          'Design interactive dashboards in Power BI and Tableau'
        ],
        requiredSkills: ['Python', 'SQL', 'Pandas', 'Power BI', 'Excel', 'Data Analysis'],
        preferredSkills: ['Tableau', 'Scikit-Learn', 'Statistics'],
        education: 'Bachelor in Statistics, CS, Mathematics, or Data Science',
        experience: '0-2 Years',
        applicationUrl: 'https://accenture.com/careers',
        category: 'Data',
        createdBy: adminUser._id
      },
      {
        title: 'MERN Stack Developer',
        company: 'CloudScale Technologies',
        location: 'Remote',
        type: 'Full-Time',
        salary: '$85,000 - $110,000 / year',
        description: 'We are seeking a high-energy MERN Stack Developer to engineer customer web applications using React, Node.js, Express.js, and MongoDB.',
        responsibilities: [
          'Build frontend user interfaces in React and Tailwind CSS',
          'Design RESTful microservices and MongoDB database schemas',
          'Optimize web performance and client caching'
        ],
        requiredSkills: ['React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
        preferredSkills: ['TypeScript', 'Docker', 'AWS'],
        education: 'Bachelor Degree in CS / Software Engineering',
        experience: '0-2 Years',
        applicationUrl: 'https://cloudscale.io/careers',
        category: 'Software Development',
        createdBy: adminUser._id
      },
      {
        title: 'Amazon Cloud & DevOps Engineer',
        company: 'Amazon Web Services (AWS)',
        location: 'Seattle, WA / Hybrid',
        type: 'Full-Time',
        salary: '$115,000 - $145,000 / year',
        description: 'AWS Cloud team is hiring Cloud Engineers to build infrastructure automation, container clusters, and CI/CD pipelines.',
        responsibilities: [
          'Maintain infrastructure as code with Terraform & AWS CloudFormation',
          'Manage Docker and Kubernetes container deployments',
          'Monitor cloud security and networking policies'
        ],
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Git', 'Python'],
        preferredSkills: ['Terraform', 'CI/CD', 'Bash'],
        education: 'Bachelor in CS, Systems Engineering or Cloud Computing',
        experience: '1-3 Years',
        applicationUrl: 'https://amazon.jobs',
        category: 'Cloud',
        createdBy: adminUser._id
      },
      {
        title: 'UI/UX Product Designer',
        company: 'Figma Studio & Co.',
        location: 'San Francisco, CA / Remote',
        type: 'Full-Time',
        salary: '$90,000 - $120,000 / year',
        description: 'Join our design team to create user flows, wireframes, and interactive prototypes for next-generation web and mobile applications.',
        responsibilities: [
          'Conduct user interviews and design feedback sessions',
          'Create Figma component libraries and wireframes',
          'Collaborate with developers to ensure pixel-perfect implementation'
        ],
        requiredSkills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'UI Design'],
        preferredSkills: ['Adobe XD', 'HTML', 'CSS', 'Design Systems'],
        education: 'Degree in Interaction Design, HCI, or Design discipline',
        experience: '1-3 Years',
        applicationUrl: 'https://figma.com/careers',
        category: 'Design',
        createdBy: adminUser._id
      },
      {
        title: 'Digital Marketing Specialist',
        company: 'GrowthEdge Agency',
        location: 'New York, NY (Hybrid)',
        type: 'Full-Time',
        salary: '$65,000 - $85,000 / year',
        description: 'GrowthEdge is looking for a Digital Marketing Specialist to manage SEO campaigns, paid advertising, and conversion optimization.',
        responsibilities: [
          'Optimize website pages for Search Engine Optimization (SEO)',
          'Manage Google Ads and paid social media campaigns',
          'Analyze traffic metrics in Google Analytics'
        ],
        requiredSkills: ['SEO', 'Google Ads', 'Social Media Marketing', 'Google Analytics', 'Content Marketing'],
        preferredSkills: ['Email Marketing', 'Copywriting', 'CRM'],
        education: 'Bachelor in Marketing, Communications, or Business',
        experience: '0-2 Years',
        applicationUrl: 'https://growthedge.com/careers',
        category: 'Marketing',
        createdBy: adminUser._id
      }
    ];

    const insertedJobs = await Job.insertMany(jobsData);
    console.log('Jobs seeded across multiple career categories.');

    // 5. Create Demo Resume for Student
    const sampleResume = await Resume.create({
      userId: studentUser._id,
      fileName: 'Alex_Johnson_Resume.pdf',
      fileUrl: '/uploads/sample-resume.pdf',
      extractedText: 'Alex Johnson - Computer Science Student. Proficient in Java, SQL, Git, Data Structures, Python, React, HTML, CSS. Built web apps and database management systems. Graduating 2025.',
      detectedSkills: ['Java', 'SQL', 'Git', 'Data Structures', 'Python', 'React', 'HTML', 'CSS'],
      resumeScore: 82,
      categoryScores: {
        skills: 85,
        projects: 80,
        education: 90,
        experience: 65,
        keywords: 75
      },
      detectedSections: ['Education', 'Skills', 'Projects'],
      suggestions: [
        'Add cloud technologies (AWS, Docker) to match enterprise job requirements.'
      ],
      wordCount: 280
    });
    console.log('Student Master Resume seeded.');

    // 6. Create Demo Job-Specific Skill Gap Analysis for Student
    const tcsJob = insertedJobs[0]; // TCS Software Developer
    await SkillGapAnalysis.create({
      userId: studentUser._id,
      jobId: tcsJob._id,
      resumeId: sampleResume._id,
      jobTitle: tcsJob.title,
      company: tcsJob.company,
      matchedSkills: ['Java', 'SQL', 'Git', 'Data Structures'],
      missingSkills: ['React', 'AWS', 'Docker'],
      partialSkills: [],
      matchPercentage: 57,
      matchedCount: 4,
      totalRequired: 7,
      recommendations: [
        'Learn React: Listed as a key requirement in the TCS Software Developer job description.',
        'Learn AWS: Required for cloud service deployment at TCS.',
        'Learn Docker: Listed as a container requirement in the TCS job requirements.'
      ],
      disclaimer: 'This match percentage is an AI-assisted skill comparison based on job requirements and resume text, not a guarantee of employment.'
    });

    console.log('Demo Job-Specific Skill Gap Analysis created.');

    // 7. Create Demo Applications
    await Application.create({
      userId: studentUser._id,
      jobId: tcsJob._id,
      status: 'Under Review',
      notes: 'Applied after reviewing skill gap analysis.',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // 8. Seed System Notifications
    await Notification.create({
      userId: studentUser._id,
      title: 'Skill Gap Analysis Ready',
      message: 'Your resume comparison for "TCS Software Developer" is ready. Match: 57%.',
      type: 'resume',
      link: '/skill-gap'
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
