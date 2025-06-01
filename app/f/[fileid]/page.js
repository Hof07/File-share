'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/app/lib/superbaseClient'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import bcrypt from 'bcryptjs'
import Image from 'next/image'
import { DownloadIcon } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export default function FileDownloadPage() {
  const { fileid } = useParams()
  const { user } = useUser() // ✅ Clerk user added
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)

  useEffect(() => {
    async function fetchFile() {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileid)
        .single()

      if (error || !data) {
        toast.error('File not found')
        setLoading(false)
        return
      }

      setFile(data)
      setPasswordRequired(!!data.password)
      if (!data.password) {
        setAccessGranted(true)
      }
      setLoading(false)
    }

    if (fileid) fetchFile()
  }, [fileid])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const isMatch = await bcrypt.compare(passwordInput, file.password)
    if (isMatch) {
      setAccessGranted(true)
      toast.success('Password correct! You can download the file now.')
    } else {
      toast.error('Incorrect password, try again.')
    }
  }

  const handleDownload = () => {
    if (file?.url) {
      window.open(file.url, '_blank')
    } else {
      toast.error('File URL not found.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Image src="/load.gif" alt="Loading..." width={80} height={80} />
      </div>
    )
  }

  if (!file) {
    return <p className="text-center mt-6 text-red-600">File not found.</p>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white max-w-md w-full text-center rounded-xl shadow-md p-8">
        {/* Logo */}
        <div className="mb-4 text-blue-600 font-bold text-2xl flex justify-center items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={150} height={100} />
        </div>

        {/* Title */}
        <h1 className="text-lg font-semibold mb-1">
          <span className="text-blue-600">{user?.firstName || 'Someone'}</span> shared a file with you
        </h1>
        <p className="text-sm text-gray-500 mb-5">Find file details below</p>

        {/* File Icon */}
        <div className="flex justify-center mb-4">
          <Image src="/downlaod.gif" alt="Download" width={100} height={50} />
        </div>

        {/* File Info */}
        <div className="mb-6 text-gray-700 font-medium">
          {file.name}
        </div>

        {/* Password form or Download button */}
        {passwordRequired && !accessGranted ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700"
            >
              Submit Password
            </button>
          </form>
        ) : (
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <DownloadIcon size={16} /> Download
          </button>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-5">*Terms and Conditions apply</p>

        <ToastContainer position="top-center" />
      </div>
    </div>
  )
}
