import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { use2048 } from './useGame'

describe('use2048', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('handles localStorage read errors gracefully', () => {
    // Mock getItem to throw an error
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage is disabled')
    })

    const { result } = renderHook(() => use2048())

    // It should catch the error and fallback to 0
    expect(result.current.best).toBe(0)
  })
})
