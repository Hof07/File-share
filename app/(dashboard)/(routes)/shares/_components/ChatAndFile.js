'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/app/lib/superbaseClient'
import { useUser } from '@clerk/nextjs'

function MessageItem({ msg, userEmail }) {
  const isOwn = msg.sender_email === userEmail
  return (
    <div
      style={{
        textAlign: isOwn ? 'right' : 'left',
        marginBottom: '10px',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '10px 15px',
          borderRadius: '20px',
          backgroundColor: isOwn ? '#d1e7dd' : '#f8f9fa',
          border: '1px solid #ccc',
          maxWidth: '60%',
          wordBreak: 'break-word',
          boxShadow: isOwn ? '2px 2px 6px rgba(0,128,0,0.2)' : '2px 2px 6px rgba(0,0,0,0.1)'
        }}
      >
        <p style={{ margin: 0 }}>{msg.message}</p>
        {msg.file_url && (
          <div style={{ marginTop: 5 }}>
            📎 <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ color: '#0d6efd' }}>
              Download File
            </a>
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
        {new Date(msg.created_at).toLocaleString()}
      </div>
    </div>
  )
}

export default function ChatAndFile() {
  const { user } = useUser()
  const userEmail = user?.primaryEmailAddress?.emailAddress || ''

  const [receiverShareId, setReceiverShareId] = useState('')
  const [step, setStep] = useState(1) // 1 = ask shareId, 2 = chat

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [file, setFile] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  async function checkReceiverExists(id) {
    const { data, error } = await supabase
      .from('users')
      .select('shareid')
      .eq('shareid', id)
      .single()
    if (error || !data) {
      alert('Invalid Share ID')
      return false
    }
    return true
  }

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    if (!receiverShareId.trim()) {
      alert('Please enter Share ID')
      return
    }
    const exists = await checkReceiverExists(receiverShareId.trim())
    if (exists) {
      setStep(2)
      fetchMessages(receiverShareId.trim())
    }
  }

  async function fetchMessages(receiverId) {
    const combinedShareId = generateCombinedShareId(userEmail, receiverId)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('share_id', combinedShareId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
      scrollToBottom()
    }

    const subscription = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `share_id=eq.${combinedShareId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

  function generateCombinedShareId(userEmail, receiverShareId) {
    return [userEmail, receiverShareId].sort().join('_')
  }

  const handleSend = async () => {
    if (!newMessage.trim() && !file) return alert('Please enter a message or select a file.')

    const combinedShareId = generateCombinedShareId(userEmail, receiverShareId)
    let file_url = null

    if (file) {
      const fileName = `${combinedShareId}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file)

      if (uploadError) {
        alert('File upload failed: ' + uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('chat-files').getPublicUrl(fileName)
      file_url = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('messages').insert([
      {
        share_id: combinedShareId,
        sender_email: userEmail,
        message: newMessage,
        file_url,
      },
    ])

    if (insertError) {
      alert('Failed to send message: ' + insertError.message)
      return
    }

    setNewMessage('')
    setFile(null)
  }

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-center">Enter Share ID to start chat</h2>
        <form onSubmit={handleInfoSubmit}>
          <input
            type="text"
            placeholder="Share ID to send message"
            value={receiverShareId}
            onChange={(e) => setReceiverShareId(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Start Chat
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 border rounded shadow bg-white flex flex-col h-[600px]">
      <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">
        Chatting with: <span className="font-mono">{receiverShareId}</span>
      </h2>

      <div
        className="flex-1 overflow-y-auto p-4 border rounded bg-gray-50 mb-4"
        style={{ wordBreak: 'break-word' }}
      >
        {messages.length > 0 ? (
          messages.map((msg, idx) => <MessageItem key={idx} msg={msg} userEmail={userEmail} />)
        ) : (
          <p className="text-center text-gray-500 mt-20">No messages yet. Start the conversation!</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        className="border rounded p-3 mb-2 resize-none"
        rows={3}
        placeholder="Type your message here..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
      >
        Send
      </button>
    </div>
  )
}
