import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { supabaseStorageAdapter } from './lib/supabaseStorageAdapter'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Customers } from './collections/Customers'
import { Orders } from './collections/Orders'
import { Messages } from './collections/Messages'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Cloud storage for uploads via Supabase Storage (REST + service-role key).
// Required on Vercel (read-only filesystem); falls back to local disk only if the
// Supabase env vars are missing.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const bucket = process.env.SUPABASE_BUCKET || 'media'
const storageEnabled = !!supabaseUrl && !!serviceKey

const storagePlugins = storageEnabled
  ? [
      cloudStoragePlugin({
        collections: {
          media: {
            adapter: supabaseStorageAdapter({ bucket, supabaseUrl, serviceKey }),
            disablePayloadAccessControl: true, // serve via Supabase's public CDN URLs
          },
        },
      }),
    ]
  : []

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ', Pitonenterprise Admin',
    },
  },
  // Log info+ to stdout so it shows up in Vercel logs.
  logger: { options: { level: 'info' } },
  // Surface EVERY error (failed deletes included) with its underlying DB cause
  // (e.g. foreign-key violations), so issues are debuggable from the Vercel logs.
  hooks: {
    afterError: [
      ({ error, collection }) => {
        const where = collection ? `collection "${collection.slug}"` : 'endpoint'
        const cause = (error as { cause?: { detail?: string; message?: string; code?: string } })?.cause
        const causeMsg = cause?.detail || cause?.message || cause?.code
        console.error(
          `[payload-error] ${where}: ${error?.name || 'Error'}: ${error?.message}` +
            (causeMsg ? ` | cause: ${causeMsg}` : '') +
            (error?.stack ? `\n${error.stack}` : ''),
        )
      },
    ],
  },
  collections: [Products, Categories, Orders, Customers, Messages, Media, Users],
  globals: [Settings],
  plugins: storagePlugins,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // Supabase session pooler caps clients (pool_size 15). Keep our pool small
      // and recycle idle connections. For high-scale serverless production, point
      // DATABASE_URI at the transaction pooler (6543). See Doc/ARCHITECTURE.md.
      max: 8,
      idleTimeoutMillis: 20_000,
    },
    // Schema is managed explicitly (already synced). Disabling dev `push` avoids
    // repeated, connection-heavy introspection on every init. To change the schema:
    // temporarily set `push: true`, restart to sync, then set back, or use migrations.
    push: false,
  }),
  // Localized content for multi-language store (see Doc/I18N.md).
  localization: {
    locales: ['en', 'hi'],
    defaultLocale: 'en',
    fallback: true,
  },
  sharp,
})
