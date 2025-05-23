// app/hooks/useUploadCount.js

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/superbaseClient'
import { useUser } from '@clerk/nextjs'

const useUploadCount = () => {
  const { user } = useUser()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUploadCount = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return

      const { data, error } = await supabase
        .from('files')
        .select('id', { count: 'exact' })
        .eq('email', user.primaryEmailAddress.emailAddress)

      if (!error) {
        setCount(data.length || 0)
      }

      setLoading(false)
    }

    fetchUploadCount()
  }, [user])

  return { count, loading }
}

export default useUploadCount
