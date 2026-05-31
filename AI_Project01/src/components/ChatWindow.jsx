import MessageBubble from "./MessageBubble"

function ChatWindow({ messages, onDelete }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-4">
      {messages.map((message, index) => (
        <div key={index} className="group relative">
          <MessageBubble message={message} />

          <button
            onClick={() => onDelete(index)}
            aria-label="Delete message"
            className="absolute -top-2 right-2 grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-[#111827] text-xs text-slate-400 opacity-0 shadow-lg transition hover:border-red-400/40 hover:text-red-300 group-hover:opacity-100"
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}

export default ChatWindow
