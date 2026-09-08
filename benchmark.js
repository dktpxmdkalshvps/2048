import { performance } from "perf_hooks";


function secureRandomOld() {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] / (0xffffffff + 1)
}

const sharedArray = new Uint32Array(1)
function secureRandomNew() {
  crypto.getRandomValues(sharedArray)
  return sharedArray[0] / (0xffffffff + 1)
}

const N = 100000;

let start = performance.now();
for (let i = 0; i < N; i++) {
  secureRandomOld();
}
const timeOld = performance.now() - start;
console.log(`Old secureRandom took ${timeOld.toFixed(2)}ms`);

start = performance.now();
for (let i = 0; i < N; i++) {
  secureRandomNew();
}
const timeNew = performance.now() - start;
console.log(`New secureRandom took ${timeNew.toFixed(2)}ms`);
console.log(`Improvement: ${((timeOld - timeNew) / timeOld * 100).toFixed(2)}%`);

// Benchmark for applyMove
const COLS_AM = 4;
const ROWS_AM = 4;

function slideLeftAM(row) {
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
  while (result.length < COLS_AM) result.push(0)
  return { row: result, merged }
}

function rotate90AM(grid) {
  return grid[0].map((_, ci) => grid.map(r => r[ci]).reverse())
}

function applyMoveOld(grid, dir) {
  let g = grid.map(r => [...r])
  let totalScore = 0
  const mergedPositions = new Set()

  // rotate so we always slide left
  const rotations = { left: 0, down: 1, right: 2, up: 3 }
  const rots = rotations[dir]
  for (let i = 0; i < rots; i++) g = rotate90AM(g)

  let moved = false
  const newGrid = g.map((row, ri) => {
    const { row: slid, merged } = slideLeftAM(row)
    merged.forEach(ci => {
      totalScore += slid[ci]
      // map back after de-rotation later (store as row/col in rotated space)
      mergedPositions.add(`${ri},${ci}`)
    })
    for (let i = 0; i < COLS_AM; i++) {
      if (slid[i] !== row[i]) {
        moved = true
        break
      }
    }
    return slid
  })

  // un-rotate
  let result = newGrid
  const unRots = (4 - rots) % 4
  for (let i = 0; i < unRots; i++) result = rotate90AM(result)

  return { grid: result, moved, score: totalScore, mergedPositions }
}

function rotateUnifiedAM(grid, rots) {
  if (rots === 0) return grid.map(r => [...r])
  const newGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  if (rots === 1) {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        newGrid[r][c] = grid[3 - c][r]
  } else if (rots === 2) {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        newGrid[r][c] = grid[3 - r][3 - c]
  } else if (rots === 3) {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        newGrid[r][c] = grid[c][3 - r]
  }
  return newGrid
}

function applyMoveNew(grid, dir) {
  let totalScore = 0
  const mergedPositions = new Set()

  // rotate so we always slide left
  const rotations = { left: 0, down: 1, right: 2, up: 3 }
  const rots = rotations[dir]

  let g = rotateUnifiedAM(grid, rots)

  let moved = false
  const newGrid = g.map((row, ri) => {
    const { row: slid, merged } = slideLeftAM(row)
    merged.forEach(ci => {
      totalScore += slid[ci]
      // map back after de-rotation later (store as row/col in rotated space)
      mergedPositions.add(`${ri},${ci}`)
    })
    for (let i = 0; i < COLS_AM; i++) {
      if (slid[i] !== row[i]) {
        moved = true
        break
      }
    }
    return slid
  })

  // un-rotate
  const unRots = (4 - rots) % 4
  const result = rotateUnifiedAM(newGrid, unRots)

  return { grid: result, moved, score: totalScore, mergedPositions }
}

const testGridAM = [
  [0, 2, 4, 8],
  [2, 2, 4, 8],
  [4, 0, 4, 2],
  [8, 2, 2, 4]
];

const M_AM = 100000;
const dirsAM = ['left', 'right', 'up', 'down'];

let startAM = performance.now();
for (let i = 0; i < M_AM; i++) {
  applyMoveOld(testGridAM, dirsAM[i % 4]);
}
const timeOldAM = performance.now() - startAM;

startAM = performance.now();
for (let i = 0; i < M_AM; i++) {
  applyMoveNew(testGridAM, dirsAM[i % 4]);
}
const timeNewAM = performance.now() - startAM;

console.log(`Old applyMove took ${timeOldAM.toFixed(2)}ms`);
console.log(`New applyMove took ${timeNewAM.toFixed(2)}ms`);
console.log(`Improvement: ${((timeOldAM - timeNewAM) / timeOldAM * 100).toFixed(2)}%`);

// Benchmark for randomEmpty
const ROWS = 4;
const COLS = 4;

function randomEmptyOld(grid) {
  const empty = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] === 0) empty.push([r, c])
  if (!empty.length) return null
  return empty[Math.floor(Math.random() * empty.length)]
}

function randomEmptyNew(grid) {
  const empty = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] === 0) empty.push(r * COLS + c)
  if (!empty.length) return null
  const idx = empty[Math.floor(Math.random() * empty.length)]
  return [Math.floor(idx / COLS), idx % COLS]
}

const testGridRE = [
  [0, 2, 0, 8],
  [2, 0, 4, 0],
  [0, 0, 0, 2],
  [8, 2, 0, 0]
];

function randomEmptyOldSecure(grid) {
  const empty = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] === 0) empty.push([r, c])
  if (!empty.length) return null
  return empty[Math.floor(secureRandomNew() * empty.length)]
}

function randomEmptyNewSecure(grid) {
  const empty = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] === 0) empty.push(r * COLS + c)
  if (!empty.length) return null
  const idx = empty[Math.floor(secureRandomNew() * empty.length)]
  return [Math.floor(idx / COLS), idx % COLS]
}

const K_RE = 100000;

let startRE = performance.now();
for (let i = 0; i < K_RE; i++) {
  randomEmptyOldSecure(testGridRE);
}
const timeOldRE = performance.now() - startRE;

startRE = performance.now();
for (let i = 0; i < K_RE; i++) {
  randomEmptyNewSecure(testGridRE);
}
const timeNewRE = performance.now() - startRE;

console.log(`Old randomEmpty took ${timeOldRE.toFixed(2)}ms`);
console.log(`New randomEmpty took ${timeNewRE.toFixed(2)}ms`);
console.log(`Improvement: ${((timeOldRE - timeNewRE) / timeOldRE * 100).toFixed(2)}%`);
