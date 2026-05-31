import { useState } from "react"

function ChatInput({
  onSend,
  onFileUpload,
}) {
  const [input, setInput] =
    useState("")

  const handleSend = () => {
    if (!input.trim()) return

    onSend(input)
    setInput("")
  }

  const handleFileChange =
    async (e) => {
      const file =
        e.target.files[0]

      if (!file) return

      const formData =
        new FormData()

      formData.append(
        "file",
        file
      )

      try {
        const response =
          await fetch(
            "http://localhost:5000/upload",
            {
              method: "POST",
              body: formData,
            }
          )

        const data =await response.json()
        console.log("Upload Data:", data)
        if (onFileUpload) {
  console.log(
    "Calling onFileUpload",
    data.filename
  )

  onFileUpload(data)
}

        console.log(data)
console.log(`Uploaded: ${data.originalName}`)

        if (onFileUpload) {
          onFileUpload(data)
        }
      } catch (error) {
        console.error(error)

        alert(
          "File upload failed"
        )
      }
    }

  return (
    <div className="border-t border-white/10 bg-[#070a12]/85 px-4 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-3xl border border-blue-400/20 bg-[#0b1020]/95 p-2 shadow-2xl shadow-blue-950/30">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={
            handleFileChange
          }
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded-2xl px-3 py-3 text-xl text-slate-300 hover:bg-white/5"
        >
          📎
        </label>

        <input
          type="text"
          placeholder="Ask anything..."
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter"
            ) {
              handleSend()
            }
          }}
        />

        <button
          onClick={handleSend}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98]"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInput

