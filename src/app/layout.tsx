import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ClientShell } from "@/components/layout/client-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Habibur Rahman — Full-Stack Engineer & AI Builder",
    template: "%s | habib36.dev",
  },
  description:
    "Full-stack engineer building production AI systems with RAG pipelines, LLMs, and modern web tech. 3000+ competitive programming problems solved.",
  keywords: [
    "Habibur Rahman",
    "Full-Stack Developer",
    "AI Engineer",
    "RAG Pipeline",
    "Next.js",
    "Portfolio",
  ],
  authors: [{ name: "Habibur Rahman" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://habib36.dev",
    siteName: "habib36.dev",
    title: "Habibur Rahman — Full-Stack Engineer & AI Builder",
    description:
      "Full-stack engineer building production AI systems. This portfolio features an AI chatbot powered by RAG.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habibur Rahman — Full-Stack Engineer & AI Builder",
    description:
      "Full-stack engineer building production AI systems with RAG pipelines, LLMs, and modern web tech.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
