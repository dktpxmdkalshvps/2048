import { describe, it, expect } from 'vitest'
import { slideLeft } from './useGame'

describe('slideLeft', () => {
  it('handles empty rows', () => {
    const { row, merged } = slideLeft([0, 0, 0, 0])
    expect(row).toEqual([0, 0, 0, 0])
    expect(merged.size).toBe(0)
  })

  it('handles rows with no merges', () => {
    const { row, merged } = slideLeft([2, 4, 8, 16])
    expect(row).toEqual([2, 4, 8, 16])
    expect(merged.size).toBe(0)
  })

  it('handles single merge', () => {
    const { row, merged } = slideLeft([2, 2, 4, 8])
    expect(row).toEqual([4, 4, 8, 0])
    expect(merged.size).toBe(1)
    expect(merged.has(0)).toBe(true) // The merge happens at index 0 of the non-zero array
  })

  it('handles double merge', () => {
    const { row, merged } = slideLeft([2, 2, 2, 2])
    expect(row).toEqual([4, 4, 0, 0])
    expect(merged.size).toBe(2)
    expect(merged.has(0)).toBe(true)
    expect(merged.has(2)).toBe(true)
  })

  it('handles merges across zeros', () => {
    const { row, merged } = slideLeft([2, 0, 2, 0])
    expect(row).toEqual([4, 0, 0, 0])
    expect(merged.size).toBe(1)
    expect(merged.has(0)).toBe(true)
  })

  it('prevents double merging in a single swipe', () => {
    const { row, merged } = slideLeft([4, 2, 2, 0])
    expect(row).toEqual([4, 4, 0, 0]) // Not [8, 0, 0, 0]
    expect(merged.size).toBe(1)
    expect(merged.has(1)).toBe(true)
  })
})
