'use client'

import React, { useEffect, useState } from 'react'
import UploadForm from './_components/UploadForm'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/app/lib/superbaseClient'
import { toast } from 'react-toastify'
import { Shield } from 'lucide-react'

function Upload() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)

  const MAX_UPLOADS = 5

  // Fetch upload count on mount
  useEffect(() => {
    const fetchUploadCount = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return

      const { data, error } = await supabase
        .from('files')
        .select('id')
        .eq('email', user.primaryEmailAddress.emailAddress)

      if (!error) {
        setUploadCount(data?.length ?? 0)
      }
    }

    fetchUploadCount()
  }, [user])

  const handleUploadSuccess = async (fileId) => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error('User email not found. Please login.')
      return
    }

    if (uploadCount >= MAX_UPLOADS) {
      toast.warning(`Upload limit reached! Free users can only upload up to ${MAX_UPLOADS} files.`)
      return
    }

    router.push(`/file-preview/${fileId}`)
  }

  return (
    <div className='p-5 px-8 md:px-28'>
      {uploadCount >= MAX_UPLOADS ? (
        

      <div className="bg-red-50 border border-red-200 p-5 rounded-xl mt-4 relative top-[168px]">
        <p className="text-red-800 font-medium text-center mb-3"> 
          🚫 Upload limit reached! You can only
          <strong className="text-primary font-semibold"> upload up to {MAX_UPLOADS} files.</strong>
        </p>
        <button
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 relative left-[410px] rounded-lg width-[162px] hover:bg-primary/90 transition"
          onClick={() => router.push('/upgrade')}
        >
          <Shield size={18} />
          Upgrade Now
        </button>
      </div>

      ) : (
      <UploadForm onUploadSuccess={handleUploadSuccess} />
      )}
    </div>
  )
}

export default Upload