import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

function MessageBubble({ message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`message-content max-w-[88%] rounded-3xl border px-5 py-4 text-sm leading-7 shadow-xl md:max-w-[78%] ${
          isUser
            ? "border-blue-400/40 bg-blue-600 text-white shadow-blue-950/30"
            : "border-white/10 bg-[#0b1020]/95 text-slate-100 shadow-black/25"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.8)]" />
            PRABAV
          </div>
        )}

        <ReactMarkdown
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "")

              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code
                  className="rounded bg-black/35 px-1.5 py-0.5 text-blue-100"
                  {...props}
                >
                  {children}
                </code>
              )
            },
          }}
        >
          {message.content.replace(/\n{3,}/g, "\n\n")}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default MessageBubble
