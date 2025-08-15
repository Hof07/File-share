'use client'

import { UserButton } from '@clerk/nextjs'
import { AlignJustify } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function TopHeader() {
  return (
    <header className='flex items-center justify-between p-4 border-b bg-white sticky top-0 z-40'>
      {/* Left Section: Menu icon + logo on mobile */}
      <div className='flex items-center md:hidden gap-2'>
        <AlignJustify className='h-6 w-6 cursor-pointer' />
        <Link href="/" className="flex items-center">
          <Image
            src='/logo.svg'
            height={40}
            width={80}
            alt='logo'
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Right Section: User Button */}
      <div>
        <UserButton afterSignOutUrl='/' />
      </div>
    </header>
  )
}

export default TopHeader
