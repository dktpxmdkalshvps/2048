import { useState, useCallback, useEffect } from 'react'

const ROWS = 4
const COLS = 4
const LS_BEST = '2048_terminal_best'

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function randomEmpty(grid) {
  const empty = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] === 0) empty.push([r, c])
  if (!empty.length) return null
  return empty[Math.floor(Math.random() * empty.length)]
}

function addTile(grid) {
  const pos = randomEmpty(grid)
  if (!pos) return { grid, pos: null }
  const next = grid.map(r => [...r])
  next[pos[0]][pos[1]] = Math.random() < 0.9 ? 2 : 4
  return { grid: next, pos }
}

function slideLeft(row) {
  const arr = row.filter(v => v !== 0)
  const merged = new Set()
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1] && !merged.has(i)) {
      arr[i] *= 2
      arr[i + 1] = 0
      merged.add(i)
    }
  }
  const result = arr.filter(v => v !== 0)
  while (result.length < COLS) result.push(0)
  return { row: result, merged }
}

function rotate90(grid) {
  return grid[0].map((_, ci) => grid.map(r => r[ci]).reverse())
}

function applyMove(grid, dir) {
  let g = grid.map(r => [...r])
  let totalScore = 0
  const mergedPositions = new Set()

  // rotate so we always slide left
  const rotations = { left: 0, down: 1, right: 2, up: 3 }
  const rots = rotations[dir]
  for (let i = 0; i < rots; i++) g = rotate90(g)

  let moved = false
  const newGrid = g.map((row, ri) => {
    const { row: slid, merged } = slideLeft(row)
    merged.forEach(ci => {
      totalScore += slid[ci]
      // map back after de-rotation later (store as row/col in rotated space)
      mergedPositions.add(`${ri},${ci}`)
    })
    if (slid.join() !== row.join()) moved = true
    return slid
  })

  // un-rotate
  let result = newGrid
  const unRots = (4 - rots) % 4
  for (let i = 0; i < unRots; i++) result = rotate90(result)

  return { grid: result, moved, score: totalScore, mergedPositions }
}

function canMove(grid) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === 0) return true
      if (r + 1 < ROWS && grid[r][c] === grid[r + 1][c]) return true
      if (c + 1 < COLS && grid[r][c] === grid[r][c + 1]) return true
    }
  return false
}

export function use2048() {
  const getBest = () => {
    try {
      const val = parseInt(localStorage.getItem(LS_BEST) || '0')
      return isNaN(val) ? 0 : val
    } catch {
      return 0
    }
  }
  const saveBest = (v) => { try { localStorage.setItem(LS_BEST, v) } catch {} }

  const newGame = useCallback(() => {
    let g = emptyGrid()
    const r1 = addTile(g); g = r1.grid
    const r2 = addTile(g); g = r2.grid
    return {
      grid: g,
      score: 0,
      moves: 0,
      status: 'playing', // 'playing' | 'won' | 'lost'
      newTilePos: r2.pos,
      mergedPositions: new Set(),
    }
  }, [])

  const [state, setState] = useState(() => ({ ...newGame(), best: getBest() }))

  const move = useCallback((dir) => {
    setState(prev => {
      if (prev.status === 'lost') return prev

      const { grid: moved, moved: didMove, score: gained, mergedPositions } =
        applyMove(prev.grid, dir)

      if (!didMove) return prev

      const { grid: withTile, pos: newPos } = addTile(moved)
      const newScore = prev.score + gained
      const newBest = Math.max(prev.best, newScore)
      if (newBest > prev.best) saveBest(newBest)

      const hasWon = withTile.some(row => row.some(v => v === 2048))
      const status = !canMove(withTile) ? 'lost'
        : hasWon && prev.status !== 'won' ? 'won'
        : prev.status === 'won' ? 'won'
        : 'playing'

      return {
        grid: withTile,
        score: newScore,
        best: newBest,
        moves: prev.moves + 1,
        status,
        newTilePos: newPos,
        mergedPositions,
      }
    })
  }, [])

  const restart = useCallback(() => {
    setState(prev => ({ ...newGame(), best: prev.best }))
  }, [newGame])

  // keyboard
  useEffect(() => {
    const map = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      a: 'left', d: 'right', w: 'up', s: 'down',
      A: 'left', D: 'right', W: 'up', S: 'down',
    }
    const onKey = (e) => {
      const dir = map[e.key]
      if (dir) { e.preventDefault(); move(dir) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  // swipe
  useEffect(() => {
    let sx, sy
    const onStart = (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }
    const onEnd = (e) => {
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
      else move(dy > 0 ? 'down' : 'up')
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [move])

  return { ...state, move, restart }
}
