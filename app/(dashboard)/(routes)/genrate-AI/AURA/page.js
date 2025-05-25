'use client'
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useUser } from '@clerk/nextjs';

import { ArrowUp, Eraser } from 'lucide-react';

const genAI = new GoogleGenerativeAI("AIzaSyCX6ZDPqYovFvPp7x5JQBYXz_-dsrJ_PK8");

export default function AURA() {
  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
      const result = await model.generateContent([input]);
      const response = await result.response.text();
      const aiMessage = { role: 'ai', content: response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Gemini Error:', error);
      const errorMsg = { role: 'ai', content: '⚠️ Failed to generate response. Try again.' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  // For auto expanding textarea height
  const handleInputChange = (e) => {
    setInput(e.target.value);

    e.target.style.height = 'auto'; // reset height
    e.target.style.height = e.target.scrollHeight + 'px'; // set height as per content
  };

  return (
    <div className="relative h-[calc(100vh-60px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-2 border-b flex justify-end flex-shrink-0 bg-white z-20">
        <button
          onClick={handleClearChat}
          className="text-red-600 hover:text-red-800 text-sm font-semibold transition"
          aria-label="Clear chat"
        >
          <Eraser />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0 mb-[72px]">
        {messages.length === 0 && (
          <div className="relative top-[210px] flex items-center justify-center">
            <h2
              className="text-5xl bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold gradient-animated"
            >
              Hello {user?.firstName || 'User'}
            </h2>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-black rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-2xl rounded-bl-none animate-pulse">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input area fixed at bottom */}
      <div className="sticky bottom-0 left-0 right-0 border-t bg-white z-10">
        <div className="p-4 flex items-center gap-2">
          {!loading ? (
            <textarea
              ref={inputRef}
              placeholder="Ask Aura something..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-48 overflow-y-auto"
              disabled={loading}
            />
          ) : (
            <div className="flex-1 h-12" />
          )}

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading && !input.trim()}
            aria-label="Send message"
          >
            <ArrowUp />
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 px-6 pb-3 bg-gray-50 rounded-b-xl">
          AURA can make mistakes sometimes, so please double-check the responses and feel free to ask again if needed.
        </div>
      </div>
    </div>
  );
}
