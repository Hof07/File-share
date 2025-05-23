"use client"
import React, { useState } from 'react'
import { supabase } from '@/app/lib/superbaseClient'
import { toast, ToastContainer } from 'react-toastify'

function Search() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const value = e.target.value
    const regex = /^[A-Za-z0-9]{0,5}$/
    if (regex.test(value)) {
      setCode(value)
      setError('')
      setFileData(null)
    } else {
      setError('Only 5-character alphanumeric codes are allowed')
      setFileData(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFileData(null)

    if (code.length !== 5) {
      setError('Code must be exactly 5 characters')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('random_id', code)
      .maybeSingle()

    setLoading(false)

    if (error) {
      setError('Something went wrong. Please try again.')
      return
    }

    if (!data) {
      setError('File not found')
      return
    }

    setFileData(data)
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className='flex justify-center mt-[170px]'>
        <div className='bg-gray-100 w-96 p-6 rounded-xl shadow'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
            <label className='text-sm font-medium text-gray-700'>Enter 5-character Code</label>
            <input
              type='text'
              value={code}
              onChange={handleChange}
              placeholder='e.g. A1b2C'
              className='border border-gray-300 rounded px-4 py-2 outline-none focus:ring-2 focus:ring-primary'
              maxLength={5}
            />
            {error && <p className='text-sm text-red-500'>{error}</p>}
            <button
              type='submit'
              disabled={loading}
              className='bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition'
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {fileData && (
            <div className='mt-4 p-3 bg-green-100 text-green-700 rounded flex flex-col gap-2'>
              <label className='font-medium'>File found! Open preview URL:</label>
              <div className='flex gap-2 items-center'>
                <input
                  type='text'
                  readOnly
                  value={`http://localhost:3000/f/${fileData.id}`}
                  className='flex-1 border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed'
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:3000/f/${fileData.id}`)
                    toast('URL copied to clipboard!')
                  }}
                  className='bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition'
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Search
