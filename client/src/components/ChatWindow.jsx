import React, { useEffect, useRef, useState } from 'react'

export default function ChatWindow({ messages, onSend }) {
  const [text, setText] = useState('')
  const endRef = useRef()

  // Auto‐scroll down
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex-1 flex flex-col bg-white p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-xs px-3 py-2 rounded-lg break-words ${
              m.fromMe ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none"
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
