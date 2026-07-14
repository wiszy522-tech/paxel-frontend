import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../utils/api";

export default function AssistantWidget({ open, onClose }) {
  const { theme: T } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your PaxeL trade assistant. I can help with your trades, explain escrow, or guide you through any step. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const bottomRef = useRef();
  const inputRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function onDragStart(e) {
    if (e.target.closest("input, button, textarea")) return;
    const rect = widgetRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOffset({ x: clientX - rect.left, y: clientY - rect.top });
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging) return;

    function onMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const ww = widgetRef.current?.offsetWidth || 360;
      const wh = widgetRef.current?.offsetHeight || 520;
      const nx = Math.max(0, Math.min(clientX - dragOffset.x, W - ww));
      const ny = Math.max(0, Math.min(clientY - dragOffset.y, H - wh));
      setPos({ x: nx, y: ny });
    }

    function onUp() {
      setDragging(false);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, dragOffset]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const history = next
        .slice(1)
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));
      const data = await api("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history }),
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
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = [
    "How does escrow work?",
    "How do I fund my wallet?",
    "What happens in a dispute?",
    "Track my trade",
  ];

  const defaultBottom = 80;
  const defaultRight = 12;

  const widgetStyle =
    pos.x !== null
      ? {
          position: "fixed",
          left: pos.x,
          top: pos.y,
          right: "auto",
          bottom: "auto",
        }
      : {
          position: "fixed",
          bottom: defaultBottom,
          right: defaultRight,
          left: "auto",
          top: "auto",
        };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes assistantIn { from{opacity:0;transform:scale(0.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes dot1{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes dot2{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes dot3{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes widgetPulse {
          0%, 100% { box-shadow: 0 24px 64px ${T.shadow}, 0 0 0 0 ${T.amber}55; }
          50% { box-shadow: 0 24px 64px ${T.shadow}, 0 0 0 8px ${T.amber}00; }
        }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 800,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(3px)",
        }}
      />

      <div
        ref={widgetRef}
        style={{
          ...widgetStyle,
          zIndex: 801,
          width: "min(380px, calc(100vw - 24px))",
          height: "min(520px, 72vh)",
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          boxShadow: `0 24px 64px ${T.shadow}`,
          overflow: "hidden",
          animation:
            "assistantIn 0.22s ease-out, widgetPulse 2.2s ease-in-out 0.3s infinite",
          cursor: dragging ? "grabbing" : "default",
          userSelect: "none",
        }}
      >
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderBottom: `1px solid ${T.border}`,
            background: T.name === "dark" ? "#1C1F2B" : "#fff",
            flexShrink: 0,
            cursor: "grab",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src="/logo.jpg"
              alt="PaxeL"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: T.jade,
                border: `2px solid ${T.surface}`,
              }}
            />
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
            <div style={{ fontSize: 11, color: T.jade }}>● Online</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: "none",
              border: "none",
              color: T.textDim,
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 12px 4px",
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
                <img
                  src="/logo.jpg"
                  alt=""
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                />
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
                  padding: "9px 12px",
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
              <img
                src="/logo.jpg"
                alt=""
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  flexShrink: 0,
                }}
              />
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
                      animation: `dot${i + 1} 1.4s ease-in-out infinite`,
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
                paddingLeft: 30,
                paddingTop: 4,
              }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    setTimeout(send, 50);
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
            padding: "10px 10px",
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
            placeholder="Ask anything about your trades..."
            style={{
              flex: 1,
              background: T.bg,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 12px",
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
              borderRadius: 10,
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
