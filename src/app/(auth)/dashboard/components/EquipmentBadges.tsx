'use client'

import React from 'react'

export default function EquipmentBadges({ equipment = [] }: { equipment?: string[] }) {
  if (!equipment || equipment.length === 0) return null

  const items = Array.isArray(equipment) ? equipment : [equipment]

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {items.includes('wheelchair') && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
          Wheelchair Required
        </span>
      )}

      {items.includes('gloves') && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
          Gloves Required
        </span>
      )}
    </div>
  )
}
