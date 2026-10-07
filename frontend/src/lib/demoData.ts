import {
  Analysis,
  DashboardStats,
  ResumeTailorResponse,
  RecruiterJob,
  CandidateRankingItem,
  CandidateDetail
} from '@/types';

export const DEMO_ANALYSIS: Analysis = {
  id: 'demo-analysis-alex-stripe',
  resume_id: 'demo-resume-1',
  job_id: 'demo-job-stripe',
  resume_title: 'Alex Rivera — Senior Backend Resume.pdf',
  job_title: 'Senior Backend Engineer',
  company_name: 'Stripe',
  overall_ats_score: 87.0,
  job_match_score: 82.5,
  keyword_match_score: 84.0,
  quality_score: 88.0,
  summary:
    'Strong ATS compatibility and technical alignment for the Senior Backend Engineer role at Stripe. Detected high proficiency in Python, FastAPI, and PostgreSQL. Closing the cloud architecture and Redis cache clustering gaps will make this a top 5% candidate application.',
  scores: [
    {
      category: 'ATS Compatibility',
      score: 92.0,
      max_score: 100,
      status: 'Excellent',
      explanation: 'Clean single-column layout, standard section titles, and 100% parsable text with zero unreadable nested tables.',
    },
    {
      category: 'Keyword Match',
      score: 84.0,
      max_score: 100,
      status: 'Strong',
      explanation: 'Found 24 out of 28 core technical keywords and framework variants specified in the job description.',
    },
    {
      category: 'Skills Match',
      score: 82.5,
      max_score: 100,
      status: 'Strong',
      explanation: '14 core technical competencies matched; 4 important skill gaps identified in distributed message queuing.',
    },
    {
      category: 'Experience Match',
      score: 85.0,
      max_score: 100,
      status: 'Strong',
      explanation: 'Experience section highlights high-concurrency microservices, sub-45ms latency tuning, and production scale.',
    },
    {
      category: 'Education Match',
      score: 95.0,
      max_score: 100,
      status: 'Excellent',
      explanation: 'B.S. in Computer Science plus AWS Certified Solutions Architect credential recognized.',
    },
    {
      category: 'Formatting Quality',
      score: 92.0,
      max_score: 100,
      status: 'Excellent',
      explanation: 'Consistent typography, clear hierarchical spacing, and standard font styling.',
    },
    {
      category: 'Readability',
      score: 88.0,
      max_score: 100,
      status: 'Strong',
      explanation: 'High information density without visual crowding. Average bullet length is 18-24 words.',
    },
    {
      category: 'Impact',
      score: 86.0,
      max_score: 100,
      status: 'Strong',
      explanation: '7 quantified metrics detected including 5M+ requests, 42% latency reduction, and sub-45ms p99 latency.',
    },
  ],
  keywords: [
    { keyword: 'FastAPI', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'PostgreSQL', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'Python', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'REST APIs', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'Docker', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'Kubernetes', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'AWS', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'Microservices', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'Distributed Systems', category: 'Critical Missing', status: 'missing', relevance: 'high', section_suggestion: 'Experience' },
    { keyword: 'Kafka', category: 'Critical Missing', status: 'missing', relevance: 'high', section_suggestion: 'Experience' },
    { keyword: 'CI/CD Pipelines', category: 'Already Found', status: 'found', relevance: 'high' },
    { keyword: 'Redis Clustering', category: 'Recommended', status: 'missing', relevance: 'medium', section_suggestion: 'Skills' },
    { keyword: 'Observability', category: 'Recommended', status: 'missing', relevance: 'medium', section_suggestion: 'Projects' },
    { keyword: 'System Design', category: 'Already Found', status: 'found', relevance: 'high' },
  ],
  skills: [
    { skill_name: 'Python', match_percentage: 100, priority: 'Must Have', in_resume: true, in_job: true },
    { skill_name: 'FastAPI', match_percentage: 100, priority: 'Must Have', in_resume: true, in_job: true },
    { skill_name: 'PostgreSQL', match_percentage: 100, priority: 'Must Have', in_resume: true, in_job: true },
    { skill_name: 'Distributed Systems', match_percentage: 35, priority: 'Must Have', in_resume: false, in_job: true },
    { skill_name: 'Kafka / Event Streaming', match_percentage: 20, priority: 'Must Have', in_resume: false, in_job: true },
    { skill_name: 'Docker & Kubernetes', match_percentage: 100, priority: 'Good to Have', in_resume: true, in_job: true },
    { skill_name: 'AWS Cloud Infrastructure', match_percentage: 90, priority: 'Good to Have', in_resume: true, in_job: true },
    { skill_name: 'Redis In-Memory Caching', match_percentage: 85, priority: 'Good to Have', in_resume: true, in_job: true },
    { skill_name: 'Terraform IaC', match_percentage: 75, priority: 'Bonus', in_resume: true, in_job: true },
    { skill_name: 'Datadog / Prometheus', match_percentage: 0, priority: 'Bonus', in_resume: false, in_job: true },
  ],
  issues: [
    {
      severity: 'Passed',
      category: 'Multi-column layout',
      title: 'Single-column structure confirmed',
      description: 'Standard linear flow guarantees seamless parsing across all legacy and modern ATS systems.',
    },
    {
      severity: 'Passed',
      category: 'Section headings',
      title: 'Standard section headings detected',
      description: 'Experience, Education, Skills, and Projects sections use conventional titles.',
    },
    {
      severity: 'Passed',
      category: 'Contact information',
      title: 'Valid email and direct phone detected',
      description: 'Contact details are embedded in normal body text, not buried in headers/footers.',
    },
    {
      severity: 'Warning',
      category: 'Bullet Point Metrics',
      title: 'Two experience bullets lack quantifiable business outcomes',
      description: 'Bullets describe functional responsibilities rather than measured percentage or financial impact.',
      recommendation: 'Rewrite bullet points using the Google XYZ formula: Accomplished [X] measured by [Y] doing [Z].',
    },
    {
      severity: 'Warning',
      category: 'Keywords Density',
      title: 'Distributed Systems terminology underrepresented in recent roles',
      description: 'While microservices are highlighted, core terms like "event sourcing" and "distributed consensus" are absent.',
      recommendation: 'Add distributed systems keywords to your current Senior Backend Engineer role.',
    },
    {
      severity: 'Passed',
      category: 'File readability',
      title: 'Clean PDF text layer verified',
      description: 'PyMuPDF successfully extracted 100% of characters with zero font encoding errors.',
    },
  ],
  recommendations: [
    {
      section: 'Skills',
      priority: 'High',
      title: 'Incorporate Kafka & Distributed Systems keywords',
      action_item: 'Add "Apache Kafka" and "Distributed Event Streaming" into your Technical Skills and recent CloudScale experience.',
    },
    {
      section: 'Experience',
      priority: 'High',
      title: 'Quantify NovaByte Labs bullet points',
      action_item: 'Add specific latency numbers or scale figures (e.g., "supporting 50,000 active users") to the junior engineer role.',
    },
    {
      section: 'Summary',
      priority: 'Medium',
      title: 'Align headline with target role: Senior Backend Engineer',
      action_item: 'Tailor your professional summary to mention Stripe payment infrastructure domains explicitly.',
    },
    {
      section: 'Projects',
      priority: 'Low',
      title: 'Add live GitHub repositories',
      action_item: 'Link directly to open-source contributions or architecture RFCs.',
    },
  ],
  sections_analysis: [
    {
      section_name: 'Summary',
      score: 84.0,
      strengths: ['Concise and authoritative tone', 'Highlights 6+ years of specialized systems experience'],
      issues: ['Does not explicitly state target industry or domain of interest (Payments/FinTech)'],
      recommendations: ['Mention interest in high-scale payments and transaction processing'],
    },
    {
      section_name: 'Experience',
      score: 86.0,
      strengths: ['Strong action verbs (Architected, Engineered, Spearheaded)', 'Excellent sub-45ms latency metric'],
      issues: ['Second job description could have more quantifiable business impact'],
      recommendations: ['Add dollar amounts or throughput percentages to Apex Financial bullets'],
    },
    {
      section_name: 'Skills',
      score: 84.0,
      strengths: ['Clear categorization by Languages, Frameworks, Cloud, Databases'],
      issues: ['Missing Kafka and event streaming queues requested by Stripe'],
      recommendations: ['Group skills into Core Languages, Distributed Databases, and Cloud DevOps'],
    },
    {
      section_name: 'Education',
      score: 95.0,
      strengths: ['Accredited B.S. in Computer Science', 'Clear graduation timeline'],
      issues: [],
      recommendations: ['Keep as is; formatting is optimal for ATS'],
    },
    {
      section_name: 'Certifications',
      score: 92.0,
      strengths: ['AWS Solutions Architect and CKAD credentials provide strong credibility'],
      issues: [],
      recommendations: ['List credential validation URLs where appropriate'],
    },
  ],
  created_at: '2026-10-07T12:00:00Z',
};

export const DEMO_STATS: DashboardStats = {
  total_analyses: 8,
  average_ats_score: 84.2,
  best_match_score: 89.0,
  resumes_improved: 4,
  score_history: [
    { id: '1', date: 'Sep 12', ats_score: 68, match_score: 62, keyword_score: 65 },
    { id: '2', date: 'Sep 18', ats_score: 74, match_score: 71, keyword_score: 70 },
    { id: '3', date: 'Sep 25', ats_score: 79, match_score: 76, keyword_score: 78 },
    { id: '4', date: 'Oct 01', ats_score: 83, match_score: 80, keyword_score: 82 },
    { id: '5', date: 'Oct 04', ats_score: 85, match_score: 81, keyword_score: 84 },
    { id: '6', date: 'Oct 07', ats_score: 87, match_score: 82.5, keyword_score: 84 },
  ],
  top_missing_skills: [
    { skill: 'Apache Kafka', occurrences: 5 },
    { skill: 'Distributed Systems', occurrences: 4 },
    { skill: 'Terraform', occurrences: 3 },
    { skill: 'GraphQL', occurrences: 2 },
    { skill: 'Prometheus', occurrences: 2 },
  ],
  most_frequent_missing_keywords: [
    { keyword: 'Kafka', count: 4 },
    { keyword: 'Event-Driven', count: 3 },
    { keyword: 'Observability', count: 2 },
    { keyword: 'Redis Clustering', count: 2 },
  ],
  suggested_improvements: [
    {
      section: 'Experience',
      priority: 'High',
      title: 'Quantify older bullets with measurable outcomes',
      action: 'Upgrade passive duties into measured accomplishments with % and scale metrics.',
    },
    {
      section: 'Skills',
      priority: 'High',
      title: 'Add Distributed Streaming keywords',
      action: 'Incorporate Kafka and RabbitMQ messaging keywords into your tech stack list.',
    },
    {
      section: 'Summary',
      priority: 'Medium',
      title: 'Target job title alignment',
      action: 'Align your headline directly with the exact job posting title.',
    },
  ],
  recent_analyses: [
    {
      id: 'demo-analysis-alex-stripe',
      resume_id: 'res-1',
      resume_name: 'Alex Rivera — Senior Backend Resume.pdf',
      job_title: 'Senior Backend Engineer',
      company: 'Stripe',
      ats_score: 87.0,
      match_score: 82.5,
      date: 'Oct 07, 2026',
    },
    {
      id: 'analysis-2',
      resume_id: 'res-1',
      resume_name: 'Alex Rivera — Senior Backend Resume.pdf',
      job_title: 'Staff Platform Engineer',
      company: 'Vercel',
      ats_score: 83.5,
      match_score: 80.0,
      date: 'Oct 02, 2026',
    },
    {
      id: 'analysis-3',
      resume_id: 'res-2',
      resume_name: 'Full Stack Systems Resume.pdf',
      job_title: 'Principal Engineer',
      company: 'Datadog',
      ats_score: 79.0,
      match_score: 75.0,
      date: 'Sep 26, 2026',
    },
  ],
};

export const TAILOR_PRESETS = [
  {
    id: 'stripe-backend',
    job_title: 'Senior Backend Engineer',
    company: 'Stripe',
    job_description: `We are looking for a Senior Backend Engineer to join our Core Payments Infrastructure team.
You will design, build, and scale high-availability APIs handling billions of dollars in daily transactions.

Requirements:
- 4+ years of backend engineering experience with Python, FastAPI, Go, or Java.
- Deep expertise in relational databases, specifically PostgreSQL, query optimization, and schema migrations.
- Proven experience with distributed systems, Redis caching, Kafka or RabbitMQ event streaming.
- Solid background in Docker, Kubernetes, CI/CD pipelines, and AWS cloud environments.
- Strong focus on sub-50ms API latency, fault tolerance, and idempotency.`,
    sample_resume: `ALEX RIVERA
San Francisco, CA • alex.rivera@example.com • (555) 234-5678 • linkedin.com/in/alexrivera-dev

PROFESSIONAL SUMMARY
Software developer with 4 years of experience building web applications and backend systems using Python and relational databases. Experienced in RESTful APIs and cloud deployments.

TECHNICAL SKILLS
Languages: Python, JavaScript, SQL, HTML/CSS
Frameworks & Tools: Django, Flask, Express, Docker, Git, Linux
Databases: MySQL, SQLite, MongoDB
Cloud: AWS (EC2, S3)

WORK EXPERIENCE
Backend Software Engineer | CloudScale FinTech (2022 - Present)
- Developed REST API endpoints for user accounts and recurring transaction billing.
- Managed database queries and reduced response times by 25% through query refactoring.
- Handled deployment scripts and assisted with server maintenance on AWS EC2.
- Collaborated with frontend engineers to integrate payment checkout screens.

Software Engineer | Apex Digital Solutions (2020 - 2022)
- Built internal dashboard tools using Python and Flask with MySQL databases.
- Integrated third-party webhook integrations for notification delivery.
- Wrote unit tests and increased code test coverage from 60% to 82%.

PROJECTS
High-Throughput Webhook Engine
- Created a background worker service that parsed transaction JSON payloads and updated ledger balances.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2020)`,
  },
  {
    id: 'openai-solutions',
    job_title: 'AI Solutions Engineer',
    company: 'OpenAI',
    job_description: `OpenAI is seeking an AI Solutions Engineer to partner with enterprise customers to build generative AI architectures.

Requirements:
- Hands-on experience developing LLM pipelines, prompt engineering, and RAG systems using LangChain, LlamaIndex, or Vector DBs (Pinecone, pgvector).
- Proficiency in Python, TypeScript/Next.js, and RESTful API integration.
- Ability to evaluate AI model safety, latency, token efficiency, and hallucination reduction.
- Experience delivering production AI applications with measurable business value.`,
    sample_resume: `SARAH CHEN
New York, NY • sarah.chen@example.com • (555) 876-5432 • github.com/sarahchen-ai

PROFESSIONAL SUMMARY
Full-stack software engineer with 3+ years of experience building modern web applications and integrating machine learning APIs into customer-facing products.

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript
Frameworks: React, Next.js, Node.js, FastAPI
AI & Data: OpenAI API, Pandas, Scikit-learn, Vector Embeddings
Cloud & DB: PostgreSQL, Redis, Vercel, Supabase

WORK EXPERIENCE
Full Stack Engineer | CogniTech Labs (2023 - Present)
- Built enterprise search features connecting vector embeddings to existing knowledge bases.
- Developed Next.js and FastAPI web interfaces for internal AI document summaries.
- Reduced API inference latency by caching repetitive query results in Redis.

Software Developer | Horizon Media (2021 - 2023)
- Created content analytics dashboard utilizing NLP classification algorithms.
- Architected data ingest pipelines processing 50,000 articles daily.

EDUCATION
B.S. in Computer Science & Data Science | Columbia University (2021)`,
  },
  {
    id: 'vercel-frontend',
    job_title: 'Senior Frontend Platform Engineer',
    company: 'Vercel',
    job_description: `Vercel is looking for a Senior Frontend Platform Engineer to advance our developer experience and web runtime.

Requirements:
- Deep expertise in Next.js (App Router, Server Components, SSR, ISR) and React 19.
- Strong mastery of TypeScript, Tailwind CSS, Web Vitals optimization, and micro-frontend architecture.
- Experience building headless design systems, accessible UI components (ARIA, WCAG 2.1 AA), and bundle optimization.
- Understanding of edge middleware, streaming SSR, and serverless compute models.`,
    sample_resume: `JORDAN LEE
Seattle, WA • jordan.lee@example.com • (555) 345-6789 • jordanlee.io

PROFESSIONAL SUMMARY
Frontend developer with 5 years experience specializing in React, TypeScript, and modern web application interfaces. Passionate about design systems and web performance.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, CSS3, HTML5
Frameworks: React, Next.js, Redux, Tailwind CSS, Vite
Tools: Jest, Playwright, Storybook, Webpack, Figma
Performance: Lighthouse, Core Web Vitals, Bundle Analyzer

WORK EXPERIENCE
Senior Frontend Developer | Pulse UI (2022 - Present)
- Led frontend redesign across 12 product modules using Next.js and Tailwind CSS.
- Improved Core Web Vitals LCP by 45% and reduced main thread blocking time.
- Created reusable component library used by 18 engineering teams.

Frontend Engineer | DevStack (2019 - 2022)
- Built interactive developer dashboards with React and TypeScript.
- Implemented state management and optimized complex data grid rendering performance.

EDUCATION
B.S. in Software Engineering | University of Washington (2019)`,
  },
];

export const DEMO_TAILOR_RESPONSE: ResumeTailorResponse = {
  original_resume: TAILOR_PRESETS[0].sample_resume,
  tailored_resume: `ALEX RIVERA
San Francisco, CA • alex.rivera@example.com • (555) 234-5678 • linkedin.com/in/alexrivera-dev

PROFESSIONAL SUMMARY
Senior Backend Engineer with 4+ years of experience engineering high-concurrency payment APIs and scalable backend architectures. Specialized in Python, FastAPI, PostgreSQL, and distributed Redis caching systems with a focus on sub-50ms latency and high availability.

TECHNICAL SKILLS
Core Languages: Python, Go, SQL, JavaScript
Frameworks & APIs: FastAPI, Django, REST APIs, Microservices, Event-Driven Architecture
Databases & Cache: PostgreSQL (Query Optimization, Migrations), Redis, MySQL
Cloud & Infrastructure: Docker, Kubernetes, AWS (EC2, S3, RDS), CI/CD Pipelines, Kafka

WORK EXPERIENCE
Senior Backend Software Engineer | CloudScale FinTech (2022 - Present)
- Architected and deployed high-availability REST APIs using FastAPI and PostgreSQL handling $15M+ monthly billing transactions.
- Implemented distributed Redis caching layer, reducing median API latency by 42% (down to 38ms) and eliminating database connection bottlenecks.
- Containerized microservices with Docker and automated CI/CD pipeline deployments to AWS cloud environments.
- Designed idempotent webhook ingestion service processing 10,000+ daily payload events with 99.99% reliability.

Software Engineer | Apex Digital Solutions (2020 - 2022)
- Engineered scalable backend services using Python, refactoring legacy relational schemas and optimizing complex PostgreSQL queries.
- Integrated enterprise third-party APIs and webhook delivery pipelines with automated retry and backoff mechanisms.
- Established automated test suites with PyTest, boosting test coverage from 60% to 88% and cutting regression incidents in half.

PROJECTS
Distributed Payment Webhook Engine
- Architected an event-driven webhook processing pipeline with FastAPI and Redis message broker, maintaining sub-45ms response time under peak load.
- Designed database idempotency keys and transactional integrity safeguards to prevent duplicate ledger postings.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2020)`,
  job_title: 'Senior Backend Engineer',
  company: 'Stripe',
  tailored_sections: {
    summary:
      'Senior Backend Engineer with 4+ years of experience engineering high-concurrency payment APIs and scalable backend architectures. Specialized in Python, FastAPI, PostgreSQL, and distributed Redis caching systems with a focus on sub-50ms latency and high availability.',
    skills:
      'Core Languages: Python, Go, SQL, JavaScript\nFrameworks & APIs: FastAPI, Django, REST APIs, Microservices, Event-Driven Architecture\nDatabases & Cache: PostgreSQL (Query Optimization, Migrations), Redis, MySQL\nCloud & Infrastructure: Docker, Kubernetes, AWS (EC2, S3, RDS), CI/CD Pipelines, Kafka',
    experience:
      'Senior Backend Software Engineer | CloudScale FinTech (2022 - Present)\n- Architected and deployed high-availability REST APIs using FastAPI and PostgreSQL handling $15M+ monthly billing transactions.\n- Implemented distributed Redis caching layer, reducing median API latency by 42% (down to 38ms) and eliminating database connection bottlenecks.\n- Containerized microservices with Docker and automated CI/CD pipeline deployments to AWS cloud environments.\n- Designed idempotent webhook ingestion service processing 10,000+ daily payload events with 99.99% reliability.',
    projects:
      'Distributed Payment Webhook Engine\n- Architected an event-driven webhook processing pipeline with FastAPI and Redis message broker, maintaining sub-45ms response time under peak load.\n- Designed database idempotency keys and transactional integrity safeguards to prevent duplicate ledger postings.',
    education: 'B.S. in Computer Science | University of California, Berkeley (2020)',
  },
  change_log: [
    {
      category: 'Added',
      item: 'FastAPI Framework Integration',
      description: 'Integrated FastAPI throughout skills and work history to directly match Stripe API requirements.',
    },
    {
      category: 'Added',
      item: 'PostgreSQL & Query Optimization',
      description: 'Explicitly highlighted relational database tuning and schema migration proficiency.',
    },
    {
      category: 'Added',
      item: 'Redis & Distributed Caching',
      description: 'Positioned in-memory caching to satisfy sub-50ms latency and high-availability criteria.',
    },
    {
      category: 'Added',
      item: 'Target Role Headline: Senior Backend Engineer',
      description: 'Aligned the professional summary headline to match the exact target title at Stripe.',
    },
    {
      category: 'Improved',
      item: 'Project Descriptions & Latency Metrics',
      description: 'Elevated webhook project with architecture-level terminology, sub-45ms performance, and idempotency safeguards.',
    },
    {
      category: 'Improved',
      item: 'Quantified Experience Bullets',
      description: 'Replaced passive duty verbs with strong engineering action verbs and measured outcomes ($15M+ billing, 42% latency reduction).',
    },
    {
      category: 'Improved',
      item: 'Categorized Technical Skills Taxonomy',
      description: 'Organized skills into Core Languages, Frameworks & APIs, Databases & Cache, and Cloud & Infrastructure for superior ATS parsing.',
    },
    {
      category: 'Removed',
      item: 'Irrelevant Legacy Technologies',
      description: 'Eliminated SQLite and generic web tags to concentrate resume density on enterprise backend technologies.',
    },
    {
      category: 'Removed',
      item: 'Passive Phrasing & Fluff',
      description: 'Removed weak starter phrases like "assisted with", "handled deployment scripts", and "worked on".',
    },
    {
      category: 'Recommended',
      item: 'Distributed Consensus & Idempotency',
      description: 'Prepare to discuss distributed ledger consistency and two-phase commits during Stripe system design rounds.',
    },
    {
      category: 'Recommended',
      item: 'Kafka / Event Streaming Deep Dive',
      description: 'Emphasize event-driven architecture and asynchronous message queues during recruiter screening.',
    },
  ],
  ats_forecast: {
    current_score: 71.0,
    expected_score: 88.0,
    increase: 17.0,
    reasoning: [
      '+8.0 pts: Directly closed 3 primary tech stack keyword gaps (FastAPI, PostgreSQL, Redis) demanded by Stripe.',
      '+5.0 pts: Transformed 4 passive experience bullets into quantified, action-oriented engineering achievements.',
      '+2.5 pts: Aligned target summary headline directly with Senior Backend Engineer role specifications.',
      '+1.5 pts: Streamlined technical skills taxonomy and eliminated non-essential legacy tools for higher ATS parse index.',
    ],
  },
  new_resume_id: 'tailored-stripe-demo',
};

export const DEMO_RECRUITER_JOBS: RecruiterJob[] = [
  {
    id: 'job-stripe-backend',
    title: 'Senior Backend Engineer',
    company: 'Stripe',
    description: 'Lead high-throughput payment processing pipelines, distributed ledger services, and resilient API architecture using Python, FastAPI, and PostgreSQL.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'Kubernetes'],
    experience_level: 'Senior',
    status: 'Active',
    candidate_count: 3,
    average_ats_score: 82.0,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'job-vercel-platform',
    title: 'Staff Platform Engineer',
    company: 'Vercel',
    description: 'Scale developer infrastructure, global edge edge compute, Next.js build pipelines, and multi-region Kubernetes clusters.',
    skills: ['Go', 'TypeScript', 'Kubernetes', 'Docker', 'AWS', 'Next.js'],
    experience_level: 'Lead',
    status: 'Active',
    candidate_count: 2,
    average_ats_score: 79.5,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'job-anthropic-ai',
    title: 'Distributed Systems Engineer',
    company: 'Anthropic',
    description: 'Architect low-latency model inference services and high-performance asynchronous data ingestion clusters with PyTorch and Ray.',
    skills: ['Python', 'C++', 'Ray', 'Kubernetes', 'Distributed Systems'],
    experience_level: 'Senior',
    status: 'Active',
    candidate_count: 1,
    average_ats_score: 85.0,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

export const DEMO_RANKED_CANDIDATES: CandidateRankingItem[] = [
  {
    rank: 1,
    analysis_id: 'analysis-alex-stripe',
    resume_id: 'resume-alex',
    candidate_name: 'Alex Rivera',
    email: 'alex.rivera.dev@gmail.com',
    phone: '(415) 890-2341',
    education: 'B.S. in Computer Science — UC Berkeley',
    role: 'Senior Backend Engineer',
    job_title: 'Senior Backend Engineer',
    company: 'Stripe',
    ats_score: 87.0,
    match_score: 84.5,
    skill_match: 86.0,
    experience_match: 88.0,
    verified_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS', 'Kubernetes', 'REST APIs', 'System Design'],
    missing_skills: ['Docker (orchestration in early roles)', 'Kafka Event Streaming'],
    strengths: [
      'Strong Python and FastAPI microservices architecture with sub-45ms latency benchmarks',
      'Quantified business metrics demonstrated ($25M+ monthly transaction processing)',
      'Production Kubernetes and AWS container infrastructure experience',
      'Excellent ATS compatibility (87/100) and clean parse density',
    ],
    concerns: [
      'Missing Docker containerization mentions in early foundation roles',
      'Limited Apache Kafka event streaming exposure compared to RabbitMQ',
    ],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    rank: 2,
    analysis_id: 'analysis-jordan-backend',
    resume_id: 'resume-jordan',
    candidate_name: 'Jordan Lee',
    email: 'jordan.lee@techmail.io',
    phone: '(206) 555-0192',
    education: 'B.S. in Computer Science — Univ of Washington',
    role: 'Backend Engineer',
    job_title: 'Senior Backend Engineer',
    company: 'Stripe',
    ats_score: 82.5,
    match_score: 79.0,
    skill_match: 80.0,
    experience_match: 82.5,
    verified_skills: ['Go', 'Python', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs', 'Git'],
    missing_skills: ['Kubernetes', 'AWS Lambda', 'FastAPI'],
    strengths: [
      'Solid Go and Python backend fundamentals with distributed system experience',
      'Proven database query optimization with 35% response time improvement',
      'Strong Docker containerization and CI/CD pipelines',
    ],
    concerns: [
      'Missing Kubernetes production orchestration depth',
      'Limited multi-region AWS cloud architecting',
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    rank: 3,
    analysis_id: 'analysis-sarah-fullstack',
    resume_id: 'resume-sarah',
    candidate_name: 'Sarah Chen',
    email: 'sarah.chen@innovate.org',
    phone: '(917) 555-4412',
    education: 'M.S. in Data Science — Columbia University',
    role: 'Full Stack & Backend Engineer',
    job_title: 'Senior Backend Engineer',
    company: 'Stripe',
    ats_score: 76.5,
    match_score: 72.0,
    skill_match: 73.0,
    experience_match: 76.5,
    verified_skills: ['Python', 'Django', 'Flask', 'MySQL', 'Redis', 'JavaScript'],
    missing_skills: ['FastAPI', 'Kubernetes', 'AWS', 'Docker'],
    strengths: [
      'Strong academic credentials (M.S. in Data Science from Columbia)',
      'Solid Python web development and relational database management',
      'Hands-on experience maintaining billing APIs with 50k weekly volume',
    ],
    concerns: [
      'Missing Docker and Kubernetes container orchestration',
      'Limited microservices experience compared to monolithic Django',
    ],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export const DEMO_CANDIDATE_DETAIL: CandidateDetail = {
  analysis_id: 'analysis-alex-stripe',
  resume_id: 'resume-alex',
  candidate_name: 'Alex Rivera',
  email: 'alex.rivera.dev@gmail.com',
  phone: '(415) 890-2341',
  education: 'B.S. in Computer Science — UC Berkeley',
  job_title: 'Senior Backend Engineer',
  company: 'Stripe',
  ats_score: 87.0,
  match_score: 84.5,
  skill_match: 86.0,
  experience_match: 88.0,
  raw_resume: `ALEX RIVERA
San Francisco, CA • alex.rivera.dev@gmail.com • (415) 890-2341 • linkedin.com/in/alexrivera-dev

PROFESSIONAL SUMMARY
Senior Backend Engineer with 6+ years of experience building high-throughput microservices, scalable distributed architectures, and developer platforms. Proven expertise in Python, FastAPI, PostgreSQL, and AWS with a track record of driving 99.99% system availability and optimizing API latency for 5M+ daily requests.

TECHNICAL SKILLS
Languages: Python, Go, TypeScript, SQL
Frameworks: FastAPI, Django, Flask, Pydantic, SQLAlchemy
Databases: PostgreSQL, Redis, Elasticsearch, DynamoDB
Cloud & DevOps: Docker, Kubernetes, AWS (ECS, S3, RDS), GitHub Actions, Terraform
Core Competencies: REST APIs, System Design, Microservices, CI/CD Pipelines

PROFESSIONAL EXPERIENCE
Senior Backend Engineer — CloudScale Technologies | San Francisco, CA (2022 – Present)
• Architected and deployed asynchronous REST APIs using FastAPI and PostgreSQL, serving 5M+ daily requests with sub-45ms p99 latency.
• Engineered distributed caching layer with Redis cluster, reducing primary database load by 42%.
• Spearheaded migration of monolithic service to containerized microservices orchestrated via Kubernetes on AWS ECS.
• Automated end-to-end CI/CD deployment pipelines using GitHub Actions and Terraform, accelerating release frequency 4x daily.

Software Engineer — Apex Financial Systems | Austin, TX (2020 – 2022)
• Designed and maintained financial transaction processing pipelines handling $25M+ in monthly automated ledger reconciliations.
• Implemented webhook subscription platform utilizing RabbitMQ message queues to guarantee zero event loss across banking partners.
• Optimized PostgreSQL database queries and indexes, decreasing reporting export time from 14 minutes to under 45 seconds.

EDUCATION
B.S. in Computer Science — University of California, Berkeley (2018)`,
  parsed_sections: {
    summary: 'Senior Backend Engineer with 6+ years of experience building high-throughput microservices, scalable distributed architectures, and developer platforms. Proven expertise in Python, FastAPI, PostgreSQL, and AWS.',
    skills: 'Python, Go, TypeScript, SQL, FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes, AWS, Terraform',
    experience: 'CloudScale Technologies: Architected REST APIs using FastAPI and PostgreSQL for 5M+ daily requests. Apex Financial Systems: Maintained financial pipelines processing $25M+ monthly.',
    education: 'B.S. in Computer Science — University of California, Berkeley (2018)',
  },
  match_explanation: 'Candidate Alex Rivera demonstrates an exceptional ATS compatibility score of 87.0% and a job match score of 84.5% for Senior Backend Engineer at Stripe. Meets all core requirements for Python, FastAPI, PostgreSQL, distributed caching, and microservices architecture. Strong quantified accomplishments across financial pipelines and latency engineering.',
  missing_skills: [
    'Docker (orchestration in early roles)',
    'Kafka Event Streaming',
    'Spring Boot (Bonus)',
  ],
  verified_skills: [
    'Python',
    'FastAPI',
    'PostgreSQL',
    'Redis',
    'AWS',
    'Kubernetes',
    'System Design',
    'REST APIs',
    'Microservices',
    'CI/CD Pipelines',
  ],
  strengths: [
    'Strong Python & FastAPI microservices architecture with proven sub-45ms p99 latency benchmarks',
    'Direct financial transactions and ledger reconciliation experience ($25M+/mo) directly relevant to Stripe',
    'Production Kubernetes and AWS cloud infrastructure management',
    'Measurable, quantified achievements across all engineering roles',
  ],
  concerns: [
    'Missing explicit container orchestration details in early foundation roles',
    'Limited Apache Kafka event streaming experience compared to RabbitMQ message broker',
  ],
  scores: {
    'ATS Compatibility': 92.0,
    'Keyword Match': 84.0,
    'Skills Match': 86.0,
    'Experience Match': 88.0,
    'Formatting Quality': 92.0,
  },
  created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
};

export const DEMO_BILLING_OVERVIEW = {
  current_plan: 'pro',
  subscription: {
    id: 'sub_demo_pro_101',
    user_id: 'demo-user-id',
    plan: 'pro',
    provider: 'stripe',
    provider_subscription_id: 'sub_1Oq49xLkdIwHu7ixTest',
    status: 'active',
    current_period_start: new Date(Date.now() - 86400000 * 12).toISOString(),
    current_period_end: new Date(Date.now() + 86400000 * 18).toISOString(),
    cancel_at_period_end: false,
    trial_end: undefined,
    created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
  },
  usage: {
    month: new Date().toISOString().slice(0, 7),
    analyses_used: 14,
    max_analyses: -1,
    resumes_uploaded: 6,
    ai_generations_used: 8,
    can_analyze: true,
  },
  plans: [
    {
      id: 'free',
      name: 'Free',
      price_inr: 0,
      billing_interval: 'month',
      features: [
        '3 Resume Analyses / month',
        'Core ATS Compatibility Score',
        'Keyword & Skill Gap Detection',
        'Basic Formatting Review',
        'PDF Export'
      ],
      max_analyses: 3,
      allows_tailor: false,
      allows_cover_letter: false,
      allows_recruiter: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price_inr: 299,
      billing_interval: 'month',
      features: [
        'Unlimited Resume Analyses',
        'AI Resume Tailor (Side-by-Side Comparison)',
        'AI Cover Letter Generator',
        'Bullet Point Impact Polisher',
        'Target Job Keyword Optimization',
        'Priority ATS Parsing Engine'
      ],
      max_analyses: -1,
      allows_tailor: true,
      allows_cover_letter: true,
      allows_recruiter: false,
    },
    {
      id: 'recruiter',
      name: 'Recruiter',
      price_inr: 1999,
      billing_interval: 'month',
      features: [
        'Everything in Pro included',
        'Recruiter Dashboard & Multi-Job Pipeline',
        'Bulk Resume Screening (1 to 100 resumes)',
        'Automated Candidate Ranking Matrix',
        'In-depth Candidate Strengths & Gaps Profiles',
        'Bulk CSV & PDF Pipeline Reports'
      ],
      max_analyses: -1,
      allows_tailor: true,
      allows_cover_letter: true,
      allows_recruiter: true,
    }
  ],
  invoices: [
    {
      id: 'inv_101',
      invoice_number: 'INV-2026-03-8821',
      provider: 'stripe',
      amount: 299.0,
      currency: 'INR',
      status: 'paid',
      plan_name: 'Pro Plan',
      paid_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'inv_100',
      invoice_number: 'INV-2026-02-7104',
      provider: 'stripe',
      amount: 299.0,
      currency: 'INR',
      status: 'paid',
      plan_name: 'Pro Plan',
      paid_at: new Date(Date.now() - 86400000 * 42).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
    }
  ],
  payments: [
    {
      id: 'pay_101',
      provider: 'stripe',
      provider_payment_id: 'pi_3Ptest9811428',
      amount: 299.0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'card',
      failure_reason: undefined,
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    }
  ]
};



