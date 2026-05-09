import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { AboutSnippet } from "@/components/home/about-snippet";
import { Certifications } from "@/components/home/certifications";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { ProofOfWork } from "@/components/home/proof-of-work";
import { InlineChatPrompt } from "@/components/home/inline-chat-prompt";
import { LatestPosts } from "@/components/home/latest-posts";
import { CTASection } from "@/components/home/cta-section";
import { getPayloadClient } from "@/lib/payload";

export default async function HomePage() {
  const payload = await getPayloadClient();

  const [projectsResult, postsResult] = await Promise.all([
    payload.find({
      collection: "projects",
      where: { _status: { equals: "published" } },
      limit: 20,
      sort: "-createdAt",
    }),
    payload.find({
      collection: "posts",
      where: { _status: { equals: "published" } },
      limit: 3,
      sort: "-publishedAt",
    }),
  ]);

  const projects = projectsResult.docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    tech: (doc.tech ?? []).map((t: { name: string } | string) => (typeof t === "object" ? t.name : t)),
    featured: doc.featured ?? false,
    github: doc.github ?? undefined,
    live: doc.live ?? undefined,
    metrics: (doc.metrics ?? []).map((m: { value: string } | string) =>
      typeof m === "object" ? m.value : m
    ),
  }));

  const posts = postsResult.docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    date: doc.publishedAt ?? doc.createdAt,
    readingTime: doc.readingTime ?? "5 min",
  }));

  return (
    <>
      <HeroSection />
      <StatsBar />
      <AboutSnippet />
      <Certifications compact />
      <FeaturedProjects projects={projects} />
      <ProofOfWork />
      <InlineChatPrompt />
      <LatestPosts posts={posts} />
      <CTASection />
    </>
  );
}
