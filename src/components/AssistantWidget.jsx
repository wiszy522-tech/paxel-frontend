import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Spinner } from "./UI";
import { api } from "../utils/api";

export default function AssistantWidget({ open, onClose }) {
  const { theme: T } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the PaxeL assistant. Ask me about a trade, escrow, disputes, or how the platform works.",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text.trim() };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setLoading(true);
    try {
      const data = await api("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg.content, history }),
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
            "Sorry, I'm having trouble right now. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 800,
        background: T.overlay,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 480,
          height: "72vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.25s ease-out",
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: T.text,
              }}
            >
              PaxeL Assistant
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.textDim,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: m.role === "user" ? T.amberBg : T.surfaceAlt,
                border: `1px solid ${m.role === "user" ? T.amberBorder : T.border}`,
                borderRadius: 14,
                padding: "10px 14px",
                fontSize: 14,
                color: T.text,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", padding: "10px 14px" }}>
              <Spinner size={18} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={send}
          style={{
            display: "flex",
            gap: 8,
            padding: 14,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask about a trade (e.g. PXL-XXXXXXXX)..."
            style={{
              flex: 1,
              background: T.bg,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              outline: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: T.amber,
              color: "#0A0A0F",
              border: "none",
              borderRadius: 10,
              padding: "0 18px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
