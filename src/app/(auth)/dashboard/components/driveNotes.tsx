'use client'
import { useState, useTransition } from 'react'
import { saveDriveNotes } from '../actions/saveDriveNotes'

function DriveNotes({ jobId, initialNotes = '' }) {
  const [notes, setNotes] = useState(initialNotes)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveDriveNotes(jobId, notes)
      if (result.success) {
        // Optional: show a toast or a temporary "Saved!" checkmark
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
          Final Drive Notes
        </h2>
        {isPending && (
          <span className="text-[10px] text-indigo-400 animate-pulse font-bold">SAVING...</span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleSave} // Saves automatically when the driver clicks away
        className="rounded-lg bg-black/10 p-4 text-sm leading-relaxed text-gray-300 italic border border-white/5 w-full h-32 resize-none focus:border-indigo-500/50 focus:outline-none transition-colors"
        placeholder="Anything happen that needs notating?"
      ></textarea>
      <p className="text-[9px] text-gray-500 mt-2 italic">
        Notes save automatically when you click out of the box.
      </p>
    </div>
  )
}

export default DriveNotes
