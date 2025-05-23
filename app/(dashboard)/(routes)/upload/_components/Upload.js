'use client'

import React, { useState } from 'react'
import UploadForm from './_components/UploadForm'
import { supabase } from '@/libs/supabaseClient'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Upload() {
  const [uploadedUrl, setUploadedUrl] = useState('')

  const uploadFile = async (file) => {
    if (!file) return

    const fileName = `${Date.now()}_${file.name}`
    const bucketName = 'uploads' // supabase bucket name

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      toast.error('Upload failed: ' + error.message)
      return
    }

    const { publicURL, error: urlError } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    if (urlError) {
      toast.error('Failed to get file URL: ' + urlError.message)
      return
    }

    toast.success('File uploaded successfully!')
    setUploadedUrl(publicURL)
  }

  return (
    <div className="p-5 px-8 md:px-28">
      <ToastContainer position="top-center" />
      <h2 className="text-[20px] text-center m-5">
        Start <strong className="text-primary">Uploading</strong> Files and{' '}
        <strong className="text-primary">Share</strong> It
      </h2>
      <UploadForm uploadBtnClick={uploadFile} />
      
    </div>
  )
}

export default Upload
