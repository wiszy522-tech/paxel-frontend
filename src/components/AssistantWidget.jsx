import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../utils/api";

const BUTTON_SIZE = 58;
const MARGIN = 16;
const BOTTOM_NAV_CLEARANCE = 88;

function TypingDots() {
  const { theme: T } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        padding: "12px 16px",
        alignItems: "center",
      }}
    >
      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: T.amber,
            animation: `dotBounce 1.1s ${i * 0.16}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingTrigger({ open, onToggle, pos, setPos }) {
  const { theme: T } = useTheme();
  const btnRef = useRef(null);
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const clamp = useCallback((x, y) => {
    const maxX = window.innerWidth - BUTTON_SIZE - MARGIN;
    const maxY = window.innerHeight - BUTTON_SIZE - BOTTOM_NAV_CLEARANCE;
    return {
      x: Math.min(Math.max(x, MARGIN), Math.max(maxX, MARGIN)),
      y: Math.min(Math.max(y, MARGIN + 60), Math.max(maxY, MARGIN + 60)),
    };
  }, []);

  function onPointerDown(e) {
    const rect = btnRef.current.getBoundingClientRect();
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    btnRef.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.current.moved = true;
    if (drag.current.moved) {
      setPos(clamp(drag.current.origX + dx, drag.current.origY + dy));
    }
  }

  function onPointerUp() {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (!drag.current.moved) onToggle();
  }

  useEffect(() => {
    function onResize() {
      setPos((p) => (p ? clamp(p.x, p.y) : p));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp, setPos]);

  const style = pos
    ? { top: pos.y, left: pos.x, right: "auto", bottom: "auto" }
    : {
        bottom: BOTTOM_NAV_CLEARANCE,
        right: MARGIN,
        top: "auto",
        left: "auto",
      };

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="AI trade assistant"
      style={{
        position: "fixed",
        ...style,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${T.amber}, ${T.amberDim})`,
        border: "none",
        cursor: "grab",
        zIndex: 850,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        touchAction: "none",
        userSelect: "none",
        animation: open ? "none" : "assistantGlow 2.4s ease-in-out infinite",
        transition: pos ? "none" : "transform 0.15s",
      }}
    >
      <style>{`
        @keyframes assistantGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(242,169,59,0.45), 0 4px 18px rgba(242,169,59,0.35); }
          50% { box-shadow: 0 0 0 12px rgba(242,169,59,0), 0 4px 24px rgba(242,169,59,0.55); }
        }
      `}</style>
      {open ? (
        <X size={24} color="#0A0A0F" />
      ) : (
        <Sparkles size={22} color="#0A0A0F" />
      )}
    </button>
  );
}

export default function AssistantWidget() {
  const { theme: T } = useTheme();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
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
  }, [messages, loading, open]);

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

  const panelAnchor = pos
    ? {
        bottom: "auto",
        right: "auto",
        top: Math.min(pos.y + BUTTON_SIZE + 10, window.innerHeight - 460),
        left: Math.min(Math.max(pos.x - 340, 12), window.innerWidth - 372),
      }
    : {
        bottom: BOTTOM_NAV_CLEARANCE + BUTTON_SIZE + 10,
        right: MARGIN,
        top: "auto",
        left: "auto",
      };

  return (
    <>
      <FloatingTrigger
        open={open}
        onToggle={() => setOpen((o) => !o)}
        pos={pos}
        setPos={setPos}
      />

      {open && (
        <div
          style={{
            position: "fixed",
            ...panelAnchor,
            zIndex: 840,
            width: "min(360px, calc(100vw - 24px))",
            height: "min(480px, 65vh)",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            boxShadow: `0 16px 48px ${T.shadow}`,
            animation: "assistantPanelIn 0.2s ease-out",
            overflow: "hidden",
          }}
        >
          <style>{`@keyframes assistantPanelIn { from { opacity:0; transform:translateY(8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: `1px solid ${T.border}`,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color={T.amber} />
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: T.text,
                }}
              >
                PaxeL Assistant
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: T.textDim,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
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
                  padding: "9px 13px",
                  fontSize: 13.5,
                  color: T.text,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: T.surfaceAlt,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                }}
              >
                <TypingDots />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={send}
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              borderTop: `1px solid ${T.border}`,
              flexShrink: 0,
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about a trade (PXL-XXXXXXXX)..."
              style={{
                flex: 1,
                background: T.bg,
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "9px 13px",
                fontSize: 13.5,
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                minWidth: 0,
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
                padding: "0 16px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
