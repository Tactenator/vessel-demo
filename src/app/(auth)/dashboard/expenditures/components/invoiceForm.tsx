'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../../actions/_getUser'
import { notFound } from 'next/navigation'
import { createNewInvoice } from '../../actions/createNewInovice'
import ExpenditureForm from './expenditureForm'
import ExpenditureHistory from './ExpenditureHistory'

const InvoiceForm = async () => {
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) return notFound()

  try {
    const [vehiclesResult, paymentsResult] = await Promise.all([
      payload.find({
        collection: 'vehicles',
        overrideAccess: true,
        depth: 2,
      }),
      payload.find({
        collection: 'payments',
        overrideAccess: true,
        depth: 1,
        limit: 15,
        sort: '-date',
      }),
    ])

    const cars = vehiclesResult.docs
    if (!cars || cars.length === 0) return <div>No cars found.</div>

    // Returned as siblings (not wrapped in a shared card) so the parent page's grid
    // can size and place each card independently across the desktop layout.
    return (
      <>
        <ExpenditureForm vehicles={cars} />
        <ExpenditureHistory expenses={paymentsResult.docs} />
      </>
    )
  } catch (err) {
    console.error('Fetch error:', err)
    return notFound()
  }
}

export default InvoiceForm
