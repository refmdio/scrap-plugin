import type { RecordItem } from '../types'
import type { ScrapPostData } from '../types'

export function extractTags(text: string): string[] {
  const out = new Set<string>()
  const re = /(^|\s)#([A-Za-z0-9_\-]+)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    out.add(match[2])
  }
  return Array.from(out)
}

export function aggregateTags(posts: Array<RecordItem<ScrapPostData>>, limit = 50) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    const content = post.data?.content ?? ''
    for (const tag of extractTags(content)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}
