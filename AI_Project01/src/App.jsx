import { useEffect, useRef, useState } from "react"
import ChatWindow from "./components/ChatWindow"
import ChatInput from "./components/ChatInput"

function App() {
  const [darkMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] =
  useState(null)
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("ai-chats")

    return savedChats
      ? JSON.parse(savedChats)
      : [
          {
            id: 1,
            title: "New Chat",
            messages: [
              {
                role: "assistant",
                content: "Hello, I am PRABAV. How can I help you today?",
              },
            ],
          },
        ]
  })

  const [activeChatId, setActiveChatId] = useState(1)
  const activeChat = chats.find((chat) => chat.id === activeChatId)
  const bottomRef = useRef(null)
  const controllerRef = useRef(null)

  useEffect(() => {
    localStorage.setItem("ai-chats", JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [activeChat?.messages])
  useEffect(() => {
  console.log("uploadedFile changed:",uploadedFile)
}, [uploadedFile])

  const updateMessages = (messages) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages } : chat
      )
    )
  }

  const deleteMessage = (index) => {
    const updated = activeChat?.messages.filter((_, i) => i !== index) || []
    updateMessages(updated)
  }

  const handleSend = async (text) => {
    setLoading(true)

    const userMessage = {
      role: "user",
      content: text,
    }

    const updatedMessages = [...(activeChat?.messages || []), userMessage].slice(
      -10
    )

    const assistantMessage = {
      role: "assistant",
      content: "",
    }

    updateMessages([...updatedMessages, assistantMessage])

    try {
      controllerRef.current = new AbortController()
      console.log("Uploaded File:", uploadedFile)
      console.log("Sending uploadedFile:", uploadedFile)

      const response = await fetch("https://prabav-ai.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  messages: updatedMessages,
  uploadedFile,
}),
        signal: controllerRef.current.signal,
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let currentText = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        currentText += chunk

        updateMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: currentText,
          },
        ])
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Generation stopped")
      } else {
        console.log(error)
      }
    }

    setLoading(false)
  }

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [
        {
          role: "assistant",
          content: "Hello, I am PRABAV. How can I help you today?",
        },
      ],
    }

    setChats((prev) => [...prev, newChat])
    setActiveChatId(newChat.id)
  }

  const deleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id)

    if (updatedChats.length > 0) {
      setChats(updatedChats)
      setActiveChatId(updatedChats[0].id)
    } else {
      const newChat = {
        id: Date.now(),
        title: "New Chat",
        messages: [
          {
            role: "assistant",
            content: "Hello, ask me anything!",
          },
        ],
      }

      setChats([newChat])
      setActiveChatId(newChat.id)
    }
  }

  return (
    <div
      className={`h-screen overflow-hidden flex ${
        darkMode ? "bg-[#05070d] text-white" : "bg-white text-black"
      }`}
    >
      <div className="hidden md:flex w-76 bg-[#080b13]/95 border-r border-blue-500/15 flex-col shadow-2xl shadow-blue-950/30">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-lg font-black shadow-lg shadow-blue-600/30">
              P
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-blue-300">
                PRABAV
              </p>
              <h1 className="text-xl font-semibold leading-tight">AI CHAT</h1>
            </div>
          </div>

          <button
            onClick={createNewChat}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98]"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            Recent chats
          </div>

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group mb-2 flex items-center justify-between rounded-2xl border px-3 py-3 transition ${
                activeChatId === chat.id
                  ? "border-blue-500/40 bg-blue-600/15 shadow-lg shadow-blue-950/25"
                  : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              <div
                onClick={() => setActiveChatId(chat.id)}
                className="min-w-0 flex-1 cursor-pointer"
              >
                <p className="truncate text-sm font-medium text-slate-100">
                  {chat.title}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {chat.messages.at(-1)?.content || "No messages yet"}
                </p>
              </div>

              <button
                onClick={() => deleteChat(chat.id)}
                aria-label="Delete chat"
                className="ml-2 grid h-8 w-8 place-items-center rounded-xl text-slate-500 opacity-70 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
              >
                x
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-4 text-xs leading-5 text-slate-500">
          Connected to local chat server
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.26),transparent_34%),linear-gradient(135deg,rgba(14,165,233,0.12),transparent_32%)]" />

        <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#070a12]/80 px-4 py-4 backdrop-blur md:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-300">
              Assistant
            </p>
            <h2 className="text-xl font-bold">PRABAV AI</h2>
          </div>
          <button
            onClick={createNewChat}
            className="rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/20 md:hidden"
          >
            New
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto flex min-h-full max-w-4xl flex-col">
            <ChatWindow
              messages={activeChat?.messages || []}
              onDelete={deleteMessage}
            />

            {loading && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300 [animation-delay:240ms]" />
                </div>
                <span className="flex-1">AI is typing...</span>

                <button
                  onClick={() => controllerRef.current?.abort()}
                  className="rounded-xl bg-red-500/15 px-3 py-1.5 font-semibold text-red-200 transition hover:bg-red-500/25"
                >
                  Stop
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="relative z-10">
         <ChatInput
  onSend={handleSend}
  onFileUpload={(data) =>
    setUploadedFile(data.filename)
  }
/> 
        </div>
      </div>
    </div>
  )
}

export default App
