// app/not-found.js
'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Image src="/404.gif" alt="Not Found" width={300} height={300} />
      
    </div>
  )
}
