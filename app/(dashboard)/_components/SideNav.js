'use client'

import { File, LucideBookOpen, Mail, Search, Shield, Upload } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import useUploadCount from '../(routes)/upload/_components/useUploadCount'

const MAX_UPLOADS = 5

function SideNav() {
  const router = useRouter()
  const pathname = usePathname() 
  const { count: uploadCount } = useUploadCount()
  const progressValue = (uploadCount / MAX_UPLOADS) * 100

  const menuList = [
    { id: 1, name: 'Upload', icon: Upload, path: '/upload' },
    { id: 2, name: 'Files', icon: File, path: '/files' },
    { id: 3, name: 'Upgrade', icon: Shield, path: '/upgrade' },
    { id: 4, name: 'Shares', icon: Mail, path: '/mail' },
    { id: 5, name: 'Find', icon: Search, path: '/search' },
    { id: 6,name : 'Book', icon: LucideBookOpen, path: '/books'},
    {
      id: 6,
      name: 'Generative',
      path: '/genrate-AI',
      icon: ({ isActive }) => (
        <svg
          height="24"
          width="24"
          viewBox="0 0 24 24"
          className="w-5 h-5"
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path
            fill={isActive ? 'url(#grad1)' : '#6b7280'}
            d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"
          />
        </svg>
      )
    }
  ]

  const handleClick = (event, _index, path) => {
    if (event.shiftKey) {
      window.open(path, '_blank')
    } else {
      router.push(path)
    }
  }

  return (
    <div className='shadow-sm border-r h-full flex flex-col justify-between'>
      {/* Logo Section */}
      <div>
        <div className='p-5 border-b'>
          <Image src='/logo.svg' width={150} height={100} alt='logo' />
        </div>

        {/* Menu Items */}
        <div className='flex flex-col'>
          {menuList.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname.startsWith(item.path)

            return (
              <button
                key={item.id}
                className={`flex gap-2 p-4 px-6 w-full text-gray-500 hover:bg-gray-100
                  ${isActive ? (item.name === 'Generative'
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-[#a855f7]'
                    : 'text-primary bg-blue-50') : ''}
                `}
                onClick={(e) => handleClick(e, null, item.path)}
              >
                {typeof IconComponent === 'function' ? (
                  <IconComponent isActive={isActive} />
                ) : (
                  <IconComponent size={20} />
                )}
                <h2 className={`${isActive && item.name === 'Generative' ? 'font-semibold text-[#a855f7]' : ''}`}>
                  {item.name}
                </h2>
              </button>
            )
          })}
        </div>
      </div>

      {/* Upload Progress Section */}
      <div className='p-4'>
        <Progress value={progressValue} className='h-[19px]' />
        <p className='text-sm text-muted-foreground relative left-[57px] mb-1'>
          Uploads: {uploadCount} / {MAX_UPLOADS}
        </p>
        <p className='text-sm mb-1 text-primary'>
          Upgrade To get Unlimited Upload!
        </p>
      </div>
    </div>
  )
}

export default SideNav
