import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Board from './Board'

const grid = [
  [4, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]

describe('Board merge animation regression', () => {
  it('animates a merged tile when its coordinate is marked', async () => {
    render(
      <Board
        grid={grid}
        newTilePos={null}
        mergedPositions={new Set(['0,0'])}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('4').closest('.tile').className).toContain('animate-pop')
    })
  })

  it('does not animate a tile without a merge marker', () => {
    render(
      <Board
        grid={grid}
        newTilePos={null}
        mergedPositions={new Set()}
      />,
    )

    expect(screen.getByText('4').closest('.tile').className).not.toContain('animate-pop')
  })

  it('preserves the new tile appearance animation', async () => {
    render(
      <Board
        grid={grid}
        newTilePos={[0, 0]}
        mergedPositions={new Set()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('4').closest('.tile').className).toContain('animate-appear')
    })
  })
})
