import CarList from './components/carInfo'
import InvoiceForm from './components/invoiceForm'

const Expenditures = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="lg:pl-72 min-h-screen">
        <div className="pt-24 pb-12 mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Vehicle Expenditures
            </h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Log receipts, review recent spending, and keep fuel/odometer status current.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            <InvoiceForm />
            <CarList />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Expenditures
