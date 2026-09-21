import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'
import { use2048 } from './useGame'

vi.mock('./useGame', () => ({
  use2048: vi.fn(),
}))

describe('App Component', () => {
  const mockRestart = vi.fn()

  const defaultGameState = {
    grid: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    score: 120,
    best: 2048,
    moves: 15,
    status: 'playing',
    newTilePos: null,
    restart: mockRestart,
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    use2048.mockReturnValue(defaultGameState)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Header and Basic Layout', () => {
    it('renders terminal header, title, and controls hint', () => {
      render(<App />)

      expect(screen.getByText('2048 — terminal v1.0')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1, name: '2048' })).toBeInTheDocument()
      expect(screen.getByText('user@terminal')).toBeInTheDocument()
      expect(screen.getByText('↑↓←→ · WASD · SWIPE')).toBeInTheDocument()
    })

    it('renders score, best, and moves stat boxes', () => {
      render(<App />)

      expect(screen.getByText('SCORE')).toBeInTheDocument()
      expect(screen.getByText('120')).toBeInTheDocument()

      expect(screen.getByText('BEST')).toBeInTheDocument()
      expect(screen.getByText('2,048')).toBeInTheDocument()

      expect(screen.getByText('MOVES')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })
  })

  describe('Command Line Typing Simulation', () => {
    it('simulates typing out the command line string over time', () => {
      render(<App />)

      const fullCmd = './2048 --mode=terminal --color=dark'

      // Initially empty command line
      expect(screen.queryByText(fullCmd)).not.toBeInTheDocument()

      // Advance timers to complete typing
      act(() => {
        vi.advanceTimersByTime(28 * (fullCmd.length + 5))
      })

      expect(screen.getByText(fullCmd)).toBeInTheDocument()
    })
  })

  describe('Status Indicator', () => {
    it('displays >> AWAITING INPUT when status is playing', () => {
      use2048.mockReturnValue({ ...defaultGameState, status: 'playing' })
      render(<App />)

      expect(screen.getByText('>> AWAITING INPUT')).toBeInTheDocument()
    })

    it('displays >> 2048 REACHED — KEEP GOING when status is won', () => {
      use2048.mockReturnValue({ ...defaultGameState, status: 'won' })
      render(<App />)

      expect(screen.getByText('>> 2048 REACHED — KEEP GOING')).toBeInTheDocument()
    })

    it('displays >> PROCESS TERMINATED when status is lost', () => {
      use2048.mockReturnValue({ ...defaultGameState, status: 'lost' })
      render(<App />)

      expect(screen.getByText('>> PROCESS TERMINATED')).toBeInTheDocument()
    })
  })

  describe('Game Over Overlay & Restarting', () => {
    it('does not display game over overlay when playing', () => {
      render(<App />)

      expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument()
    })

    it('shows game over overlay after 400ms delay when status is lost', () => {
      use2048.mockReturnValue({ ...defaultGameState, status: 'lost', score: 500 })
      render(<App />)

      // Overlay should not be visible immediately
      expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument()

      // Advance time by 400ms
      act(() => {
        vi.advanceTimersByTime(400)
      })

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
      expect(screen.getByText(/FINAL SCORE:/i)).toBeInTheDocument()
      expect(screen.getAllByText('500')).toHaveLength(2)
    })

    it('calls restart and hides overlay when restart button in overlay is clicked', () => {
      use2048.mockReturnValue({ ...defaultGameState, status: 'lost' })
      render(<App />)

      act(() => {
        vi.advanceTimersByTime(400)
      })

      const restartOverlayBtn = screen.getByRole('button', { name: '[ RESTART ]' })
      fireEvent.click(restartOverlayBtn)

      expect(mockRestart).toHaveBeenCalledTimes(1)
      expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument()
    })

    it('calls restart when NEW GAME button in footer is clicked', () => {
      render(<App />)

      const newGameBtn = screen.getByRole('button', { name: '[ NEW GAME ]' })
      fireEvent.click(newGameBtn)

      expect(mockRestart).toHaveBeenCalledTimes(1)
    })
  })
})
