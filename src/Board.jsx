import React from 'react'
import Tile from './Tile'

export default function Board({ grid, newTilePos }) {
  return (
    <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-1.5 sm:p-2 w-full">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isNew = newTilePos?.[0] === r && newTilePos?.[1] === c
            return (
              <Tile
                key={`${r}-${c}`}
                value={val}
                isNew={isNew}
                isMerged={false}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
