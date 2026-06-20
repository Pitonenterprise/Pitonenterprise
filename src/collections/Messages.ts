import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

// Contact-form submissions. Saved here so nothing is lost even if the
// notification email fails. Read/managed by admins only.
export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    group: 'Shop',
  },
  access: {
    create: () => true, // public contact form
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { width: '50%' } },
        { name: 'subject', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'read', 'replied'].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })),
      admin: { position: 'sidebar' },
    },
  ],
}
