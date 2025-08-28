"use client"
import React, { useState } from "react"
import { supabase } from "@/app/lib/superbaseClient"
import { Download } from "lucide-react"

export default function BookSearch() {
  const [semester, setSemester] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [submitted, setSubmitted] = useState(false) // 👉 form submit check

  const handleChange = (e) => {
    setSemester(e.target.value)
    setError("")
    setBooks([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setBooks([])
    setSubmitted(true)

    if (!semester) {
      setError("Please select a semester")
      setSubmitted(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("semester", semester)
      .order("time", { ascending: false })

    setLoading(false)

    if (error) {
      setError("Something went wrong. Please try again.")
      return
    }

    if (!data || data.length === 0) {
      setError("No books found for this semester.")
      return
    }

    setBooks(data)
  }

  return (
    <div className="bg-transparent p-6">
      {/* Form Section → visible only if not submitted */}
      {!submitted && (
        <div className="flex justify-center relative top-[160px]">
          <div className="bg-gray-100 w-[500px] p-6 rounded-xl shadow">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">
                Select Semester
              </label>
              <select
                value={semester}
                onChange={handleChange}
                className="border border-gray-300 rounded px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose Semester --</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semester {i + 1}
                  </option>
                ))}
              </select>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
              >
                {loading ? "Finding..." : "Find Book"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Books Grid → visible only after submit */}
      {submitted && (
        <>
          {loading ? (
            <p className="text-center text-gray-500 mt-6">Loading books...</p>
          ) : error ? (
            <p className="text-center text-red-500 mt-6">{error}</p>
          ) : (
            books.length > 0 && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex flex-col border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition duration-300"
                  >
                    {/* Book Image → Full width */}
                    <div className="w-full h-56 overflow-hidden rounded-t-2xl">
                      <img
                        src={book.img_url}
                        alt={book.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Book Info */}
                    <div className="p-6 flex flex-col items-center">
                      <h2 className="text-lg font-bold text-gray-800 text-center line-clamp-2">
                        {book.name}
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        Semester {book.semester}
                      </p>

                      {/* Download Button */}
                      <a
                        href={book.book_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto w-full bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-600 
             hover:from-indigo-600 hover:via-blue-700 hover:to-indigo-700 
             text-white py-3 px-5 rounded-2xl text-center font-semibold 
             shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 
             flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <Download className="w-5 h-5" /> Download
                      </a>

                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}
