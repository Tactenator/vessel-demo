import dns from 'node:dns'
dns.setDefaultResultOrder('ipv4first')

import React from 'react'
import '../globals.css'

export const metadata = {
  description: 'SD Homecare Transportation App',
  title: 'SD Homecare Transportation App',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicons/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
