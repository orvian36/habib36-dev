import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { AboutSnippet } from "@/components/home/about-snippet";
import { Certifications } from "@/components/home/certifications";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { ProofOfWork } from "@/components/home/proof-of-work";
import { InlineChatPrompt } from "@/components/home/inline-chat-prompt";
import { LatestPosts } from "@/components/home/latest-posts";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <AboutSnippet />
      <Certifications compact />
      <FeaturedProjects />
      <ProofOfWork />
      <InlineChatPrompt />
      <LatestPosts />
      <CTASection />
    </>
  );
}
