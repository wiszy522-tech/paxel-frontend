import { useState, useEffect } from "react";

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
  bg: "#F3ECDA",
  surface: "#FAF5EA",
  border: "#E0D3B8",
  amber: "#B9790A",
  jade: "#256B45",
  text: "#231F16",
  textDim: "#7A7160",
};

const UPCOMING = [
  { icon: "💳", label: "Wallet & funding" },
  { icon: "🔒", label: "Escrow trades" },
  { icon: "🪪", label: "Identity verification" },
  { icon: "💬", label: "In-app chat" },
  { icon: "⭐", label: "Reviews" },
  { icon: "🚌", label: "Waybill tracking" },
];

function useTypewriter(lines, speed = 28, pause = 1400) {
  const [text, setText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIndex];
    let timeout;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(
        () => setText(current.slice(0, text.length + 1)),
        speed,
      );
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(
        () => setText(current.slice(0, text.length - 1)),
        speed / 2,
      );
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setLineIndex((i) => (i + 1) % lines.length);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, lineIndex, lines, speed, pause]);

  return text;
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

  const statusLine = useTypewriter([
    "building_in_progress...",
    "wiring_up_the_vault...",
    "measuring_twice_cutting_once...",
    "almost_there...",
  ]);

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
        Your account is live, but the marketplace is still under construction.
        We're bolting the vault door on before we let anyone start trading.
      </p>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "16px 22px",
          marginBottom: 40,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          color: C.amber,
          minWidth: 260,
          textAlign: "center",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        status: {statusLine}
        <span style={{ animation: "blink 1s step-end infinite" }}>▍</span>
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
