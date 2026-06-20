import type { Field } from 'payload'

// Reusable SEO field group (see Doc/SEO.md). Falls back to title/description
// at render time when these are left blank.
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    position: 'sidebar',
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      admin: { description: 'Defaults to the title. Aim for ~60 characters.' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      admin: { description: 'Aim for ~155 characters.' },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Social share image. Defaults to the first product image.' },
    },
  ],
}
