'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import ClientGrid from './components/clientGrid'
import ClientDrawer from './components/clientDrawer'
import { getUser } from '../actions/_getUser'
import AddClientModal from './components/addClientModal'

export default async function ClientsPage() {
  const user = await getUser()
  const isManager = user?.position === 'manager'

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'clients',
    limit: 0,
    overrideAccess: true,
  })

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="lg:pl-72 min-h-screen">
        <div className="pt-24 pb-12 mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Clients
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Directory of active homecare clients, locations, and care instructions.
              </p>
            </div>

            {/* Add Client Button strictly for managers */}
            {isManager && <AddClientModal />}
          </div>

          <ClientGrid clients={result.docs} isManager={isManager} />
          <ClientDrawer clients={result.docs} />
        </div>
      </main>
    </div>
  )
}
