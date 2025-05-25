'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function FilesPage() {
  const { user, isSignedIn } = useUser()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    const fetchFiles = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('email', user.primaryEmailAddress.emailAddress)

      if (error) {
        console.error('❌ Supabase fetch error:', error.message)
      } else {
        setFiles(data || [])
      }

      setLoading(false)
    }

    if (isSignedIn) fetchFiles()
  }, [isSignedIn, user])

  const handleRemove = async (fileId) => {
    if (!user) return
    setRemovingId(fileId)

    const fileToRemove = files.find((f) => f.id === fileId)
    if (!fileToRemove) {
      setRemovingId(null)
      return
    }

    try {
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([fileToRemove.file_path])

      if (storageError) {
        console.error('❌ Storage delete error:', storageError.message)
        return
      }

      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('email', user.primaryEmailAddress.emailAddress)

      if (deleteError) {
        console.error('❌ Supabase delete error:', deleteError.message)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('user_uploads')
        .select('upload_count')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('❌ Supabase upload count fetch error:', userError.message)
        return
      }

      const newCount = Math.max((userData?.upload_count || 1) - 1, 0)

      const { error: updateError } = await supabase
        .from('user_uploads')
        .update({ upload_count: newCount })
        .eq('id', user.id)

      if (updateError) {
        console.error('❌ Supabase upload count update error:', updateError.message)
        return
      }

      // ✅ Remove from UI without reload
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } finally {
      setRemovingId(null)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="text-center">
          <Image src={'/search.gif'} width={150} height={100} alt='search' />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.firstName || 'User'} 👋</h1>
          <p className="text-gray-600">Here are your uploaded files</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Files Grid */}
      {loading ? (
        <p className="text-gray-500">Loading your files...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-500">No files found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-800">{file.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Type: {file.type}</p>
              <p className="text-sm text-gray-500">Size: {file.size}</p>
              <p className="text-sm text-gray-400">Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</p>
              <p className="text-sm font-mono text-blue-700 mt-2">ID: {file.random_id}</p>

              {/* Download button with Supabase file link */}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition"
              >
                Download
              </a>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(file.id)}
                disabled={removingId === file.id}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-center transition"
              >
                {removingId === file.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
