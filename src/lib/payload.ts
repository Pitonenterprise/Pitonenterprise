import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

// getPayload() already dedupes/caches its own instance internally, so we just
// proxy to it. (Avoid caching under a custom global — Payload reserves `_payload`.)
export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config })
}
