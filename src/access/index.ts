import type { Access, FieldAccess } from 'payload'

// Public read.
export const anyone: Access = () => true

// Any signed-in admin/staff user (the `users` collection).
export const isAdmin: Access = ({ req }) => req.user?.collection === 'users'

export const isAdminField: FieldAccess = ({ req }) => req.user?.collection === 'users'

// Admins see everything; a customer may only read their own documents
// (matched by the `customer` relationship on the doc).
export const isAdminOrSelf =
  (ownerField = 'customer'): Access =>
  ({ req }) => {
    const user = req.user
    if (!user) return false
    if (user.collection === 'users') return true
    if (user.collection === 'customers') {
      return { [ownerField]: { equals: user.id } }
    }
    return false
  }

// Admins or the authenticated customer themselves (for the customers collection).
export const isAdminOrCustomerSelf: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.collection === 'users') return true
  if (user.collection === 'customers') return { id: { equals: user.id } }
  return false
}
