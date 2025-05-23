'use client'

import { UserButton } from '@clerk/nextjs'
import { AlignJustify } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function TopHeader() {
  return (
    <header className='flex items-center justify-between p-4 border-b bg-white sticky top-0 z-40'>
      {/* Left Section: Menu icon + logo on mobile */}
      <div className='flex items-center justify-between md:hidden gap-2'>
        <AlignJustify className='h-6 w-6' />
      </div>
    <div className='md:hidden gap-2'>
        <Image src='/logo.svg' height={100} width={150} alt='logo' />

    </div>
      {/* Right Section: User Button */}
      <div>
        <UserButton afterSignOutUrl='/' />
      </div>
    </header>
  )
}

export default TopHeader
