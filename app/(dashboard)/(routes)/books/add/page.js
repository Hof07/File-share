"use client"
import React, { useState } from "react"
// import { supabase } from "@/libs/supabaseClient"
import { supabase } from '../../../../lib/superbaseClient'


function Page() {
  const [bookName, setBookName] = useState("")
  const [semester, setSemester] = useState("1")
  const [image, setImage] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imgUrl = null
      let bookUrl = null

      // Upload Image (if exists)
      if (image) {
        const { data, error } = await supabase.storage
          .from("books")
          .upload(`images/${Date.now()}-${image.name}`, image)

        if (error) throw error

        const { data: publicUrl } = supabase.storage
          .from("books")
          .getPublicUrl(data.path)

        imgUrl = publicUrl.publicUrl
      }

      // Upload File (required)
      if (file) {
        const { data, error } = await supabase.storage
          .from("books")
          .upload(`files/${Date.now()}-${file.name}`, file)

        if (error) throw error

        const { data: publicUrl } = supabase.storage
          .from("books")
          .getPublicUrl(data.path)

        bookUrl = publicUrl.publicUrl
      }

      // Insert into table
      const { error: insertError } = await supabase.from("books").insert([
        {
          name: bookName,
          semester: parseInt(semester),
          img_url: imgUrl,
          book_url: bookUrl,
        },
      ])

      if (insertError) throw insertError

      alert("✅ Book inserted successfully!")
      setBookName("")
      setSemester("1")
      setImage(null)
      setFile(null)
    } catch (err) {
      console.error(err)
      alert("❌ Error inserting book")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <h2
          className="text-3xl font-bold text-center"
          style={{ color: "#007bff" }}
        >
          Insert New Book
        </h2>

        {/* Book Name */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-600">
            Book Name
          </label>
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#007bff] transition"
            placeholder="Enter book name"
            required
          />
        </div>

        {/* Book Image */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-600">
            Book Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[#007bff] transition">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-gray-500"
            />
          </div>
        </div>

        {/* Upload File */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-600">
            Upload File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[#007bff] transition">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500"
              required
            />
          </div>
        </div>

        {/* Semester Dropdown */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-600">
            Semester
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#007bff] transition"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Semester {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 transition"
        >
          {loading ? "Uploading..." : "Insert Book"}
        </button>
      </form>
    </div>
  )
}

export default Page
