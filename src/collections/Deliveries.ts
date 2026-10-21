import type { CollectionConfig } from 'payload'

// collections/Orders.ts
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { useAsTitle: 'customerName' },
  fields: [
    { name: 'customerName', type: 'text', required: true },
    { name: 'address', type: 'relationship', relationTo: 'locations', required: true },
    {
      name: 'location',
      type: 'group',
      fields: [
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ],
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (data.address && (operation === 'create' || operation === 'update')) {
          try {
            const locationDoc = await req.payload.findByID({
              collection: 'locations',
              id: data.address,
              req,
            })

            const actualAddress = locationDoc?.address
            console.log('📍 Address found:', actualAddress)

            if (actualAddress) {
              // Note: In newer Node/Next.js setups, use process.env directly instead of 'import { env } from "process"'
              const apiKey = process.env.GOOGLE_MAPS_API_KEY

              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(actualAddress)}&key=${apiKey}`,
              )
              const json = await res.json()

              // 🛑 CRITICAL DEBUG LOGS: Check your terminal for these!
              console.log('📬 Google API Status:', json.status)
              if (json.error_message) {
                console.error('❌ Google API Error Message:', json.error_message)
              }

              if (json.results && json.results[0]) {
                const { lat, lng } = json.results[0].geometry.location
                console.log('✅ Found Lat/Lng:', lat, lng)

                // Explicitly assign properties to ensure mutation catches
                data.location = {
                  lat: Number(lat),
                  lng: Number(lng),
                }
              } else {
                console.warn('⚠️ No results returned from Google Maps for this address.')
              }
            }
          } catch (error) {
            console.error('💥 Hook execution error:', error)
          }
        }
        return data
      },
    ],
  },
}
