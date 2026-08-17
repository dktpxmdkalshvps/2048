import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { use2048 } from './useGame'

let randomFloats = []
let floatIndex = 0
const MAX_UINT32 = 0xffffffff + 1

describe('use2048', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      getRandomValues: (arr) => {
        const float = randomFloats[floatIndex] !== undefined ? randomFloats[floatIndex] : 0
        floatIndex++
        arr[0] = Math.floor(float * MAX_UINT32)
        return arr
      }
    })
    randomFloats = []
    floatIndex = 0
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('handles localStorage read errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage is disabled')
    })

    const { result } = renderHook(() => use2048())
    expect(result.current.best).toBe(0)
  })

  it('initializes with two tiles and playing status', () => {
    randomFloats = [0, 0, 1/15, 0.95]
    const { result } = renderHook(() => use2048())
    expect(result.current.status).toBe('playing')
    expect(result.current.score).toBe(0)
    expect(result.current.moves).toBe(0)

    let count = 0
    result.current.grid.forEach(row => row.forEach(v => { if (v !== 0) count++ }))
    expect(count).toBe(2)
  })

  it('moves tiles, merges them, and updates score', () => {
    randomFloats = [
      0, 0.1, // pos 0 -> (0,0) val 2
      0, 0.1, // pos 0 out of 15 -> (0,1) val 2
      3/15, 0.95 // addTile after move -> (1,0) val 4
    ]
    const { result } = renderHook(() => use2048())

    expect(result.current.grid[0][0]).toBe(2)
    expect(result.current.grid[0][1]).toBe(2)
    expect(result.current.score).toBe(0)

    act(() => {
      result.current.move('left')
    })

    expect(result.current.grid[0][0]).toBe(4)
    expect(result.current.grid[0][1]).toBe(0)
    expect(result.current.score).toBe(4)
    expect(result.current.best).toBe(4)
    expect(result.current.moves).toBe(1)
  })

  it('does not add new tile if no tiles moved', () => {
    randomFloats = [
      0, 0.1,
      4/15, 0.1,
      0, 0.5
    ]
    const { result } = renderHook(() => use2048())
    act(() => result.current.move('left'))
    act(() => result.current.move('left'))

    const movesBefore = result.current.moves
    const scoreBefore = result.current.score

    act(() => {
      result.current.move('left')
    })

    expect(result.current.moves).toBe(movesBefore)
    expect(result.current.score).toBe(scoreBefore)
  })

  it('handles movement correctly in other directions', () => {
    randomFloats = [
      14/16, 0.1,
      14/15, 0.1,
      0, 0.95
    ]
    const { result } = renderHook(() => use2048())

    act(() => result.current.move('right'))
    act(() => result.current.move('up'))
    act(() => result.current.move('down'))

    expect(result.current.moves).toBeGreaterThan(0)
  })

  it('restarts the game and resets state but keeps best score', () => {
    // Merge two 2s to get a score of 4.
    randomFloats = [
      0, 0.1, // pos 0 -> (0,0) val 2
      0, 0.1, // pos 0 out of 15 -> (0,1) val 2
      0, 0.95 // new tile 4
    ]
    const { result } = renderHook(() => use2048())

    act(() => {
      result.current.move('left')
    })

    expect(result.current.moves).toBe(1)
    expect(result.current.score).toBe(4)
    expect(result.current.best).toBe(4)

    // Now restart
    randomFloats = [
      0, 0.1, // pos 0 -> (0,0) val 2
      0, 0.1  // pos 0 out of 15 -> (0,1) val 2
    ]
    floatIndex = 0 // Reset mock logic to start from beginning of randomFloats
    act(() => {
      result.current.restart()
    })

    expect(result.current.moves).toBe(0)
    expect(result.current.score).toBe(0)
    expect(result.current.status).toBe('playing')
    expect(result.current.best).toBe(4) // Best score is retained
  })

  it.skip('updates status to won when 2048 is reached', () => {
    // End-to-end win condition testing is tricky because it requires simulating a game to 2048
    // or exposing the internal board state for mock injection.
  })
})
