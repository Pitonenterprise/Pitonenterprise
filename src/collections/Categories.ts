import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { anyone, isAdmin } from '../access'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', 'updatedAt'],
    group: 'Catalog',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Block deletion with a clear message when products still use this category
    // (instead of the raw foreign-key "Something went wrong").
    beforeDelete: [
      async ({ req, id }) => {
        const used = await req.payload.find({
          collection: 'products',
          where: { category: { equals: id } },
          limit: 0,
          depth: 0,
          overrideAccess: true,
        })
        if (used.totalDocs > 0) {
          throw new APIError(
            `Can't delete this category — ${used.totalDocs} product(s) still use it. Move or delete those products first.`,
            400,
            undefined,
            true, // public: show this message in the admin
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'aiSeo',
      type: 'ui',
      admin: { components: { Field: '/admin/AICategorySeoAssistant#AICategorySeoAssistant' } },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'accentColor',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Hex or CSS gradient used as a fallback tile background.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display order',
      admin: {
        position: 'sidebar',
        description:
          'Sets where this category appears in the lineup (homepage, menus). Lower number = shown first, e.g. 1 before 2 before 3. This is NOT the number of products. Tip: use 10, 20, 30 so you can slot new ones in between later. If two categories share the same number, the one created earlier shows first.',
      },
    },
    seoField,
  ],
}
