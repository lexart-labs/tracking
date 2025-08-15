"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Message {
  id: number
  type: "user" | "bot"
  content: string
  time: string
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      time: "10:30 AM",
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const sendMessage = () => {
    if (message.trim() === "") return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message.trim(),
      time: getCurrentTime(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsTyping(true)

    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: "I have found more than one task associated with you and with that name, which of the following tasks would you like to track?",
        time: getCurrentTime(),
      }
      const taskMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: "Project: Internal, Task: Operations",
        time: getCurrentTime(),
      }
      const taskMessage2: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: "Project: Technisys, Task: Create ABM Operation",
        time: getCurrentTime(),
      }
      setMessages((prev) => [...prev, botMessage, taskMessage, taskMessage2])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const closeChat = () => {
    // setIsOpen(false)
    // Emmit a post event to parent to indicate that the chatbot is closed
    window.parent.postMessage({ type: 'chatbotClosed' }, '*')
  }

  return (
    <>
        <div className="z-50 animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-500">
          <div className="w-80 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Header del chatbot */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-700 text-white p-4 text-center relative">
              {/* Botón de cerrar */}
              <button
                onClick={closeChat}
                className="absolute top-3 right-3 w-6 h-6 text-white hover:bg-indigo-200 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Indicador de estado en línea */}
              <div className="absolute top-3 left-4 w-3 h-3 bg-green-400 rounded-full shadow-lg">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <h3 className="text-lg font-semibold">Asistente Virtual</h3>
              <p className="text-xs opacity-80 mt-1">En línea</p>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.type === "user"
                          ? "bg-gradient-to-r from-blue-500 via-purple-500 to-purple-700 text-white rounded-br-sm"
                          : "bg-white text-gray-700 border border-gray-200 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                  <div
                    className={`text-xs text-gray-400 mt-1 px-2 ${msg.type === "user" ? "text-right" : "text-left"}`}
                  >
                    {msg.time}
                  </div>
                </div>
              ))}

              {/* Indicador de escritura */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Área de input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center bg-gray-100 rounded-full p-1 transition-all duration-300 focus-within:bg-gray-200 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-purple-200">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={isTyping || message.trim() === ""}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-700 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}
