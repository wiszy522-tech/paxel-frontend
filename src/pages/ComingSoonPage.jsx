import { useState, useEffect, useRef } from "react";

const DARK = {
  bg: "#0A0A0F",
  surface: "#1C1F2B",
  border: "#2A2E3D",
  amber: "#F2A93B",
  jade: "#3FA66B",
  text: "#F1EDE3",
  textDim: "#9CA0AE",
};

const LIGHT = {
  bg: "#F2EADF",
  surface: "#F8F3EA",
  border: "#DFD0BC",
  amber: "#D97D0E",
  jade: "#256B45",
  text: "#231F16",
  textDim: "#7A7160",
};

const BUILD_STATUS = [
  {
    label: "Nomba API integration (virtual accounts, webhooks, transfers)",
    done: true,
  },
  { label: "Auth: email/password + Google OAuth, JWT", done: true },
  { label: "Wallet system: fund, lock, release, withdraw", done: true },
  {
    label:
      "Full trade lifecycle: create, waybill, confirm, dispute, auto-release",
    done: true,
  },
  {
    label: "Product marketplace: listings, search, categories, image upload",
    done: true,
  },
  { label: "Profile + KYC document upload", done: true },
  { label: "Real-time chat (Socket.io)", done: true },
  { label: "Reviews with verified buyer badge", done: true },
  { label: "Email notifications (Brevo)", done: true },
  { label: "Transaction & trade history UI", done: true },
  { label: "AI assistant", done: true },
  { label: "Didit KYC verification (NIN/BVN)", done: true },
  { label: "Frontend (React + Vite)", done: false },
];

const UPCOMING = [
  { icon: "💳", label: "Wallet & funding" },
  { icon: "🔒", label: "Escrow trades" },
  { icon: "🪪", label: "Identity verification" },
  { icon: "💬", label: "In-app chat" },
  { icon: "⭐", label: "Reviews" },
  { icon: "🚌", label: "Waybill tracking" },
];

function useBuildStatus(items, stepDelay = 450, loopPause = 2600) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    let idx = 0;
    let timer;

    function tick() {
      idx += 1;
      setRevealed(idx);
      if (idx < items.length) {
        timer = setTimeout(tick, stepDelay);
      } else {
        timer = setTimeout(() => {
          idx = 0;
          setRevealed(0);
          timer = setTimeout(tick, stepDelay);
        }, loopPause);
      }
    }

    timer = setTimeout(tick, stepDelay);
    return () => clearTimeout(timer);
  }, [items, stepDelay, loopPause]);

  return revealed;
}

export default function ComingSoonPage({ user, onLogout }) {
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  const [theme, setTheme] = useState(
    () => localStorage.getItem("paxel_theme") || "dark",
  );
  const C = theme === "dark" ? DARK : LIGHT;

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("paxel_theme", next);
  }

  const revealed = useBuildStatus(BUILD_STATUS);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [revealed]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 5vw",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes itemIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        onClick={toggleTheme}
        aria-label="Toggle light/dark theme"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 2,
          background: C.surface,
          border: `1px solid ${C.border}`,
          color: C.text,
          cursor: "pointer",
          width: 40,
          height: 40,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          transition: "border-color 0.2s, background 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.amber)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, rgba(242,169,59,0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          marginBottom: 28,
          animation: "float 4s ease-in-out infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: `2px solid ${C.amber}`,
            borderRadius: 24,
            animation: "ringPulse 2.4s ease-out infinite",
          }}
        />
        <img
          src="/logo.jpg"
          alt="PaxeL"
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            boxShadow: "0 8px 32px rgba(242,169,59,0.3)",
            position: "relative",
          }}
        />
      </div>

      <div
        style={{
          fontSize: 13,
          color: C.jade,
          fontFamily: "'IBM Plex Mono', monospace",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.jade,
            display: "inline-block",
          }}
        />
        Account active
      </div>

      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(28px, 4.5vw, 44px)",
          textAlign: "center",
          margin: "0 0 14px",
          lineHeight: 1.15,
        }}
      >
        Welcome to PaxeL, <span style={{ color: C.amber }}>{firstName}</span>.
      </h1>

      <p
        style={{
          fontSize: 15,
          color: C.textDim,
          textAlign: "center",
          maxWidth: 460,
          lineHeight: 1.75,
          marginBottom: 36,
        }}
      >
        Consider this your key card. Behind the scenes, the vault is already
        built: escrow, Nomba payments, and waybill verification are live and
        battle-tested. We're just dressing up the front door. Check back soon,
        we're worth the second visit.
      </p>

      <div
        ref={logRef}
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "18px 22px",
          marginBottom: 40,
          fontFamily: "'IBM Plex Mono', monospace",
          minWidth: 300,
          maxWidth: 520,
          width: "100%",
          height: 190,
          overflowY: "auto",
          textAlign: "left",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {BUILD_STATUS.slice(0, revealed).map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "5px 0",
              animation: "itemIn 0.35s ease forwards",
            }}
          >
            {item.done ? (
              <span
                style={{
                  color: C.jade,
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
            ) : (
              <span
                style={{
                  width: 8,
                  height: 8,
                  marginTop: 4,
                  borderRadius: "50%",
                  background: C.amber,
                  display: "inline-block",
                  flexShrink: 0,
                  animation: "blink 1s step-end infinite",
                }}
              />
            )}
            <span
              style={{
                fontSize: 12.5,
                lineHeight: 1.5,
                color: item.done ? C.textDim : C.amber,
              }}
            >
              {item.label}
              {!item.done && " (currently wiring...)"}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
          maxWidth: 520,
          width: "100%",
          marginBottom: 40,
        }}
      >
        {UPCOMING.map((f) => (
          <div
            key={f.label}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
              transition: "background 0.3s ease, border-color 0.3s ease",
            }}
          >
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span style={{ fontSize: 11.5, color: C.textDim }}>{f.label}</span>
            <span
              style={{
                fontSize: 9,
                color: C.amber,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.05em",
              }}
            >
              SOON
            </span>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 13,
          color: C.textDim,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        We'll notify you the moment trading opens.{" "}
        <strong style={{ color: C.text }}>Updates will be pushed soon.</strong>
      </p>

      <button
        onClick={onLogout}
        style={{
          background: "transparent",
          border: `1px solid ${C.border}`,
          color: C.textDim,
          cursor: "pointer",
          fontSize: 13,
          padding: "10px 22px",
          borderRadius: 10,
          fontFamily: "'Inter', sans-serif",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.amber)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
      >
        Log out
      </button>
    </div>
  );
}
