'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/app/lib/superbaseClient';
import { useUser } from '@clerk/nextjs';

function FilePreview() {
  const { fileid } = useParams();
  const [file, setFile] = useState(null);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [sendingMail, setSendingMail] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const { user } = useUser();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  useEffect(() => {
    async function fetchFile() {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('id', fileid)
          .single();

        if (error || !data) {
          setError('File not found');
          setFile(null);
        } else {
          setFile(data);
          if (data.password) {
            setUsePassword(true);
            setPassword('');
          } else {
            setUsePassword(false);
          }
        }
      } catch (e) {
        setError('Something went wrong');
        setFile(null);
      }
      setLoading(false);
    }

    if (fileid) fetchFile();
  }, [fileid]);

  const handleSavePassword = async () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    setSavingPassword(true);
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const { error } = await supabase
        .from('files')
        .update({ password: hashedPassword })
        .eq('random_id', fileid);

      if (error) {
        toast.error('Failed to save password: ' + error.message);
      } else {
        toast.success('Password saved successfully!');
        setUsePassword(true);
        setPassword('');
      }
    } catch (err) {
      toast.error('Error saving password');
    }
    setSavingPassword(false);
  };

  const copyToClipboard = () => {
    if (fileid) {
      const shortUrl = `${baseUrl}/f/${fileid}`;
      navigator.clipboard.writeText(shortUrl);
      toast.success('URL copied to clipboard!');
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    if (!file) {
      toast.error('File data is missing');
      return;
    }

    setSendingMail(true);

    try {
      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `File Shared: ${file.name}`,
          html: `
  <div
    style="
      max-width: 480px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      text-align: center;
      font-family: 'Outfit', sans-serif;
    "
  >
   
        <img src="https://file-share-seven-silk.vercel.app/logo.svg" width="150" height="100" alt="Logo" />
     
    

    <h2>
      <strong style="color: #007bff;">Receive Your</strong>
      File Shared With You
    </h2>
    <h3 style="text-align: center; margin-bottom: 50px">${file.name}</h3>
    <a
      href="${baseUrl}/f/${fileid}"
      style="
        background: #007bff;
        color: #fff;
        font-weight: 600;
        padding: 12px 139px;
        cursor: pointer;
        border-radius: 5px;
        display: inline-block;
        text-decoration: none;
      "
    >
      Download Your file
    </a>
    <p style="color: #9ca3af">*Terms & Conditions Applied</p>
    <p>
      Try
      <a href="https://file-share-seven-silk.vercel.app" style="text-decoration: none; color: #007bff">Share.io</a>
      To share your file easily With Anyone
    </p>
  </div>
`,
          text: `File Shared: ${file.name}\nDownload: ${baseUrl}/f/${fileid}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      toast.success('Email sent successfully!');
      setEmail('');
    } catch (err) {
      toast.error('Failed to send email: ' + err.message);
    } finally {
      setSendingMail(false);
    }
  };



  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-600">{error}</p>;
  if (!file) return <p className="text-center mt-6">File not found</p>;

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const fileExt = file.name.split('.').pop().toLowerCase();
  const isImage = imageExtensions.includes(fileExt);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="p-6 max-w-4xl mx-auto border rounded-xl shadow-lg bg-white">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: File Preview */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={isImage ? file.url : '/file.png'}
              alt={file.name}
              className="w-40 h-40 object-contain rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/file.png';
              }}
            />
            <div className="text-center">
              <h2 className="text-lg font-semibold">{file.name}</h2>
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(file.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Right: Options */}
          <div className="md:col-span-2 space-y-6">
            {/* Short URL */}
            <div>
              <label className="text-sm font-semibold text-gray-600">Short URL</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={`${baseUrl}/f/${fileid}`}
                  className="border p-2 rounded w-full"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Password Section */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                />
                Enable Password?
              </label>
              {usePassword && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <button
                    onClick={handleSavePassword}
                    disabled={savingPassword}
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    {savingPassword ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Send Email */}
            <div>
              <label className="block text-sm font-semibold mb-1">Send File to Email</label>
              <input
                type="email"
                placeholder="Enter recipient email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={handleSendEmail}
                disabled={sendingMail}
                className="bg-primary text-white px-4 py-2 rounded w-full"
              >
                {sendingMail ? 'Sending...' : 'Send Mail'}
              </button>
            </div>

            {/* Newsletter Button (Admin Only) */}
            {user?.publicMetadata?.role === 'admin' && (
              <div>
                <button
                  onClick={handleSendNewsletter}
                  disabled={sendingNewsletter}
                  className="bg-purple-600 text-white px-4 py-2 rounded w-full"
                >
                  {sendingNewsletter ? 'Sending Newsletter...' : 'Send as Newsletter 🚀'}
                </button>
              </div>
            )}

            {/* Random ID */}
            <div className="mt-2">
              <label className="block text-sm font-semibold mb-1">File Random ID</label>
              <input
                type="text"
                readOnly
                value={file.random_id}
                className="border p-2 rounded w-full bg-gray-100 text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FilePreview;
