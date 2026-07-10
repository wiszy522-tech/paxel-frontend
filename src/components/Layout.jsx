import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  History,
  User,
  Package,
  Wallet,
  Plus,
  LogOut,
  Store,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";

const NAV = [
  { path: "/home", icon: Store, label: "Market" },
  { path: "/trades", icon: Package, label: "Trades" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function ThemeToggle() {
  const { theme: T, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${T.name === "dark" ? "light" : "dark"} mode`}
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
      {T.name === "dark" ? <Sun size={16} /> : <Moon size={16} />}
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
        gap: 24,
      }}
    >
      <style>{`
        @keyframes ringExpand {
          0% { transform: scale(0.6); opacity: 0.55; }
          70% { opacity: 0.12; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes logoBreathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(242,169,59,0.35)); }
          50% { transform: scale(1.14); filter: drop-shadow(0 0 34px rgba(242,169,59,0.85)); }
        }
        @keyframes bgGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes wordmarkFade {
          0%, 100% { opacity: 0.55; letter-spacing: 0px; }
          50% { opacity: 1; letter-spacing: 1px; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: 160,
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(242,169,59,0.28) 0%, transparent 72%)",
            animation: "bgGlow 2.2s ease-in-out infinite",
          }}
        />
        {[0, 0.5, 1].map((delay) => (
          <div
            key={delay}
            style={{
              position: "absolute",
              width: 88,
              height: 88,
              borderRadius: 20,
              border: "1.5px solid rgba(242,169,59,0.55)",
              animation: `ringExpand 2.2s ease-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
        <img
          src="/logo.png"
          alt="PaxeL"
          style={{
            position: "relative",
            width: 88,
            height: 88,
            animation: "logoBreathe 2.2s ease-in-out infinite",
          }}
        />
      </div>

      <span
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: "#F1EDE3",
          animation: "wordmarkFade 2.2s ease-in-out infinite",
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
        <img src="/logo.png" alt="PaxeL" style={{ height: 32 }} />
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: T.text,
          }}
        >
          Pax<span style={{ color: T.amber }}>eL</span>
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={() => navigate("/trades")}
        title="Trade & transaction history"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: "50%",
          width: 36,
          height: 36,
          cursor: "pointer",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.text,
        }}
      >
        <History size={17} />
      </button>

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
              minWidth: 180,
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
              { label: "My Profile", path: "/profile", icon: User },
              { label: "My Trades", path: "/trades", icon: Package },
              { label: "Wallet", path: "/wallet", icon: Wallet },
              { label: "List a Product", path: "/products/new", icon: Plus },
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
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = T.surfaceAlt)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <item.icon size={16} /> {item.label}
              </button>
            ))}
            <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
            <button
              onClick={() => {
                logout();
                navigate("/auth");
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
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <LogOut size={16} /> Logout
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
        padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
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
            <item.icon
              size={21}
              strokeWidth={active ? 2.4 : 2}
              color={active ? T.amber : T.textDim}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                color: active ? T.amber : T.textDim,
                fontFamily: "'Inter', sans-serif",
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

export function Layout({ children }) {
  return (
    <div style={{ paddingTop: 60, paddingBottom: 72, minHeight: "100vh" }}>
      <TopNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px" }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
