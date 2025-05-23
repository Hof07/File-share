// 'use slient'
"use client"
import Image from 'next/image'
import React, { useState } from 'react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-transparent backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="md:flex md:items-center md:gap-12">
            <a href="#">
              <Image src="/logo.svg" width={150} height={100} alt="logo" />
            </a>
          </div>

          {/* Navigation for desktop */}
          <div className="hidden md:block">
            <nav aria-label="Global">
              <ul className="flex items-center gap-8 text-sm font-semibold">
                <li>
                  <a className="text-gray-800 transition hover:text-[#3A04FF]" href="#">Home</a>
                </li>
                <li>
                  <a className="text-gray-600 transition hover:text-[#3A04FF]" href="#">Upload</a>
                </li>
                <li>
                  <a className="text-gray-600 transition hover:text-[#3A04FF]" href="#">About Us</a>
                </li>
                <li>
                  <a className="text-gray-600 transition hover:text-[#3A04FF]" href="#">Contact Us</a>
                </li>
              </ul>
            </nav>
          </div>

          {/* CTA Button + Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4">
              <a
                className="rounded-md bg-[#007DFC] text-sm font-medium text-white px-[28px] py-[12px] shadow transition-all duration-500 ease-in-out hover:rounded-[50px] hover:bg-[#007DFC]"
                href="/upload"
              >
                Get Started
              </a>
            </div>

            {/* Hamburger Menu Button */}
            <div className="block md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-sm bg-gray-100 p-2 text-gray-600 transition hover:text-gray-800"
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <ul className="flex flex-col p-4 gap-4 text-sm font-semibold">
            <li>
              <a className="block text-gray-800 hover:text-[#3A04FF]" href="#">
                Home
              </a>
            </li>
            <li>
              <a className="block text-gray-600 hover:text-[#3A04FF]" href="#">
                Upload
              </a>
            </li>
            <li>
              <a className="block text-gray-600 hover:text-[#3A04FF]" href="#">
                About Us
              </a>
            </li>
            <li>
              <a className="block text-gray-600 hover:text-[#3A04FF]" href="#">
                Contact Us
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

export default Header
