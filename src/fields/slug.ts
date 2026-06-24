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
 * A read-only URL slug field. Auto-generated from `sourceField` on creation, then kept
 * stable (so existing URLs don't break if the title is renamed). Unique + indexed.
 */
export function slugField(sourceField = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      readOnly: true,
      description: 'Auto-generated from the title and used in the URL. Stays the same if you rename later.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          // Keep an existing slug stable (don't change it when the title is edited).
          if (typeof value === 'string' && value.length > 0) return slugify(value)
          const source = data?.[sourceField]
          if (typeof source === 'string' && source.length > 0) return slugify(source)
          return value
        },
      ],
    },
  }
}
