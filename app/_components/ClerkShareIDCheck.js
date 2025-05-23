'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/superbaseClient'
import { toast } from 'react-toastify'

export default function ClerkshareidCheck() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress
  const [shareid, setshareid] = useState('')
  const [loading, setLoading] = useState(true)
  const [newshareid, setNewshareid] = useState('')

  useEffect(() => {
    const checkOrCreateUser = async () => {
      if (!email) return

      const { data, error } = await supabase
        .from('clerk_users')
        .select('shareid')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        toast.error('Error fetching user')
        setLoading(false)
        return
      }

      if (data) {
        setshareid(data.shareid)
      } else {
        const { error: insertError } = await supabase
          .from('clerk_users')
          .insert([{ email, shareid: null }])

        if (insertError) {
          toast.error('Error creating user')
        }
      }

      setLoading(false)
    }

    checkOrCreateUser()
  }, [email])

  const handleCreateshareid = async () => {
    if (!newshareid) return

    const { error } = await supabase
      .from('clerk_users')
      .update({ shareid: newshareid })
      .eq('email', email)

    if (error) {
      toast.error('Error setting share ID')
    } else {
      toast.success('Share ID set!')
      setshareid(newshareid)
    }
  }

  if (loading) return <p className="text-center mt-6">Loading...</p>

  if (shareid) {
    return (
      <div className="p-6 max-w-md mx-auto bg-green-100 rounded mt-6 text-green-800">
        <p className="text-xl font-bold">Hi 👋</p>
        <p className="mt-2">Your Share ID: <strong>{shareid}</strong></p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">Create Share ID</h2>
      <input
        type="text"
        placeholder="Enter your Share ID (e.g., anshcs2024@share.Id)"
        value={newshareid}
        onChange={(e) => setNewshareid(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <button
        onClick={handleCreateshareid}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Set Share ID
      </button>
    </div>
  )
}
