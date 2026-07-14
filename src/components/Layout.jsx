import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";

const NAV = [
  { path: "/home", icon: "🏪", label: "Market" },
  { path: "/trades", icon: "📦", label: "Trades" },
  { path: "/wallet", icon: "💳", label: "Wallet" },
  { path: "/profile", icon: "👤", label: "Profile" },
];

export function ThemeToggle() {
  const { theme: T, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 999,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: T.text,
        transition: "all 0.2s",
      }}
    >
      {T.name === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export function LogoPulse() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "#0A0A0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <style>{`
        @keyframes logoPulse {
          0%,100%{transform:scale(1);opacity:1;box-shadow:0 0 0 0 rgba(242,169,59,0.4)}
          50%{transform:scale(1.15);opacity:0.8;box-shadow:0 0 0 20px rgba(242,169,59,0)}
        }
      `}</style>
      <img
        src="/logo.jpg"
        alt="PaxeL"
        style={{
          width: 88,
          height: 88,
          borderRadius: 20,
          animation: "logoPulse 1.5s ease-in-out infinite",
        }}
      />
      <span
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: "#F1EDE3",
        }}
      >
        Pax<span style={{ color: "#F2A93B" }}>eL</span>
      </span>
    </div>
  );
}

export function TopNav() {
  const { theme: T } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 60,
        background:
          T.name === "dark" ? "rgba(10,10,15,0.92)" : "rgba(244,241,235,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
      }}
    >
      <div
        onClick={() => navigate("/home")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <img
          src="/logo.jpg"
          alt="PaxeL"
          style={{ height: 30, borderRadius: 6 }}
        />
        <span
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: T.text,
          }}
        >
          Pax<span style={{ color: T.amber }}>eL</span>
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <ThemeToggle />

      <div style={{ position: "relative" }}>
        <div
          onClick={() => setMenuOpen((o) => !o)}
          style={{ cursor: "pointer" }}
        >
          <Avatar name={user?.name} photo={user?.profilePhoto} size={34} />
        </div>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 42,
              right: 0,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 8,
              minWidth: 190,
              boxShadow: `0 8px 32px ${T.shadow}`,
              zIndex: 200,
            }}
          >
            <div style={{ padding: "8px 12px", marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 12, color: T.textDim }}>
                {user?.email}
              </div>
            </div>
            {[
              { label: "My Profile", path: "/profile", icon: "👤" },
              { label: "My Trades", path: "/trades", icon: "📦" },
              { label: "Wallet", path: "/wallet", icon: "💳" },
              { label: "List a Product", path: "/products/new", icon: "➕" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: T.text,
                  cursor: "pointer",
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textAlign: "left",
                  fontFamily: "'Inter',sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = T.surfaceAlt)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
            <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: T.rust,
                cursor: "pointer",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export function BottomNav() {
  const { theme: T } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background:
          T.name === "dark" ? "rgba(10,10,15,0.95)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        padding: "8px 0 max(8px,env(safe-area-inset-bottom))",
      }}
    >
      {NAV.map((item) => {
        const active = pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                color: active ? T.amber : T.textDim,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {item.label}
            </span>
            {active && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: T.amber,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function AssistantFAB({ onOpen }) {
  const { theme: T } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="PaxeL Assistant"
      style={{
        position: "fixed",
        right: 16,
        bottom: 88,
        zIndex: 99,
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: `2px solid ${hovered ? T.amber : T.amberBorder}`,
        background: T.surface,
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        boxShadow: hovered
          ? `0 8px 24px rgba(242,169,59,0.4)`
          : `0 4px 16px ${T.shadow}`,
        transform: hovered ? "scale(1.08)" : "scale(1)",
        transition: "all 0.2s",
      }}
    >
      <img
        src="/logo.jpg"
        alt="AI"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </button>
  );
}

export function Layout({ children, onAssistant }) {
  return (
    <div style={{ paddingTop: 60, paddingBottom: 72, minHeight: "100vh" }}>
      <TopNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px" }}>
        {children}
      </main>
      <BottomNav />
      <AssistantFAB onOpen={onAssistant} />
    </div>
  );
}
