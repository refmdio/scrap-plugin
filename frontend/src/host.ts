import type { Host, ExecResult } from '@refmdio/plugin-sdk'

export type ExecContext = {
  host?: Host
  payload?: any
}

export type CanOpenContext = {
  host?: Host
  token?: string | null
}

export async function canOpen(docId: string, ctx: CanOpenContext = {}): Promise<boolean> {
  try {
    if (typeof ctx.host?.api?.getKv !== 'function') {
      throw new Error('host.api.getKv not available')
    }
    const result = await ctx.host.api.getKv('scrap', docId, 'meta', ctx.token ?? undefined)
    const value = result?.value
    return Boolean(value && (value.isScrap ?? value.is_scrap))
  } catch (err) {
    console.warn('[scrap] canOpen check failed', err)
    return false
  }
}

export async function getRoute(docId: string, ctx: { token?: string | null } = {}): Promise<string> {
  const qs = ctx.token ? `?token=${encodeURIComponent(ctx.token)}` : ''
  return `/scrap/${docId}${qs}`
}

export async function exec(action: string, { host, payload }: ExecContext = {}): Promise<ExecResult> {
  try {
    const call = host?.exec ?? host?.api?.exec
    if (typeof call === 'function') {
      const response = await call(action, payload ?? {})
      return response ?? { ok: false, error: { code: 'EMPTY_RESPONSE' } }
    }
    return { ok: false, error: { code: 'EXEC_NOT_AVAILABLE' } }
  } catch (err: any) {
    return { ok: false, error: { code: 'EXEC_ERROR', message: String(err?.message ?? err) } }
  }
}
