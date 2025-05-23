'use client'

import React, { useState } from 'react'
import { supabase } from '@/app/lib/superbaseClient'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FilePreview from './FilePreview'
import Image from 'next/image'
import JSZip from 'jszip'
import { useUser } from '@clerk/nextjs'
import generateCode from '@/app/_components/generateCode'

function UploadForm({ onUploadSuccess }) {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const [files, setFiles] = useState([])
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const [zipName, setZipName] = useState('')
  const [asZip, setAsZip] = useState(true)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    const isTooLarge = selectedFiles.some(f => f.size > 2 * 1024 * 1024)
    if (isTooLarge) {
      toast.error('One or more files exceed 2MB!')
      return
    }
    setFiles(selectedFiles)
    setUploaded(false)
  }

  const uploadSingleFile = async (file) => {
    const fileName = `${Date.now()}_${file.name}`
    const bucketName = 'uploads'

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      return null
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    const publicURL = publicData.publicUrl

    // DB insert with random_id added here
    const { data, error } = await supabase.from('files').insert([
      { 
        name: file.name, 
        url: publicURL, 
        uploaded_at: new Date(), 
        email: email,
        random_id: generateCode()  // <-- added random_id here
      },
    ]).select().single()

    if (error) {
      toast.error('DB insert failed: ' + error.message)
      return null
    }

    if (onUploadSuccess) {
      setTimeout(() => {
        onUploadSuccess(data.id)
      }, 4000)
    }

    return publicURL
  }

  const uploadZip = async () => {
    if (!zipName) {
      toast.error('Please enter a ZIP file name')
      return
    }

    const zip = new JSZip()
    files.forEach(file => {
      zip.file(file.name, file)
    })

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const fullZipName = `${Date.now()}_${zipName}.zip`
    const bucketName = 'uploads'

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fullZipName, zipBlob)

    if (uploadError) {
      toast.error('ZIP upload failed: ' + uploadError.message)
      return
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullZipName)

    const publicURL = publicData.publicUrl

    // DB insert with random_id for ZIP
    const { data, error } = await supabase.from('files').insert([
      { 
        name: `${zipName}.zip`, 
        url: publicURL, 
        uploaded_at: new Date(), 
        email: email,
        random_id: generateCode()  // <-- added random_id here too
      },
    ]).select().single()

    if (error) {
      toast.error('DB insert failed: ' + error.message)
      return
    }

    if (onUploadSuccess) {
      setTimeout(() => {
        onUploadSuccess(data.id)
      }, 4000)
    }

    setUploadedUrl(publicURL)
    setUploaded(true)
    setFiles([])
    setZipName('')
    toast.success('ZIP file uploaded successfully!')
  }

  const uploadHandler = async () => {
    if (files.length === 0) return

    setUploading(true)

    try {
      if (files.length === 1) {
        const url = await uploadSingleFile(files[0])
        if (url) {
          setUploadedUrl(url)
          setUploaded(true)
          setFiles([])
        }
      } else {
        if (asZip) {
          await uploadZip()
        } else {
          const uploadedUrls = []

          for (const file of files) {
            const url = await uploadSingleFile(file)
            if (url) uploadedUrls.push(url)
          }

          if (uploadedUrls.length === files.length) {
            toast.success('All files uploaded successfully!')
            setUploadedUrl(uploadedUrls[0])
            setUploaded(true)
            setFiles([])
          }
        }
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message)
    }

    setUploading(false)
  }

  return (
    <div className="p-5 px-8 md:px-28 text-center">
      <ToastContainer position="top-center" />

      {uploaded ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <Image src={'/ser.gif'} width={100} height={50} />
        </div>
      ) : (
        <>
          <h2 className='text-[20px] text-center m-5'>Start <strong className='text-primary'>Uploading</strong> Files and <strong className='text-primary'>Share</strong> It</h2>

          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-12 h-12 mb-4 text-blue-500" fill="none" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-lg md:text-2xl text-gray-500">
                  <span className="font-semibold">Click to upload</span> or <strong className="text-primary">drag</strong> and <strong className="text-primary">drop</strong>
                </p>
                <p className="text-base text-gray-500">
                  Files: PDF, Docs, Images, Code, etc. (Max: 2MB each)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-4">
              {files.map((file, index) => (
                <FilePreview
                  key={index}
                  file={file}
                  removeFile={() => {
                    const updated = [...files]
                    updated.splice(index, 1)
                    setFiles(updated)
                  }}
                />
              ))}

              {files.length > 1 && (
                <div className='space-y-3'>
                  <label className='flex items-center gap-2'>
                    <input
                      type="checkbox"
                      checked={asZip}
                      onChange={() => setAsZip(!asZip)}
                      disabled={uploading}
                    />
                    <span>Upload as ZIP</span>
                  </label>

                  {asZip && (
                    <input
                      type="text"
                      className='border border-gray-300 rounded p-2 w-full md:w-1/2'
                      placeholder='Enter ZIP file name'
                      value={zipName}
                      onChange={(e) => setZipName(e.target.value)}
                      disabled={uploading}
                    />
                  )}
                </div>
              )}

              <button
                onClick={uploadHandler}
                disabled={uploading}
                className={`mt-5 w-full md:w-1/2 py-3 rounded text-white font-semibold ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UploadForm
