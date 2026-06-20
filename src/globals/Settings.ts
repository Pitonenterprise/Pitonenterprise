import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '../access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: { group: 'Settings' },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      name: 'heroImages',
      type: 'array',
      label: 'Hero Images (slideshow)',
      admin: {
        description: 'Upload 10-15 images. They crossfade every 2 seconds in the homepage hero box. Portrait (3:4) works best.',
      },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    // Deprecated single hero image — kept (hidden) only to preserve the DB column and
    // avoid a destructive schema change. Use "Hero Images" above instead.
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        { name: 'storeName', type: 'text', defaultValue: 'Piton Enterprise', admin: { width: '50%' } },
        { name: 'supportEmail', type: 'email', admin: { width: '50%' } },
      ],
    },
    { name: 'whatsapp', type: 'text', admin: { description: 'WhatsApp number with country code.' } },
    {
      type: 'collapsible',
      label: 'Commerce',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'baseCurrency', type: 'text', defaultValue: 'USD', admin: { width: '33%' } },
            { name: 'freeShippingThreshold', type: 'number', defaultValue: 150, admin: { width: '33%', description: 'In base currency.' } },
            { name: 'flatShipping', type: 'number', defaultValue: 12, admin: { width: '34%' } },
          ],
        },
        { name: 'taxRate', type: 'number', defaultValue: 0, admin: { description: 'Percent, e.g. 5 for 5%.' } },
        {
          name: 'supportedCurrencies',
          type: 'select',
          hasMany: true,
          defaultValue: ['USD', 'EUR', 'GBP', 'INR'],
          options: ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'AED'].map((c) => ({ label: c, value: c })),
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Social',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'pinterest', type: 'text' },
      ],
    },
  ],
}
