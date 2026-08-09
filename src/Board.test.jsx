import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Board from './Board'

// Mock the Tile component to easily inspect props passed to it
vi.mock('./Tile', () => {
  return {
    default: ({ value, isNew, isMerged }) => (
      <div data-testid="mock-tile" data-value={value} data-is-new={isNew} data-is-merged={isMerged}>
        {value}
      </div>
    )
  }
})

describe('Board Component', () => {
  const emptyGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]

  it('renders a 4x4 grid of tiles', () => {
    render(<Board grid={emptyGrid} />)
    const tiles = screen.getAllByTestId('mock-tile')
    expect(tiles).toHaveLength(16)
  })

  it('passes correct values to tiles', () => {
    const gridWithValue = [
      [2, 0, 4, 0],
      [0, 8, 0, 16],
      [32, 0, 64, 0],
      [0, 128, 0, 256],
    ]
    render(<Board grid={gridWithValue} />)
    const tiles = screen.getAllByTestId('mock-tile')

    expect(tiles[0].getAttribute('data-value')).toBe('2')
    expect(tiles[2].getAttribute('data-value')).toBe('4')
    expect(tiles[5].getAttribute('data-value')).toBe('8')
    expect(tiles[7].getAttribute('data-value')).toBe('16')
    expect(tiles[8].getAttribute('data-value')).toBe('32')
    expect(tiles[10].getAttribute('data-value')).toBe('64')
    expect(tiles[13].getAttribute('data-value')).toBe('128')
    expect(tiles[15].getAttribute('data-value')).toBe('256')
  })

  it('passes isNew as true only to the tile at newTilePos', () => {
    const newTilePos = [1, 2] // row 1, col 2 (0-indexed)
    render(<Board grid={emptyGrid} newTilePos={newTilePos} />)

    const tiles = screen.getAllByTestId('mock-tile')

    // The tile at [1, 2] is index 1 * 4 + 2 = 6
    expect(tiles[6].getAttribute('data-is-new')).toBe('true')

    // Verify other tiles do not have isNew true
    expect(tiles[0].getAttribute('data-is-new')).toBe('false')
    expect(tiles[5].getAttribute('data-is-new')).toBe('false')
    expect(tiles[7].getAttribute('data-is-new')).toBe('false')
  })

  it('passes isNew as false when newTilePos is undefined', () => {
    render(<Board grid={emptyGrid} />)
    const tiles = screen.getAllByTestId('mock-tile')

    tiles.forEach((tile) => {
      expect(tile.getAttribute('data-is-new')).toBe('false')
    })
  })

  it('always passes isMerged as false', () => {
    render(<Board grid={emptyGrid} />)
    const tiles = screen.getAllByTestId('mock-tile')

    tiles.forEach((tile) => {
      expect(tile.getAttribute('data-is-merged')).toBe('false')
    })
  })
})
