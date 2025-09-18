import type { Host } from '@refmdio/plugin-sdk'
import type { Identity } from '../types'

const STORAGE_KEY = 'refmd_anon_identity'

export async function resolveIdentity(host: Host): Promise<Identity> {
  try {
    const me = await host.api.me?.()
    if (me) {
      return {
        id: me.id ?? me.data?.id ?? 'user',
        name: me.name ?? me.data?.name ?? 'User',
      }
    }
  } catch (err) {
    console.warn('[scrap] failed to fetch identity', err)
  }

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
  }

  const rnd = Math.random().toString(36).slice(-4)
  const identity = { id: `guest:${rnd}`, name: `Guest-${rnd}` }
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(identity)) } catch {}
  }
  return identity
}
