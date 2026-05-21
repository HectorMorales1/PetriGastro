export function safeGetItem(key: string): string | null {
  const val = localStorage.getItem(key)
  if (val === 'undefined' || val === 'null') {
    localStorage.removeItem(key)
    return null
  }
  return val
}
