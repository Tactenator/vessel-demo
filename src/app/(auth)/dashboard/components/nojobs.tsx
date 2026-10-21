'use client'
import React from 'react'
import { Truck, ClipboardList } from 'lucide-react'

const NoJobsState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 min-h-[400px]">
      {/* Graphic Container */}
      <div className="relative mb-6">
        <div className="bg-blue-100 p-6 rounded-full">
          <Truck size={48} className="text-blue-600" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-sm">
          <ClipboardList size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Today!</h3>
      <p className="text-gray-500 max-w-[280px] mb-6">
        You currently have no assigned drives. New assignments will appear here in real-time.
      </p>

      {/* Optional Action Button */}
      <button
        onClick={() => window.location.reload()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 hover:cursor-pointer"
      >
        Refresh Schedule
      </button>
    </div>
  )
}

export default NoJobsState
