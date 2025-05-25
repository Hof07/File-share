'use client'

import React from 'react'
import SideNav from './_components/SideNav'
import TopHeader from './_components/TopHeader'

function Layout({ children }) {
  return (
    <div className='flex min-h-screen'>

      {/* Sidebar - fixed on left */}
      <div className='fixed inset-y-0 left-0 w-64 bg-white border-r hidden md:flex flex-col'>
        <SideNav />
      </div>

      {/* Main content area */}
      <div className='flex flex-col flex-1 md:ml-64 w-full'>
        <TopHeader />
        <main className='p-4'>
          {children}
        </main>
      </div>

    </div>
  )
}

export default Layout
