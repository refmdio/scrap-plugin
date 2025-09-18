export function encodeBase64(value: string): string {
  try {
    return btoa(unescape(encodeURIComponent(value)))
  } catch {
    return ''
  }
}

export function decodeBase64(value: string): string {
  try {
    return decodeURIComponent(escape(atob(value)))
  } catch {
    return ''
  }
}
