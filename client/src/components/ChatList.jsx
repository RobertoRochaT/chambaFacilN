import React from 'react'

export default function ChatList({ convos, selectedId, onSelect }) {
  return (
    <div className="md:w-1/3 border-r bg-white overflow-y-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Tus conversaciones</h2>
      <ul className="space-y-2">
        {convos.map(c => (
          <li
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`p-3 rounded cursor-pointer transition ${
              c.id === selectedId
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-100'
            }`}
          >
            <p className="font-medium">{c.name}</p>
            <p className="text-sm text-gray-500 truncate">{c.lastMessage}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
