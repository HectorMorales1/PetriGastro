import { describe, it, expect, beforeEach } from 'vitest'
import { safeGetItem, safeSetItem, safeRemoveItem } from './storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('safeSetItem', () => {
    it('stores value in localStorage by default', () => {
      safeSetItem('test_key', 'test_value')
      expect(localStorage.getItem('petri_test_key')).toBe('test_value')
    })

    it('stores value in sessionStorage', () => {
      safeSetItem('test_key', 'session_value', 'session')
      expect(sessionStorage.getItem('petri_test_key')).toBe('session_value')
    })

    it('handles empty values', () => {
      safeSetItem('test_key', '')
      expect(localStorage.getItem('petri_test_key')).toBe('')
    })
  })

  describe('safeGetItem', () => {
    it('retrieves value from localStorage by default', () => {
      localStorage.setItem('petri_test_key', 'stored_value')
      expect(safeGetItem('test_key')).toBe('stored_value')
    })

    it('retrieves value from sessionStorage', () => {
      sessionStorage.setItem('petri_test_key', 'session_stored')
      expect(safeGetItem('test_key', 'session')).toBe('session_stored')
    })

    it('returns null for missing key', () => {
      expect(safeGetItem('nonexistent')).toBeNull()
    })
  })

  describe('safeRemoveItem', () => {
    it('removes value from localStorage by default', () => {
      localStorage.setItem('petri_test_key', 'value')
      safeRemoveItem('test_key')
      expect(localStorage.getItem('petri_test_key')).toBeNull()
    })

    it('removes value from sessionStorage', () => {
      sessionStorage.setItem('petri_test_key', 'value')
      safeRemoveItem('test_key', 'session')
      expect(sessionStorage.getItem('petri_test_key')).toBeNull()
    })
  })
})
