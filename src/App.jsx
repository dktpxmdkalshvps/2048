import React, { useState, useEffect } from 'react'
import { use2048 } from './useGame'
import Board from './Board'

function StatBox({ label, value }) {
  return (
    <div className="border border-[#222] bg-[#111] px-3 py-1.5 min-w-[76px]">
      <span className="block text-[9px] text-[#3a3a3a] tracking-[0.2em] uppercase font-mono">
        {label}
      </span>
      <span className="block font-vt text-xl sm:text-2xl text-[#b0b0b0] leading-tight">
        {value}
      </span>
    </div>
  )
}

function Cursor() {
  return (
    <span className="inline-block w-[2px] h-[1em] bg-[#888] animate-blink align-middle ml-0.5" />
  )
}

export default function App() {
  const { grid, score, best, moves, status, newTilePos, mergedPositions, restart } = use2048()
  const [showOverlay, setShowOverlay] = useState(false)
  const [cmdLine, setCmdLine] = useState('')

  // delayed overlay on game over
  useEffect(() => {
    if (status === 'lost') {
      const t = setTimeout(() => setShowOverlay(true), 400)
      return () => clearTimeout(t)
    } else {
      setShowOverlay(false)
    }
  }, [status])

  // fake typing cmd line on mount
  useEffect(() => {
    const cmd = './2048 --mode=terminal --color=dark'
    let i = 0
    const t = setInterval(() => {
      i++
      setCmdLine(cmd.slice(0, i))
      if (i >= cmd.length) clearInterval(t)
    }, 28)
    return () => clearInterval(t)
  }, [])

  const handleRestart = () => {
    setShowOverlay(false)
    restart()
  }

  const statusText = status === 'won'
    ? '>> 2048 REACHED — KEEP GOING'
    : status === 'lost'
    ? '>> PROCESS TERMINATED'
    : '>> AWAITING INPUT'

  const statusColor = status === 'won'
    ? 'text-[#f0d030]'
    : status === 'lost'
    ? 'text-[#e85828]'
    : 'text-[#333]'

  return (
    <div className="min-h-dvh bg-[#080808] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[440px] flex flex-col gap-3">

        {/* Terminal header bar */}
        <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a]" />
          </div>
          <span className="text-[10px] text-[#2a2a2a] font-mono tracking-widest ml-2">
            2048 — terminal v1.0
          </span>
        </div>

        {/* Prompt line */}
        <div className="font-mono text-[11px] text-[#2e2e2e] tracking-wide">
          <span className="text-[#383838]">user@terminal</span>
          <span className="text-[#222]">:</span>
          <span className="text-[#2a3a2a]">~</span>
          <span className="text-[#222]">$ </span>
          <span className="text-[#353535]">{cmdLine}</span>
          <Cursor />
        </div>

        {/* Title + stats */}
        <div className="flex items-end justify-between">
          <h1 className="font-vt text-[52px] sm:text-[64px] text-[#e8e0c8] leading-none tracking-wide">
            2048
          </h1>
          <div className="flex gap-2 items-end pb-1">
            <StatBox label="SCORE" value={score.toLocaleString()} />
            <StatBox label="BEST"  value={best.toLocaleString()} />
            <StatBox label="MOVES" value={moves} />
          </div>
        </div>

        {/* Board */}
        <div className="relative">
          <Board
            grid={grid}
            newTilePos={newTilePos}
            mergedPositions={mergedPositions}
          />

          {/* Game over overlay */}
          {showOverlay && (
            <div className="absolute inset-0 bg-black/88 flex flex-col items-center justify-center gap-4 animate-slide-in">
              <p className="font-vt text-[52px] text-[#c0c0c0] leading-none">GAME OVER</p>
              <p className="font-mono text-xs text-[#444] tracking-widest">
                FINAL SCORE: <span className="text-[#888]">{score.toLocaleString()}</span>
              </p>
              <button
                onClick={handleRestart}
                className="font-mono text-[11px] tracking-[0.2em] border border-[#333] text-[#555]
                           px-5 py-2 hover:border-[#666] hover:text-[#aaa] transition-colors duration-150
                           active:scale-[0.97]"
              >
                [ RESTART ]
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#141414] pt-2.5">
          <span className={`font-mono text-[10px] tracking-wide ${statusColor}`}>
            {statusText}
          </span>
          <button
            onClick={handleRestart}
            className="font-mono text-[10px] tracking-widest border border-[#222] text-[#333]
                       px-3 py-1 hover:border-[#444] hover:text-[#666] transition-colors duration-150
                       active:scale-[0.97]"
          >
            [ NEW GAME ]
          </button>
        </div>

        {/* Controls hint */}
        <p className="font-mono text-[9px] text-[#222] tracking-widest text-center">
          ↑↓←→ · WASD · SWIPE
        </p>

      </div>
    </div>
  )
}
