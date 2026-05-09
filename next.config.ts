import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  /* config options here */
}

export default withSentryConfig(withPayload(nextConfig), {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  disableLogger: true,
})
