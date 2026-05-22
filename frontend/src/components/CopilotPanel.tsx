"use client"

import { useState, useRef, useEffect } from "react"

interface Message { role: "user" | "assistant"; content: string }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function CopilotPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your DClaw Space Copilot. Ask me to book a desk, find a room, or check availability." }
  ])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return
    setInput("")

    const userMsg: Message = { role: "user", content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setStreaming(true)

    // Placeholder for streaming response
    setMessages(prev => [...prev, { role: "assistant", content: "" }])

    try {
      const res = await fetch(`${API_BASE}/api/v1/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context: {},
        }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.done && data.full) {
              fullContent = data.full
            } else if (data.content) {
              fullContent += data.content
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: "assistant", content: fullContent }
                return updated
              })
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (e) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't connect to the copilot service. Please try again.",
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#7660A8] text-white shadow-lg hover:bg-[#5E4B8B] flex items-center justify-center transition-all text-2xl"
        title="Open AI Copilot"
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Slide-over panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#EBEBF0] flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh" }}>
          {/* Header */}
          <div className="px-4 py-3 bg-[#7660A8] text-white">
            <p className="font-semibold text-sm">DClaw Space Copilot</p>
            <p className="text-xs opacity-80">AI workspace assistant</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-[#7660A8] text-white rounded-br-sm"
                    : "bg-[#F3F1F9] text-[#1A1A2E] rounded-bl-sm"
                }`}>
                  {msg.content || (streaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.15s" }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>·</span>
                    </span>
                  ) : "")}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#EBEBF0] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask me anything…"
              disabled={streaming}
              className="flex-1 text-sm border border-[#EBEBF0] rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7660A8] disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              className="w-8 h-8 rounded-full bg-[#7660A8] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#5E4B8B] transition-colors text-sm"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}
