export function timeAgo(value?: string | null): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    const diff = Date.now() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
  } catch {
    return ''
  }
}
