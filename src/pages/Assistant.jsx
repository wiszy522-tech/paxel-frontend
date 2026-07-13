import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../utils/api";

export default function AssistantWidget({ open, onClose }) {
  const { theme: T } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your PaxeL trade assistant. I can help you understand your trades, explain how escrow works, or guide you through any step. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));
      const data = await api("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = [
    "How does escrow work?",
    "Where is my order?",
    "How do I fund my wallet?",
    "What happens in a dispute?",
  ];

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes typingDot { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        .assistant-widget { animation: slideUp 0.25s ease-out; }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 800,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
        }}
      />

      <div
        className="assistant-widget"
        style={{
          position: "fixed",
          bottom: 80,
          left: 12,
          right: 12,
          zIndex: 801,
          maxWidth: 420,
          margin: "0 auto",
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          height: "min(520px, 70vh)",
          boxShadow: `0 24px 64px ${T.shadow}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: `1px solid ${T.border}`,
            background: T.name === "dark" ? "rgba(28,31,43,1)" : "#fff",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: T.amberBg,
              border: `1px solid ${T.amberBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            ✨
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: T.text,
              }}
            >
              PaxeL Assistant
            </div>
            <div
              style={{
                fontSize: 11,
                color: T.jade,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: T.jade,
                }}
              />
              Online · Powered by AI
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.textDim,
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 14px 4px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              {m.role === "assistant" && (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: T.amberBg,
                    border: `1px solid ${T.amberBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  ✨
                </div>
              )}
              <div
                style={{
                  maxWidth: "80%",
                  background: m.role === "user" ? T.amber : T.bg,
                  color: m.role === "user" ? "#0A0A0F" : T.text,
                  border: `1px solid ${m.role === "user" ? T.amber : T.border}`,
                  borderRadius:
                    m.role === "user"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  padding: "10px 13px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: T.amberBg,
                  border: `1px solid ${T.amberBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                ✨
              </div>
              <div
                style={{
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: "14px 14px 14px 4px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: 4,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: T.amber,
                      animation: `typingDot 1.4s ease-in-out infinite`,
                      animationDelay: `${i * 0.16}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                paddingLeft: 32,
              }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    setTimeout(() => send(), 10);
                  }}
                  style={{
                    background: T.amberBg,
                    border: `1px solid ${T.amberBorder}`,
                    color: T.amber,
                    borderRadius: 999,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div
          style={{
            padding: "10px 12px",
            borderTop: `1px solid ${T.border}`,
            flexShrink: 0,
            display: "flex",
            gap: 8,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask me anything about your trades..."
            style={{
              flex: 1,
              background: T.bg,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              outline: "none",
              fontFamily: "'Inter',sans-serif",
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "none",
              background: input.trim() && !loading ? T.amber : T.border,
              color: input.trim() && !loading ? "#0A0A0F" : T.textDim,
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              fontSize: 18,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
