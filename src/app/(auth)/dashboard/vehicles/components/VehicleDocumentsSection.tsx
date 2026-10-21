'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DocumentArrowUpIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { uploadVehicleDocument } from '../../actions/uploadVehicleDocument'

interface VehicleDocumentsSectionProps {
  vehicleId: string
  documents?: any[]
  vehicleDocuments?: any[]
  isManager?: boolean
}

export default function VehicleDocumentsSection({
  vehicleId,
  documents = [],
  vehicleDocuments = [],
  isManager = false,
}: VehicleDocumentsSectionProps) {
  const router = useRouter()

  // "documents" and "vehicleDocuments" are two near-identical upload arrays
  // on the Vehicles collection (a pre-existing schema quirk) — merge both
  // for display so nothing uploaded via the Payload admin panel is hidden,
  // but new uploads from this page only ever write to "documents" below.
  const allDocuments = [...documents, ...vehicleDocuments]
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.set('vehicleId', vehicleId)

    const res = await uploadVehicleDocument(formData)

    if (res.success) {
      formRef.current?.reset()
      router.refresh()
    } else {
      setErrorMsg(res.error || 'Something went wrong.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-2">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <PaperClipIcon className="size-3.5 inline -mt-0.5 mr-1" />
        Documents
      </span>

      {allDocuments.length > 0 ? (
        <div className="space-y-2">
          {allDocuments.map((doc, idx) => (
            <a
              key={idx}
              href={doc.file?.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between bg-slate-50/70 border border-slate-100 hover:border-[#41a6f4]/40 rounded-xl p-3 text-xs transition-colors"
            >
              <span className="font-semibold text-slate-700 truncate">{doc.fileNotes}</span>
              <span className="text-[#41a6f4] font-bold shrink-0 ml-2">View</span>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic px-1">
          No documents uploaded for this vehicle.
        </p>
      )}

      {isManager && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2.5 mt-2"
        >
          <input
            type="text"
            name="fileNotes"
            required
            placeholder="e.g. Registration, Insurance Card"
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#41a6f4] focus:outline-none"
          />
          <input
            type="file"
            name="file"
            required
            className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#41a6f4]/10 file:text-[#41a6f4] file:font-bold file:text-xs file:cursor-pointer hover:file:bg-[#41a6f4]/20 cursor-pointer"
          />
          {errorMsg && <p className="text-[11px] font-semibold text-rose-600">{errorMsg}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#41a6f4] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#3491d8] transition-colors disabled:opacity-50"
          >
            <DocumentArrowUpIcon className="size-3.5" />
            {isSubmitting ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}
    </div>
  )
}
