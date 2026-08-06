import React from 'react'
import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Tile from './Tile'

describe('Tile Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders an empty tile correctly', () => {
    const { container } = render(<Tile value={0} />)
    const tileDiv = container.firstChild
    expect(tileDiv).toHaveClass('bg-[#0c0c0c]')
    // `value !== 0 ? value : ''` means it renders empty for 0
    expect(tileDiv.textContent).toBe('')
  })

  it('renders a basic value correctly', () => {
    const { container } = render(<Tile value={2} />)
    const tileDiv = container.firstChild
    expect(tileDiv).toHaveClass('bg-[#141414]')
    expect(tileDiv.textContent).toBe('2')
  })

  it('applies correct font size for values < 128', () => {
    const { container } = render(<Tile value={64} />)
    expect(container.firstChild).toHaveClass('text-3xl sm:text-4xl')
  })

  it('applies correct font size for 128 <= values < 1024', () => {
    const { container } = render(<Tile value={256} />)
    expect(container.firstChild).toHaveClass('text-2xl sm:text-3xl')
  })

  it('applies correct font size for values >= 1024', () => {
    const { container } = render(<Tile value={1024} />)
    expect(container.firstChild).toHaveClass('text-xl sm:text-2xl')
  })

  it('uses fallback styling for values missing in TILE_STYLES (e.g. 4096)', () => {
    const { container } = render(<Tile value={4096} />)
    const tileDiv = container.firstChild
    // Fallback is 2048: ['bg-[#24200a]', 'text-[#f0d030]', 'border-[#504010]']
    expect(tileDiv).toHaveClass('bg-[#24200a]')
    expect(tileDiv).toHaveClass('text-[#f0d030]')
    expect(tileDiv).toHaveClass('border-[#504010]')
  })

  it('applies animate-pop when isMerged is true and value !== 0, and removes it after 150ms', () => {
    const { container } = render(<Tile value={4} isMerged={true} />)
    const tileDiv = container.firstChild
    expect(tileDiv).toHaveClass('animate-pop')

    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(tileDiv).not.toHaveClass('animate-pop')
  })

  it('does not apply animate-pop when isMerged is true but value === 0', () => {
    const { container } = render(<Tile value={0} isMerged={true} />)
    const tileDiv = container.firstChild
    expect(tileDiv).not.toHaveClass('animate-pop')
  })

  it('applies animate-appear when isNew is true and value !== 0, and removes it after 140ms', () => {
    const { container } = render(<Tile value={2} isNew={true} />)
    const tileDiv = container.firstChild
    expect(tileDiv).toHaveClass('animate-appear')

    act(() => {
      vi.advanceTimersByTime(140)
    })

    expect(tileDiv).not.toHaveClass('animate-appear')
  })

  it('does not apply animate-appear when isNew is true but value === 0', () => {
    const { container } = render(<Tile value={0} isNew={true} />)
    const tileDiv = container.firstChild
    expect(tileDiv).not.toHaveClass('animate-appear')
  })
})
