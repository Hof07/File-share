export default function MessageItem({ msg, userEmail }) {
  return (
    <div className={`my-2 p-2 rounded ${msg.sender === userEmail ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}>
      {msg.message && <p>{msg.message}</p>}
      {msg.file_url && (
        <a href={msg.file_url} target="_blank" className="text-blue-600 underline">Download File</a>
      )}
      <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
    </div>
  )
}
