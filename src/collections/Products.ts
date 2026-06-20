import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '../access'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'category', 'price', 'stock', 'status'],
    group: 'Catalog',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      // Auto-assign a Product ID (SKU) on creation if none was entered.
      async ({ doc, operation, req, context }) => {
        if (operation === 'create' && !doc.sku && !(context as { skipSku?: boolean })?.skipSku) {
          await req.payload.update({
            collection: 'products',
            id: doc.id,
            data: { sku: `PE-${String(doc.id).padStart(5, '0')}` },
            overrideAccess: true,
            context: { skipSku: true },
          })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'aiAssistant',
      type: 'ui',
      admin: {
        components: {
          Field: '/admin/AIProductAssistant#AIProductAssistant',
        },
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, admin: { width: '70%' } },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Out of stock', value: 'oos' },
            { label: 'Archived', value: 'archived' },
          ],
          admin: { width: '30%' },
        },
      ],
    },
    slugField('title'),
    {
      name: 'sku',
      type: 'text',
      unique: true,
      index: true,
      label: 'Product ID (SKU)',
      admin: {
        position: 'sidebar',
        description: 'Auto-generated (e.g. PE-00001). You can override with your own code.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        rows: 6,
        description: 'Product description (the AI Assistant can write this for you).',
      },
    },
    {
      name: 'images',
      type: 'array',
      labels: { singular: 'Image', plural: 'Images' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '50%', description: 'Price in ₹ (INR). Shown to shoppers in their local currency.' },
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
          admin: { width: '50%', description: 'Original price in ₹ (for sale display).' },
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sizes',
      type: 'array',
      labels: { singular: 'Size', plural: 'Sizes' },
      admin: { description: 'Leave empty for one-size items.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'stock', type: 'number', defaultValue: 0, min: 0, admin: { width: '30%' } },
            { name: 'sku', type: 'text', admin: { width: '30%' } },
          ],
        },
      ],
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { position: 'sidebar', description: 'Total stock (used when no sizes).' },
    },
    // Attributes, power filtering + SEO content.
    {
      type: 'collapsible',
      label: 'Attributes',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'fabric', type: 'text', admin: { width: '50%' } },
            { name: 'color', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          name: 'occasions',
          type: 'select',
          hasMany: true,
          options: ['casual', 'party', 'wedding', 'festive', 'office', 'bridal'].map((v) => ({
            label: v[0].toUpperCase() + v.slice(1),
            value: v,
          })),
        },
        { name: 'pattern', type: 'text' },
        { name: 'careInstructions', type: 'text' },
      ],
    },
    {
      name: 'accentColor',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Fallback gradient/color shown when no image is set.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'badge',
      type: 'text',
      admin: { position: 'sidebar', description: 'e.g. New, Bestseller, Bridal.' },
    },
    seoField,
  ],
}
