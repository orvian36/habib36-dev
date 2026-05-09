import {
  GitFork,
  Link2,
  Mail,
  Code2,
  Trophy,
  MapPin,
} from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/ui/section-heading'
import { siteConfig } from '@/lib/data'
import { ContactForm } from './contact-form'

const socialLinks = [
  { icon: GitFork, label: 'GitHub', href: siteConfig.github, handle: '@habib36' },
  { icon: Link2, label: 'LinkedIn', href: siteConfig.linkedin, handle: '/in/habib36' },
  { icon: Code2, label: 'LeetCode', href: siteConfig.leetcode, handle: 'habib36' },
  { icon: Trophy, label: 'Codeforces', href: siteConfig.codeforces, handle: 'habib36' },
  { icon: Mail, label: 'Email', href: `mailto:${siteConfig.email}`, handle: siteConfig.email },
]

export default async function ContactPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Contact' } },
    limit: 1,
    depth: 1,
  })
  const form = docs[0] ?? null

  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Contact"
          title="Get in Touch"
          description="Have a project idea, want to collaborate, or just want to say hi? I'd love to hear from you."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            {form ? (
              <ContactForm form={form} />
            ) : (
              <div className="card-surface p-6">
                <p className="text-sm text-text-secondary mb-4">
                  Contact form not yet configured. Email me directly:
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-mono text-sm text-accent-blue hover:underline"
                >
                  {siteConfig.email}
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card-surface p-6">
              <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-4">
                Let&apos;s Connect
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                I&apos;m currently open to freelance projects, full-time opportunities, and
                interesting collaborations in AI and full-stack development.
              </p>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4 text-text-muted" />
                Bangladesh (UTC+6)
              </div>
              <div className="flex items-center gap-2 text-sm text-accent-green mt-2">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                Available for new projects
              </div>
            </div>

            <div className="card-surface p-6">
              <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-4">
                Find Me Online
              </h3>
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-accent-blue/5 transition-all group"
                  >
                    <link.icon className="w-5 h-5 text-text-muted group-hover:text-accent-blue transition-colors" />
                    <div>
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-xs text-text-muted">{link.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
