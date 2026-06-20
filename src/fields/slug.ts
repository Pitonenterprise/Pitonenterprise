import type { Field } from 'payload'

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * A URL slug field that auto-fills from `sourceField` when left blank.
 * Stored unique + indexed; used directly in storefront routes.
 */
export function slugField(sourceField = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description: 'Auto-generated from the title if left blank. URL-safe.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.length > 0) return slugify(value)
          const source = data?.[sourceField]
          if (typeof source === 'string' && source.length > 0) return slugify(source)
          return value
        },
      ],
    },
  }
}
