import React, { useState } from 'react'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import Navbar from '../components/Navbar'

// Datos de ejemplo
const sampleConvos = [
  { id: '1', name: 'ROCHA EL MEJOR', lastMessage: 'Hola, ¿cómo estás?' },
  { id: '2', name: 'Empresa XYZ', lastMessage: 'Gracias por tu interés.' }
]
const sampleMessages = {
  '1': [
    { text: 'Hola', fromMe: false },
    { text: '¡Hola! ¿En qué puedo ayudarte?', fromMe: true }
  ],
  '2': [
    { text: 'Bienvenido', fromMe: false },
    { text: 'Gracias por responder.', fromMe: true }
  ]
}

export default function ChatApp() {
  const [convos] = useState(sampleConvos)
  const [selected, setSelected] = useState(sampleConvos[0]?.id)
  const [allMessages, setAllMessages] = useState(sampleMessages)

  const handleSend = newText => {
    setAllMessages(msgs => ({
      ...msgs,
      [selected]: [...(msgs[selected] || []), { text: newText, fromMe: true }]
    }))
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <ChatList
        convos={convos}
        selectedId={selected}
        onSelect={setSelected}
      />
      <ChatWindow
        messages={allMessages[selected] || []}
        onSend={handleSend}
      />
    </div>
  )
}
