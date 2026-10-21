import dns from 'node:dns'
dns.setDefaultResultOrder('ipv4first')

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Admins'
import { Media } from './collections/Media'
import { Drivers } from './collections/Drivers'
import { Vehicles } from './collections/Vehicles'
import { Jobs } from './collections/Jobs'
import { Clients } from './collections/Clients'
import { Messages } from './collections/Messages'
import { Orders } from './collections/Deliveries'
import { Routes } from './collections/Routes'
import { JobStatusLogs } from './collections/JobStatusLogs'
import { Payments } from './collections/Expenses'
import { OrderStatusLogs } from './collections/OrderStatusLogs'
import { Locations } from './collections/Locations'
import { OnCall } from './collections/OnCall'
import { Schedule } from './collections/Schedule'
import { CashInvoices } from './collections/CashInvoices'
import { VehicleMaintenance } from './collections/VehicleMaintenance'
import { DriverLocations } from './collections/DriverLocations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },

    components: {
      graphics: {
        Logo: '/app/(payload)/components/Logo#Logo',
        Icon: '/app/(payload)/components/Logo#Logo',
      },
    },
  },
  collections: [
    Users,
    Media,
    Drivers,
    Vehicles,
    Jobs,
    Clients,
    Messages,
    Payments,
    Locations,
    CashInvoices,
    Orders,
    Routes,
    JobStatusLogs,
    OrderStatusLogs,
    OnCall,
    Schedule,
    VehicleMaintenance,
    DriverLocations,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          // TEMPORARY: the R2 bucket's public dev URL (S3_PUBLIC_URL) isn't resolving in
          // production (404s on every object despite Public Access being enabled) and the
          // real fix — a Cloudflare custom domain on the bucket — is blocked for ~5 days by
          // Netlify's post-registration nameserver lock on sdhometransport.com.
          //
          // Omitting generateFileURL here makes Payload fall back to its own built-in
          // media-serving route (the same one that already powers admin thumbnail previews),
          // which streams files through this app using the S3 credentials below — no public
          // bucket URL involved at all. Every image/document url is recomputed on read, so
          // this fixes existing uploads immediately too, not just new ones.
          //
          // Once the custom domain is live, restore the direct-URL version below (faster,
          // edge-cached, no load on this server) and remove this comment block:
          //
          // generateFileURL: ({ filename, prefix }) => {
          //   const fileKey = prefix ? `${prefix}/${filename}` : filename
          //   const baseURL = process.env.S3_PUBLIC_URL?.replace(/\/$/, '') || ''
          //   return `${baseURL}/${fileKey}`
          // },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
})
