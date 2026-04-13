import { getPayload } from 'payload'
import config from '@payload-config'

const projectsData = [
  {
    slug: 'rag-pipeline',
    title: 'Production RAG Pipeline',
    description:
      'End-to-end RAG system with Weaviate vector search, LangChain orchestration, and Groq API for near-instant inference. Handles 100+ concurrent queries with sub-200ms latency.',
    tech: ['Weaviate', 'LangChain', 'Groq', 'TypeScript', 'Docker'],
    featured: true,
    github: 'https://github.com/habib36/rag-pipeline',
    live: 'https://demo.habib36.dev/rag',
    metrics: ['sub-200ms query latency', '100+ concurrent users', '95% retrieval accuracy'],
  },
  {
    slug: 'traffic-signal-detection',
    title: 'Traffic Signal Detection (YOLOv8)',
    description:
      'Computer vision model for real-time traffic signal detection achieving mAP@50 of 0.936. Trained on custom dataset with data augmentation pipeline.',
    tech: ['Python', 'YOLOv8', 'OpenCV', 'PyTorch', 'ONNX'],
    featured: true,
    github: 'https://github.com/habib36/traffic-signal-detection',
    metrics: ['mAP@50: 0.936', '30 FPS inference', '12 signal classes'],
  },
  {
    slug: 'nl-to-sql',
    title: 'Natural Language to SQL',
    description:
      'AI-powered interface that converts natural language questions into optimized SQL queries. Built with LangChain agents and schema-aware prompt engineering.',
    tech: ['LangChain', 'OpenAI', 'PostgreSQL', 'Next.js', 'TypeScript'],
    featured: true,
    github: 'https://github.com/habib36/nl-to-sql',
    live: 'https://demo.habib36.dev/nl-sql',
    metrics: ['92% query accuracy', 'Support for complex JOINs', 'Schema auto-detection'],
  },
  {
    slug: 'portfolio-ai',
    title: 'habib36.dev (This Portfolio)',
    description:
      'Dark hacker-aesthetic portfolio with an AI chatbot that has read all my content. Built with Next.js 15, Payload CMS, and a custom RAG pipeline.',
    tech: ['Next.js', 'Payload CMS', 'Weaviate', 'Tailwind CSS', 'Framer Motion'],
    featured: true,
    github: 'https://github.com/habib36/habib36.dev',
    live: 'https://habib36.dev',
  },
  {
    slug: 'multilingual-translation',
    title: 'Multilingual Translation Pipeline',
    description:
      'Production translation system supporting 15+ languages with context-aware translation using LLMs. Integrated with CMS for automatic content localization.',
    tech: ['Python', 'LangChain', 'FastAPI', 'Redis', 'Docker'],
    github: 'https://github.com/habib36/translation-pipeline',
  },
  {
    slug: 'devtools-cli',
    title: 'DevTools CLI',
    description:
      'Developer productivity CLI with project scaffolding, git workflow automation, and AI-assisted code review. 500+ GitHub stars.',
    tech: ['TypeScript', 'Node.js', 'Commander.js', 'OpenAI'],
    github: 'https://github.com/habib36/devtools-cli',
  },
]

const postsData = [
  {
    slug: 'building-rag-pipeline-weaviate',
    title: 'Building a Production RAG Pipeline with Weaviate',
    excerpt:
      'A deep dive into how I built a RAG system that handles 100+ concurrent queries with sub-200ms latency, using Weaviate for hybrid search and Groq for inference.',
    category: 'Deep Technical' as const,
    tags: ['RAG', 'Weaviate', 'LangChain', 'AI'],
    publishedAt: '2026-03-15',
    readingTime: '12 min',
  },
  {
    slug: 'nextjs-payload-cms-guide',
    title: 'Next.js 15 + Payload CMS: The Complete Setup Guide',
    excerpt:
      'Step-by-step guide to embedding Payload CMS inside a Next.js 15 app with the App Router, including collections, access control, and deployment.',
    category: 'Tutorial' as const,
    tags: ['Next.js', 'Payload CMS', 'TypeScript'],
    publishedAt: '2026-02-28',
    readingTime: '8 min',
  },
  {
    slug: 'competitive-programming-journey',
    title: 'From Zero to 3000+ Problems: My CP Journey',
    excerpt:
      "How solving 3000+ competitive programming problems shaped my engineering thinking, and what I'd do differently if starting over.",
    category: 'Career' as const,
    tags: ['Competitive Programming', 'Codeforces', 'LeetCode'],
    publishedAt: '2026-02-10',
    readingTime: '6 min',
  },
  {
    slug: 'nl-to-sql-langchain',
    title: 'Natural Language to SQL with LangChain Agents',
    excerpt:
      'Building an AI interface that converts English questions into optimized SQL queries using LangChain agents and schema-aware prompting.',
    category: 'Deep Technical' as const,
    tags: ['LangChain', 'SQL', 'AI', 'NLP'],
    publishedAt: '2026-01-20',
    readingTime: '15 min',
  },
  {
    slug: 'why-every-portfolio-needs-ai',
    title: 'Why Every Developer Portfolio Needs an AI Chatbot in 2026',
    excerpt:
      "Portfolio sites are stuck in 2020. Here's why adding a RAG-powered chatbot is the strongest differentiator for developers right now.",
    category: 'Opinion' as const,
    tags: ['AI', 'Portfolio', 'Career'],
    publishedAt: '2026-01-05',
    readingTime: '5 min',
  },
]

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const results: string[] = []

    // Create admin user
    const existingUsers = await payload.find({ collection: 'users', limit: 1 })
    if (existingUsers.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@habib36.dev',
          password: 'changeme123',
        },
      })
      results.push('Created admin user: admin@habib36.dev / changeme123')
    } else {
      results.push('Admin user already exists')
    }

    // Seed projects
    const existingProjects = await payload.find({ collection: 'projects', limit: 1 })
    if (existingProjects.totalDocs === 0) {
      for (const project of projectsData) {
        await payload.create({
          collection: 'projects',
          data: {
            title: project.title,
            slug: project.slug,
            description: project.description,
            featured: project.featured ?? false,
            tech: project.tech.map((name) => ({ name })),
            metrics: project.metrics?.map((value) => ({ value })) ?? [],
            github: project.github,
            live: project.live,
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: project.description, version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
            _status: 'published',
          },
        })
        results.push(`Created project: ${project.title}`)
      }
    } else {
      results.push('Projects already seeded')
    }

    // Seed posts
    const existingPosts = await payload.find({ collection: 'posts', limit: 1 })
    if (existingPosts.totalDocs === 0) {
      for (const post of postsData) {
        await payload.create({
          collection: 'posts',
          data: {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            category: post.category,
            tags: post.tags.map((tag) => ({ tag })),
            readingTime: post.readingTime,
            publishedAt: post.publishedAt,
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: post.excerpt, version: 1 }],
                    version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Full article content will be written here. This is placeholder content managed via Payload CMS admin panel.',
                        version: 1,
                      },
                    ],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
            _status: 'published',
          },
        })
        results.push(`Created post: ${post.title}`)
      }
    } else {
      results.push('Posts already seeded')
    }

    return Response.json({ success: true, results })
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
