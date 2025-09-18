export type PinMetadata = {
  isPinned: boolean
  content: string
  pinnedAt?: string
  pinnedBy?: string
}

const PIN_RE = /<!-- metadata:pinned=true:pinnedAt=(.+?):pinnedBy=(.+?) -->\r?\n?/g

export function parsePinMetadata(raw: string): PinMetadata {
  const match = PIN_RE.exec(raw)
  PIN_RE.lastIndex = 0
  if (!match) {
    return { isPinned: false, content: raw }
  }
  const [, pinnedAt, pinnedByRaw] = match
  const pinnedBy = pinnedByRaw.includes(':') ? pinnedByRaw.split(':')[0] : pinnedByRaw
  const content = raw.replace(PIN_RE, '')
  return { isPinned: true, pinnedAt, pinnedBy, content }
}

export function addPinMetadata(content: string, userId: string): string {
  const clean = removePinMetadata(content)
  const pinnedAt = new Date().toISOString()
  return `<!-- metadata:pinned=true:pinnedAt=${pinnedAt}:pinnedBy=${userId} -->\n${clean}`
}

export function removePinMetadata(content: string): string {
  return content.replace(PIN_RE, '')
}
