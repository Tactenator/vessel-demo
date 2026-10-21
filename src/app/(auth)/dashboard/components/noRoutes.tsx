'use client'
import { MapIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function NoRoutesState({ action }: { action?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 lg:pl-72 w-full">
      {/* Main content viewport block to fill up the page space */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 animate-fade-in">
        {/* Empty State Card Wrapper */}
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          {/* Visual Brand Accent Focal Point */}
          <div className="mx-auto h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-5 border border-sky-100 shadow-2xs">
            <MapIcon className="h-7 w-7 text-[#41a6f4]" />
          </div>

          {/* Context Messaging Block */}
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1.5">
            No Routes Assigned
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto mb-6">
            There are no active dispatch cards, manifests, or routing targets mapped to your account
            for today.
          </p>

          {/* Supportive System Metric / Disclaimer Flag */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6 text-[11px] font-medium text-slate-500 leading-normal">
            <span className="font-bold text-slate-700 block mb-0.5">Need a dispatch payload?</span>
            If you believe this is an error, please coordinate with your fleet dispatcher.
          </div>

          {/* Interactive Utility CTA Button */}
          <div className="flex flex-col items-center gap-3">
            {action}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 bg-[#41a6f4] hover:bg-[#3592dd] text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41a6f4]"
            >
              <ArrowPathIcon className="size-3.5 animate-pulse" />
              Refresh Route Log
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
