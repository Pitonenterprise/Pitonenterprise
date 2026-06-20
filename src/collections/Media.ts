import type { CollectionConfig } from 'payload'

// Uploaded media (product images, etc.). Stored locally for now; a Supabase Storage
// (S3-compatible) adapter will be wired in a later phase, see Doc/DATA_MODEL.md.
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Catalog',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text',
      // Important for SEO + accessibility (see Doc/SEO.md).
      required: true,
      localized: true,
    },
  ],
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'feature', width: 1200, height: 1600, position: 'centre' },
    ],
    mimeTypes: ['image/*'],
  },
}
