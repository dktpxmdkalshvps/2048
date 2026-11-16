import { describe, expect, it } from 'vitest'
import { slideLeft } from './useGame'

describe('slideLeft edge cases', () => {
  it.each([
    { input: [0, 0, 0, 0], output: [0, 0, 0, 0], merged: [] },
    { input: [2, 4, 8, 16], output: [2, 4, 8, 16], merged: [] },
    { input: [2, 2, 4, 8], output: [4, 4, 8, 0], merged: [0] },
    { input: [2, 2, 2, 2], output: [4, 4, 0, 0], merged: [0, 1] },
    { input: [2, 0, 2, 0], output: [4, 0, 0, 0], merged: [0] },
    { input: [4, 2, 2, 0], output: [4, 4, 0, 0], merged: [1] },
    { input: [2, 2, 4, 4], output: [4, 8, 0, 0], merged: [0, 1] },
    { input: [2, 2, 4, 0], output: [4, 4, 0, 0], merged: [0] },
  ])('slides $input into $output without chain-merging', ({ input, output, merged }) => {
    const original = [...input]
    const result = slideLeft(input)
    expect(result.row).toEqual(output)
    expect(result.merged).toEqual(merged)
    expect(input).toEqual(original)
  })
})
