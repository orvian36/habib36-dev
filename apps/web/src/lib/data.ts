// ========================================
// Static data for frontend-only mode
// Will be replaced by CMS data later
// ========================================

export const siteConfig = {
  name: "Habibur Rahman",
  title: "Full-Stack Engineer & AI Builder",
  tagline: "Building production systems with LLMs, RAG pipelines, and modern web tech",
  email: "hi@habib36.dev",
  github: "https://github.com/habib36",
  linkedin: "https://linkedin.com/in/habib36",
  codeforces: "https://codeforces.com/profile/habib36",
  leetcode: "https://leetcode.com/habib36",
  codechef: "https://codechef.com/users/habib36",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" },
];

export const stats = [
  { label: "Problems Solved", value: "3000+", icon: "Code2" },
  { label: "Years Experience", value: "3+", icon: "Briefcase" },
  { label: "Projects Shipped", value: "15+", icon: "Rocket" },
  { label: "Blog Posts", value: "10+", icon: "FileText" },
];

export const skills = [
  {
    category: "Languages",
    items: [
      { name: "TypeScript", proficiency: 95 },
      { name: "Python", proficiency: 88 },
      { name: "JavaScript", proficiency: 92 },
      { name: "C++", proficiency: 80 },
      { name: "SQL", proficiency: 85 },
      { name: "Go", proficiency: 60 },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "React", proficiency: 93 },
      { name: "Next.js", proficiency: 95 },
      { name: "Tailwind CSS", proficiency: 90 },
      { name: "Framer Motion", proficiency: 82 },
      { name: "Vue.js", proficiency: 65 },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", proficiency: 92 },
      { name: "Express", proficiency: 88 },
      { name: "Payload CMS", proficiency: 85 },
      { name: "PostgreSQL", proficiency: 83 },
      { name: "Redis", proficiency: 75 },
    ],
  },
  {
    category: "AI & LLMs",
    items: [
      { name: "LangChain", proficiency: 90 },
      { name: "RAG Pipelines", proficiency: 92 },
      { name: "Weaviate", proficiency: 88 },
      { name: "Ollama", proficiency: 80 },
      { name: "OpenAI API", proficiency: 85 },
      { name: "Groq", proficiency: 82 },
    ],
  },
  {
    category: "DevOps",
    items: [
      { name: "Docker", proficiency: 88 },
      { name: "Coolify", proficiency: 80 },
      { name: "GitHub Actions", proficiency: 82 },
      { name: "Linux", proficiency: 85 },
      { name: "Nginx", proficiency: 75 },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Git", proficiency: 95 },
      { name: "VS Code", proficiency: 92 },
      { name: "Figma", proficiency: 65 },
      { name: "Postman", proficiency: 80 },
      { name: "Turborepo", proficiency: 78 },
    ],
  },
];

export const experience = [
  {
    company: "Makebell",
    role: "Full-Stack Developer",
    period: "2024 – Present",
    location: "Remote",
    description:
      "Building production RAG systems with Weaviate and LLMs. Developed a multilingual translation pipeline and natural-language-to-SQL interface. Led migration to Next.js 15 with Payload CMS.",
    tech: ["Next.js", "TypeScript", "Weaviate", "LangChain", "PostgreSQL", "Docker"],
  },
  {
    company: "Freelance",
    role: "AI & Web Developer",
    period: "2023 – 2024",
    location: "Remote",
    description:
      "Delivered 10+ client projects including AI-powered web apps, dashboard systems, and CMS-driven sites. Specialized in integrating LLM capabilities into production applications.",
    tech: ["React", "Node.js", "Python", "OpenAI", "Tailwind CSS", "MongoDB"],
  },
  {
    company: "Open Source",
    role: "Contributor",
    period: "2022 – Present",
    location: "GitHub",
    description:
      "Active open-source contributor. Built developer tools, CLI utilities, and contributed to popular frameworks. Maintained packages with combined 500+ GitHub stars.",
    tech: ["TypeScript", "Python", "Go", "GitHub Actions"],
  },
];

export const education = [
  {
    institution: "Khulna University of Engineering & Technology (KUET)",
    degree: "B.Sc. in Computer Science & Engineering",
    period: "2020 – 2024",
    cgpa: "3.42 / 4.00",
    notes: "Focus on algorithms, AI/ML, and software engineering.",
  },
];

export const achievements = [
  {
    platform: "Codeforces",
    rating: 1558,
    rank: "Specialist",
    color: "#03a89e",
    profileUrl: "https://codeforces.com/profile/habib36",
    problemsSolved: "1200+",
  },
  {
    platform: "LeetCode",
    rating: 1882,
    rank: "Knight",
    color: "#ffa116",
    profileUrl: "https://leetcode.com/habib36",
    problemsSolved: "1000+",
  },
  {
    platform: "CodeChef",
    rating: 1741,
    rank: "3-Star",
    color: "#5b4638",
    profileUrl: "https://codechef.com/users/habib36",
    problemsSolved: "800+",
  },
];

export const projects = [
  {
    slug: "rag-pipeline",
    title: "Production RAG Pipeline",
    description:
      "End-to-end RAG system with Weaviate vector search, LangChain orchestration, and Groq API for near-instant inference. Handles 100+ concurrent queries with sub-200ms latency.",
    tech: ["Weaviate", "LangChain", "Groq", "TypeScript", "Docker"],
    featured: true,
    github: "https://github.com/habib36/rag-pipeline",
    live: "https://demo.habib36.dev/rag",
    metrics: ["sub-200ms query latency", "100+ concurrent users", "95% retrieval accuracy"],
  },
  {
    slug: "traffic-signal-detection",
    title: "Traffic Signal Detection (YOLOv8)",
    description:
      "Computer vision model for real-time traffic signal detection achieving mAP@50 of 0.936. Trained on custom dataset with data augmentation pipeline.",
    tech: ["Python", "YOLOv8", "OpenCV", "PyTorch", "ONNX"],
    featured: true,
    github: "https://github.com/habib36/traffic-signal-detection",
    metrics: ["mAP@50: 0.936", "30 FPS inference", "12 signal classes"],
  },
  {
    slug: "nl-to-sql",
    title: "Natural Language to SQL",
    description:
      "AI-powered interface that converts natural language questions into optimized SQL queries. Built with LangChain agents and schema-aware prompt engineering.",
    tech: ["LangChain", "OpenAI", "PostgreSQL", "Next.js", "TypeScript"],
    featured: true,
    github: "https://github.com/habib36/nl-to-sql",
    live: "https://demo.habib36.dev/nl-sql",
    metrics: ["92% query accuracy", "Support for complex JOINs", "Schema auto-detection"],
  },
  {
    slug: "portfolio-ai",
    title: "habib36.dev (This Portfolio)",
    description:
      "Dark hacker-aesthetic portfolio with an AI chatbot that has read all my content. Built with Next.js 15, Payload CMS, and a custom RAG pipeline.",
    tech: ["Next.js", "Payload CMS", "Weaviate", "Tailwind CSS", "Framer Motion"],
    featured: true,
    github: "https://github.com/habib36/habib36.dev",
    live: "https://habib36.dev",
  },
  {
    slug: "multilingual-translation",
    title: "Multilingual Translation Pipeline",
    description:
      "Production translation system supporting 15+ languages with context-aware translation using LLMs. Integrated with CMS for automatic content localization.",
    tech: ["Python", "LangChain", "FastAPI", "Redis", "Docker"],
    github: "https://github.com/habib36/translation-pipeline",
  },
  {
    slug: "devtools-cli",
    title: "DevTools CLI",
    description:
      "Developer productivity CLI with project scaffolding, git workflow automation, and AI-assisted code review. 500+ GitHub stars.",
    tech: ["TypeScript", "Node.js", "Commander.js", "OpenAI"],
    github: "https://github.com/habib36/devtools-cli",
  },
];

export const blogPosts = [
  {
    slug: "building-rag-pipeline-weaviate",
    title: "Building a Production RAG Pipeline with Weaviate",
    excerpt:
      "A deep dive into how I built a RAG system that handles 100+ concurrent queries with sub-200ms latency, using Weaviate for hybrid search and Groq for inference.",
    category: "Deep Technical",
    tags: ["RAG", "Weaviate", "LangChain", "AI"],
    date: "2026-03-15",
    readingTime: "12 min",
  },
  {
    slug: "nextjs-payload-cms-guide",
    title: "Next.js 15 + Payload CMS: The Complete Setup Guide",
    excerpt:
      "Step-by-step guide to embedding Payload CMS inside a Next.js 15 app with the App Router, including collections, access control, and deployment.",
    category: "Tutorial",
    tags: ["Next.js", "Payload CMS", "TypeScript"],
    date: "2026-02-28",
    readingTime: "8 min",
  },
  {
    slug: "competitive-programming-journey",
    title: "From Zero to 3000+ Problems: My CP Journey",
    excerpt:
      "How solving 3000+ competitive programming problems shaped my engineering thinking, and what I'd do differently if starting over.",
    category: "Career",
    tags: ["Competitive Programming", "Codeforces", "LeetCode"],
    date: "2026-02-10",
    readingTime: "6 min",
  },
  {
    slug: "nl-to-sql-langchain",
    title: "Natural Language to SQL with LangChain Agents",
    excerpt:
      "Building an AI interface that converts English questions into optimized SQL queries using LangChain agents and schema-aware prompting.",
    category: "Deep Technical",
    tags: ["LangChain", "SQL", "AI", "NLP"],
    date: "2026-01-20",
    readingTime: "15 min",
  },
  {
    slug: "why-every-portfolio-needs-ai",
    title: "Why Every Developer Portfolio Needs an AI Chatbot in 2026",
    excerpt:
      "Portfolio sites are stuck in 2020. Here's why adding a RAG-powered chatbot is the strongest differentiator for developers right now.",
    category: "Opinion",
    tags: ["AI", "Portfolio", "Career"],
    date: "2026-01-05",
    readingTime: "5 min",
  },
];

export const certifications = [
  {
    title: "Meta Full-Stack Engineer Professional Certificate",
    issuer: "Meta",
    platform: "Coursera",
    date: "2025-06",
    url: "https://coursera.org/verify/professional-cert/example1",
  },
  {
    title: "Machine Learning Specialization",
    issuer: "DeepLearning.AI & Stanford",
    platform: "Coursera",
    date: "2024-12",
    url: "https://coursera.org/verify/specialization/example2",
  },
  {
    title: "LangChain for LLM Application Development",
    issuer: "DeepLearning.AI",
    platform: "Coursera",
    date: "2024-09",
    url: "https://coursera.org/verify/example3",
  },
  {
    title: "Docker & Kubernetes: The Complete Guide",
    issuer: "Stephen Grider",
    platform: "Udemy",
    date: "2024-06",
    url: "https://udemy.com/certificate/example4",
  },
  {
    title: "Next.js & React - The Complete Guide",
    issuer: "Maximilian Schwarzmüller",
    platform: "Udemy",
    date: "2024-03",
    url: "https://udemy.com/certificate/example5",
  },
  {
    title: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services",
    platform: "AWS",
    date: "2024-01",
    url: "https://aws.amazon.com/verification/example6",
  },
];
