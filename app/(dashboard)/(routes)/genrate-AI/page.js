'use client'
import React from 'react';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center mt-[200px] space-y-4">
      <svg width="60" height="60" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6">
              <animate attributeName="stop-color" values="#3B82F6;#8B5CF6;#EC4899;#3B82F6" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#EC4899">
              <animate attributeName="stop-color" values="#EC4899;#8B5CF6;#3B82F6;#EC4899" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path
          fill="url(#ai-gradient)"
          d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245Z"
        />
      </svg>

      <h2 className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent text-4xl font-bold text-center">
        WORK IN PROGRESS...
      </h2>
    </div>
  );
}
