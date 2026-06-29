import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '../access'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

// Themed/seasonal groupings (e.g. Diwali, Holi, Bridal, New Arrivals). Unlike a category
// (the garment type, one per product), a product can appear in MANY collections, and a
// collection mixes products from across categories.
export const Collections: CollectionConfig = {
  slug: 'collections',
  labels: { singular: 'Collection', plural: 'Collections' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', 'updatedAt'],
    group: 'Catalog',
    description: 'Themed/seasonal edits (e.g. Diwali, Bridal). Assign products to a collection on the product page.',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, admin: { description: 'e.g. "Diwali Edit"' } },
    slugField('title'),
    { name: 'description', type: 'textarea', localized: true, admin: { description: 'Intro copy shown on the collection page (good for SEO).' } },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Banner / thumbnail for the collection.' } },
    {
      type: 'row',
      fields: [
        { name: 'featured', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Show on the homepage.' } },
        { name: 'order', type: 'number', defaultValue: 0, admin: { width: '50%', description: 'Lower shows first.' } },
      ],
    },
    seoField,
  ],
}
