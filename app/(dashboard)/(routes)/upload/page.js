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
  const [uploadCount, setUploadCount] = useState(0)
  const [isProUser, setIsProUser] = useState(false)
  const [checking, setChecking] = useState(true) // ✅ prevent UI flash

  const MAX_UPLOADS = 5

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) {
        setChecking(false)
        return
      }

      const email = user.primaryEmailAddress.emailAddress

      // 1️⃣ Check if email exists in payment_subscriptions table first
      const { data: subData, error: subError } = await supabase
        .from('payment_subscriptions')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (!subError && subData) {
        setIsProUser(true)
      } else {
        setIsProUser(false)
      }

      // 2️⃣ Then check how many files uploaded (only needed if free)
      if (!subData) {
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('id')
          .eq('email', email)

        if (!fileError) {
          setUploadCount(fileData?.length ?? 0)
        }
      }

      setChecking(false) // ✅ UI ready
    }

    fetchData()
  }, [user])

  const handleUploadSuccess = (fileId) => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error('User email not found. Please login.')
      return
    }

    // ❌ Limit only for free users
    if (!isProUser && uploadCount >= MAX_UPLOADS) {
      toast.warning(`Upload limit reached! Free users can only upload up to ${MAX_UPLOADS} files.`)
      return
    }

    router.push(`/file-preview/${fileId}`)
  }

  return (
    <div className='p-5 px-8 md:px-28'>
      {checking ? null : ( // ✅ Don't render anything until check complete
        !isProUser && uploadCount >= MAX_UPLOADS ? (
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
        )
      )}
    </div>
  )
}

export default Upload
