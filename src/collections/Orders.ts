import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '../access'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'email', 'total', 'paymentStatus', 'fulfillmentStatus', 'createdAt'],
    group: 'Shop',
  },
  access: {
    // Orders are created server-side (checkout) via the Local API, which bypasses
    // access control. Direct API create is admin-only.
    create: isAdmin,
    read: isAdminOrSelf('customer'),
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.orderNumber) {
          // Human-friendly order number; uniqueness backed by the row id.
          const rand = Math.floor(Math.random() * 9000) + 1000
          data.orderNumber = `PE-${rand}`
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'orderNumber', type: 'text', admin: { width: '50%', readOnly: true } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: { description: 'Linked when the buyer is signed in (guest otherwise).' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { width: '35%' } },
            { name: 'color', type: 'text', admin: { width: '20%' } },
            { name: 'size', type: 'text', admin: { width: '15%' } },
            { name: 'quantity', type: 'number', required: true, min: 1, admin: { width: '15%' } },
            { name: 'unitPrice', type: 'number', required: true, admin: { width: '15%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'currency', type: 'text', defaultValue: 'USD', admin: { width: '20%' } },
        { name: 'subtotal', type: 'number', required: true, admin: { width: '20%' } },
        { name: 'shipping', type: 'number', defaultValue: 0, admin: { width: '20%' } },
        { name: 'tax', type: 'number', defaultValue: 0, admin: { width: '20%' } },
        { name: 'total', type: 'number', required: true, admin: { width: '20%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentProvider',
          type: 'select',
          options: [
            { label: 'Stripe', value: 'stripe' },
            { label: 'Razorpay', value: 'razorpay' },
            { label: 'Pay on Delivery', value: 'cod' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'paymentStatus',
          type: 'select',
          defaultValue: 'pending',
          options: ['pending', 'paid', 'failed', 'refunded'].map((v) => ({
            label: v[0].toUpperCase() + v.slice(1),
            value: v,
          })),
          admin: { width: '33%' },
        },
        { name: 'providerRef', type: 'text', admin: { width: '34%', description: 'Gateway payment/order id.' } },
      ],
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      defaultValue: 'processing',
      options: ['processing', 'shipped', 'delivered', 'cancelled'].map((v) => ({
        label: v[0].toUpperCase() + v.slice(1),
        value: v,
      })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', admin: { width: '50%' } },
            { name: 'state', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', type: 'text', admin: { width: '50%' } },
            { name: 'country', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}
