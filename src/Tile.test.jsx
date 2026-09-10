import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Tile from './Tile'

describe('Tile Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Value Rendering', () => {
    it('renders empty text when value is 0', () => {
      const { container } = render(<Tile value={0} />)
      const span = container.querySelector('span')
      expect(span).toHaveTextContent('')
    })

    it('renders number string when value is non-zero', () => {
      render(<Tile value={2} />)
      expect(screen.getByText('2')).toBeInTheDocument()

      render(<Tile value={2048} />)
      expect(screen.getByText('2048')).toBeInTheDocument()
    })
  })

  describe('Font Sizing', () => {
    it('applies text-3xl sm:text-4xl for values < 128', () => {
      const { container } = render(<Tile value={64} />)
      const tileDiv = container.firstChild
      expect(tileDiv).toHaveClass('text-3xl', 'sm:text-4xl')
    })

    it('applies text-2xl sm:text-3xl for values >= 128 and < 1024', () => {
      const { container } = render(<Tile value={128} />)
      const tileDiv = container.firstChild
      expect(tileDiv).toHaveClass('text-2xl', 'sm:text-3xl')
    })

    it('applies text-xl sm:text-2xl for values >= 1024', () => {
      const { container } = render(<Tile value={1024} />)
      const tileDiv = container.firstChild
      expect(tileDiv).toHaveClass('text-xl', 'sm:text-2xl')
    })
  })

  describe('Tile Styling', () => {
    it('applies correct specific styles for known tile values', () => {
      const { container: c0 } = render(<Tile value={0} />)
      expect(c0.firstChild).toHaveClass('bg-[#0c0c0c]', 'text-transparent', 'border-[#161616]')

      const { container: c2 } = render(<Tile value={2} />)
      expect(c2.firstChild).toHaveClass('bg-[#141414]', 'text-[#888]', 'border-[#242424]')

      const { container: c2048 } = render(<Tile value={2048} />)
      expect(c2048.firstChild).toHaveClass('bg-[#24200a]', 'text-[#f0d030]', 'border-[#504010]')
    })

    it('falls back to 2048 tile styles for unlisted tile values (> 2048)', () => {
      const { container } = render(<Tile value={4096} />)
      expect(container.firstChild).toHaveClass('bg-[#24200a]', 'text-[#f0d030]', 'border-[#504010]')
    })
  })

  describe('Animations & Timers', () => {
    it('applies animate-pop when isMerged is true and value > 0, then removes it after 150ms', () => {
      const { container } = render(<Tile value={8} isMerged={true} />)
      const tileDiv = container.firstChild

      expect(tileDiv).toHaveClass('animate-pop')

      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(tileDiv).not.toHaveClass('animate-pop')
    })

    it('does not apply animate-pop when isMerged is true but value is 0', () => {
      const { container } = render(<Tile value={0} isMerged={true} />)
      const tileDiv = container.firstChild

      expect(tileDiv).not.toHaveClass('animate-pop')
    })

    it('applies animate-appear when isNew is true and value > 0, then removes it after 140ms', () => {
      const { container } = render(<Tile value={2} isNew={true} />)
      const tileDiv = container.firstChild

      expect(tileDiv).toHaveClass('animate-appear')

      act(() => {
        vi.advanceTimersByTime(140)
      })

      expect(tileDiv).not.toHaveClass('animate-appear')
    })

    it('does not apply animate-appear when isNew is true but value is 0', () => {
      const { container } = render(<Tile value={0} isNew={true} />)
      const tileDiv = container.firstChild

      expect(tileDiv).not.toHaveClass('animate-appear')
    })

    it('clears animation timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
      const { unmount } = render(<Tile value={4} isMerged={true} />)

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })

  describe('Scanline Shimmer Effect', () => {
    it('renders scanline shimmer overlay', () => {
      const { container } = render(<Tile value={2} />)
      const scanline = container.querySelector('.pointer-events-none')

      expect(scanline).toBeInTheDocument()
      expect(scanline).toHaveClass('absolute', 'inset-0')
    })
  })
})
