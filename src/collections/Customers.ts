import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { isAdmin, isAdminOrCustomerSelf } from '../access'

// Storefront customer accounts — separate auth from admin `users`.
// Email OTP verification: accounts start unverified and cannot sign in until they
// confirm a 6-digit code (see src/app/api/auth/*). Code is stored hashed.
export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'isVerified', 'createdAt'],
    group: 'Shop',
  },
  access: {
    create: () => true, // public registration
    read: isAdminOrCustomerSelf,
    update: isAdminOrCustomerSelf,
    delete: isAdmin,
    admin: () => false, // customers cannot access the admin panel
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (!(user as { isVerified?: boolean }).isVerified) {
          // Recognizable code so the login UI can route to the OTP screen.
          throw new APIError('ACCOUNT_NOT_VERIFIED', 403, undefined, true)
        }
      },
    ],
  },
  fields: [
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Email confirmed via OTP.' },
    },
    // OTP state — server-managed, hidden from the admin UI.
    { name: 'otpHash', type: 'text', admin: { hidden: true } },
    { name: 'otpExpiresAt', type: 'date', admin: { hidden: true } },
    { name: 'otpAttempts', type: 'number', defaultValue: 0, admin: { hidden: true } },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', admin: { width: '50%' } },
        { name: 'lastName', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'phone', type: 'text' },
    {
      name: 'addresses',
      type: 'array',
      labels: { singular: 'Address', plural: 'Addresses' },
      fields: [
        { name: 'label', type: 'text', admin: { description: 'e.g. Home, Office' } },
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'state', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'country', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'wishlist',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { description: 'Saved products.' },
    },
    {
      name: 'cart',
      type: 'array',
      admin: { description: 'Saved cart — synced across devices.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'product', type: 'relationship', relationTo: 'products', admin: { width: '60%' } },
            { name: 'size', type: 'text', admin: { width: '20%' } },
            { name: 'quantity', type: 'number', defaultValue: 1, min: 1, admin: { width: '20%' } },
          ],
        },
      ],
    },
  ],
}
