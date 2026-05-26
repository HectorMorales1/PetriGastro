type StorageArea = 'local' | 'session'

function getStorage(type: StorageArea): Storage {
  return type === 'session' ? sessionStorage : localStorage
}

export function safeGetItem(key: string, type: StorageArea = 'local'): string | null {
  const storage = getStorage(type)
  const val = storage.getItem(key)
  if (val === 'undefined' || val === 'null') {
    storage.removeItem(key)
    return null
  }
  return val
}

export function safeSetItem(key: string, value: string, type: StorageArea = 'local'): void {
  getStorage(type).setItem(key, value)
}

export function safeRemoveItem(key: string, type: StorageArea = 'local'): void {
  getStorage(type).removeItem(key)
}
