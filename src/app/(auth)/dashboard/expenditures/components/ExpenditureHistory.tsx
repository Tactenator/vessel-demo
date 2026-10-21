import { DocumentTextIcon, PaperClipIcon } from '@heroicons/react/24/outline'

interface ExpenditureHistoryProps {
  expenses?: any[]
}

export default function ExpenditureHistory({ expenses = [] }: ExpenditureHistoryProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Expenditures</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Confirm a receipt was actually attached before logging another one.
          </p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
          <DocumentTextIcon className="h-5 w-5 text-[#41a6f4]" />
        </div>
      </div>

      {expenses.length > 0 ? (
        <div className="space-y-2.5">
          {expenses.map((expense) => {
            const vehicle = expense.vehicle
            const vehicleName =
              typeof vehicle === 'object' && vehicle ? vehicle.name || vehicle.fullTitle : null
            const receipt = expense.receipt
            const receiptUrl = typeof receipt === 'object' && receipt ? receipt.url : null

            return (
              <div
                key={expense.id}
                className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {expense.itemsPurchased}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {vehicleName ? `${vehicleName} · ` : ''}
                      {expense.date ? new Date(expense.date).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <span className="font-bold text-slate-700 shrink-0">${expense.price}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  {receiptUrl ? (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#41a6f4] font-bold hover:underline"
                    >
                      <PaperClipIcon className="size-3.5" />
                      View Receipt
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No receipt attached</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic px-1">No expenditures logged yet.</p>
      )}
    </div>
  )
}
