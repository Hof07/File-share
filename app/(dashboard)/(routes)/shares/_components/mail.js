'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/superbaseClient'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-toastify'
import bcrypt from 'bcryptjs'
import { User2 } from 'lucide-react'
import ChatAndFile from './ChatAndFile'

export default function MailPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const [loading, setLoading] = useState(true)
  const [shareId, setShareId] = useState(null)
  const [formVisible, setFormVisible] = useState(false)

  const [form, setForm] = useState({
    name: '',
    dob: '',
    password: '',
    shareid: ''
  })

  useEffect(() => {
    if (!email) return

    async function checkUser() {
      setLoading(true)

      const { data, error } = await supabase
        .from('clerk_user')
        .select('share_id')
        .eq('clerk_mail', email)
        .maybeSingle()

      if (error) {
        toast.error('Error checking user')
        return
      }

      if (!data) {
        await supabase.from('clerk_user').insert({ clerk_mail: email })
        setFormVisible(true)
      } else if (!data.share_id) {
        setFormVisible(true)
      } else {
        setShareId(data.share_id)
      }

      setLoading(false)
    }

    checkUser()
  }, [email])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    const { name, dob, password, shareid } = form
    if (!name || !dob || !password || !shareid) return toast.error('Fill all fields')

    setLoading(true)
    const hashed = await bcrypt.hash(password, 10)

    const { error: userError } = await supabase.from('users').insert({
      name, dob, password: hashed, shareid, created_at: new Date().toISOString()
    })

    if (userError) {
      toast.error('User creation failed')
      return setLoading(false)
    }

    const { error: updateError } = await supabase
      .from('clerk_user')
      .update({ share_id: shareid })
      .eq('clerk_mail', email)

    if (updateError) {
      toast.error('Failed to update share ID')
    } else {
      setShareId(shareid)
      setFormVisible(false)
      toast.success('Share Account Created')
    }

    setLoading(false)
  }

  if (loading) return <p className="text-center">Checking account...</p>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {!shareId && formVisible ? (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Create Share Account</h2>
          <input type="text" name="name" onChange={handleChange} placeholder="Name" className="border w-full p-2 mb-2 rounded" />
          <input type="date" name="dob" onChange={handleChange} className="border w-full p-2 mb-2 rounded" />
          <input type="password" name="password" onChange={handleChange} placeholder="Password" className="border w-full p-2 mb-2 rounded" />
          <input type="text" name="shareid" onChange={handleChange} placeholder="Share ID" className="border w-full p-2 mb-2 rounded" />
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
        </div>
      ) : (
        <ChatAndFile shareId={shareId} userEmail={email} />
      )}
    </div>
  )
}
