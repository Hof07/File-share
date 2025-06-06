// app/layout.js

import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Share.io - Share your files with ease',
  description: 'Share files instantly with Share.io',
  icons: {
    icon: './logs.svg',
    shortcut: './logs.svg',
    apple: './logs.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="w-full h-full overflow-x-hidden">
        <head />
        <body className={`${outfit.className} w-full h-full overflow-x-hidden`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
