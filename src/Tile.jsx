import React, { useEffect, useRef, useState } from 'react'

// value → [bg, text, border]
const TILE_STYLES = {
  0:    ['bg-[#0c0c0c]',    'text-transparent',  'border-[#161616]'],
  2:    ['bg-[#141414]',    'text-[#888]',        'border-[#242424]'],
  4:    ['bg-[#191919]',    'text-[#aaa]',        'border-[#2c2c2c]'],
  8:    ['bg-[#1e1e14]',    'text-[#c8b870]',     'border-[#38361e]'],
  16:   ['bg-[#241e10]',    'text-[#d4a040]',     'border-[#443820]'],
  32:   ['bg-[#2a1a10]',    'text-[#e0803c]',     'border-[#4a2e1e]'],
  64:   ['bg-[#2c1410]',    'text-[#e85828]',     'border-[#50281e]'],
  128:  ['bg-[#201a2a]',    'text-[#9878e0]',     'border-[#38304e]'],
  256:  ['bg-[#182028]',    'text-[#60a8e0]',     'border-[#283848]'],
  512:  ['bg-[#142420]',    'text-[#50c878]',     'border-[#24403a]'],
  1024: ['bg-[#1e2414]',    'text-[#a8d840]',     'border-[#384020]'],
  2048: ['bg-[#24200a]',    'text-[#f0d030]',     'border-[#504010]'],
}

const getFontSize = (val) => {
  if (val >= 1024) return 'text-xl sm:text-2xl'
  if (val >= 128)  return 'text-2xl sm:text-3xl'
  return 'text-3xl sm:text-4xl'
}

const Tile = React.memo(function Tile({ value, isMerged, isNew }) {
  const [animClass, setAnimClass] = useState('')
  const prevVal = useRef(value)

  useEffect(() => {
    if (isMerged && value !== 0) {
      setAnimClass('animate-pop')
      const t = setTimeout(() => setAnimClass(''), 150)
      return () => clearTimeout(t)
    }
  }, [isMerged, value])

  useEffect(() => {
    if (isNew && value !== 0) {
      setAnimClass('animate-appear')
      const t = setTimeout(() => setAnimClass(''), 140)
      return () => clearTimeout(t)
    }
  }, [isNew, value])

  prevVal.current = value
  const styles = TILE_STYLES[value] || TILE_STYLES[2048]
  const [bg, color, border] = styles

  return (
    <div
      className={[
        'tile aspect-square flex items-center justify-center',
        'border font-vt select-none',
        'relative overflow-hidden',
        bg, color, border,
        getFontSize(value),
        animClass,
      ].join(' ')}
    >
      {/* scanline shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
        }}
      />
      <span className="relative z-10 leading-none">
        {value !== 0 ? value : ''}
      </span>
    </div>
  )
})

export default Tile;
