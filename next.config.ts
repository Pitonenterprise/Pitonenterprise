import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'htxnycxfsbnoegfyvqhw.supabase.co',
      },
    ],
  },
}

export default withPayload(nextConfig)
