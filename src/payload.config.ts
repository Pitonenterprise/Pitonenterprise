import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Pitonenterprise Admin',
    },
  },
  collections: [Products, Categories, Orders, Customers, Messages, Media, Users],
  globals: [Settings],
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
    // temporarily set `push: true`, restart to sync, then set back — or use migrations.
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
