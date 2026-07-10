import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShoppingCart, Store, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle, LogoPulse } from "../components/Layout";
import { api } from "../utils/api";

function MeshBackground() {
  const { theme: T } = useTheme();
  const nodes = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    cx: `${5 + (i % 4) * 30}%`,
    cy: `${8 + Math.floor(i / 4) * 28}%`,
    delay: `${i * 0.3}s`,
    dur: `${2.5 + (i % 3) * 0.6}s`,
  }));
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes nodeFloat { 0%,100%{opacity:.35;transform:translateY(0)} 50%{opacity:.85;transform:translateY(-10px)} }
        @keyframes lineFade { 0%,100%{opacity:.04} 50%{opacity:.14} }
      `}</style>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        {nodes.map((a, i) =>
          nodes
            .slice(i + 1, i + 4)
            .map((b, j) => (
              <line
                key={`${i}-${j}`}
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                stroke={T.amber}
                strokeWidth="1"
                style={{
                  animation: `lineFade ${2 + j * 0.5}s ease-in-out infinite`,
                  animationDelay: a.delay,
                }}
              />
            )),
        )}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.cx}
            cy={n.cy}
            r="5"
            fill={T.amber}
            style={{
              animation: `nodeFloat ${n.dur} ease-in-out infinite`,
              animationDelay: n.delay,
            }}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            T.name === "dark"
              ? "radial-gradient(ellipse 80% 70% at 50% 50%,rgba(10,10,15,.82) 0%,rgba(10,10,15,.97) 70%)"
              : "radial-gradient(ellipse 80% 70% at 50% 50%,rgba(244,241,235,.82) 0%,rgba(244,241,235,.97) 70%)",
        }}
      />
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  const { theme: T } = useTheme();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: T.textDim,
            display: "block",
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={isPass ? (show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: T.bg,
            color: T.text,
            border: `1px solid ${focused ? T.amber : T.border}`,
            borderRadius: 10,
            padding: `12px ${isPass ? "40px" : "14px"} 12px 14px`,
            fontSize: 14,
            outline: "none",
            fontFamily: "'Inter',sans-serif",
            boxShadow: focused ? `0 0 0 3px ${T.amberBg}` : "none",
            transition: "all .2s",
          }}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textDim,
              display: "flex",
              alignItems: "center",
            }}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { theme: T } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "register" && !agreed) {
      setError("Please agree to the Terms & Conditions to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await api(
        mode === "login" ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(
            mode === "login"
              ? { email, password }
              : { name, email, phone, password, role },
          ),
        },
      );
      login(data.user, data.token);
      setPageLoading(true);
      setTimeout(() => navigate("/home"), 1400);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (pageLoading) return <LogoPulse />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::placeholder{color:${T.textMuted}}
      `}</style>
      <MeshBackground />
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="/logo.png"
            alt="PaxeL"
            style={{
              width: 84,
              height: 84,
              marginBottom: 6,
              filter: "drop-shadow(0 8px 24px rgba(242,169,59,.35))",
            }}
          />
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: T.text,
            }}
          >
            Pax<span style={{ color: T.amber }}>eL</span>
          </div>
          <div style={{ fontSize: 13, color: T.textDim, marginTop: 3 }}>
            Trade safely across Nigeria
          </div>
        </div>

        <div
          style={{
            background:
              T.name === "dark"
                ? "rgba(28,31,43,.92)"
                : "rgba(255,255,255,.92)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "24px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              background: T.bg,
              borderRadius: 10,
              padding: 4,
              marginBottom: 22,
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                style={{
                  flex: 1,
                  border: "none",
                  cursor: "pointer",
                  background: mode === m ? T.amber : "transparent",
                  color: mode === m ? "#0A0A0F" : T.textDim,
                  fontWeight: mode === m ? 700 : 400,
                  fontSize: 14,
                  padding: "9px 0",
                  borderRadius: 7,
                  transition: "all .2s",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <Field
                  label="Full name"
                  value={name}
                  onChange={setName}
                  placeholder="Amaka Eze"
                  required
                />
                <Field
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="08012345678"
                />
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: T.textDim,
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    I am primarily a
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { v: "buyer", Icon: ShoppingCart },
                      { v: "seller", Icon: Store },
                    ].map((r) => (
                      <button
                        key={r.v}
                        type="button"
                        onClick={() => setRole(r.v)}
                        style={{
                          flex: 1,
                          border: `1px solid ${role === r.v ? T.amber : T.border}`,
                          background: role === r.v ? T.amberBg : "transparent",
                          color: role === r.v ? T.amber : T.textDim,
                          borderRadius: 8,
                          padding: "9px 0",
                          fontSize: 13,
                          cursor: "pointer",
                          fontWeight: role === r.v ? 600 : 400,
                          fontFamily: "'Inter',sans-serif",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <r.Icon size={15} /> {r.v}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <Field
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            {mode === "register" && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <div
                    onClick={() => setAgreed((a) => !a)}
                    style={{
                      width: 18,
                      height: 18,
                      flexShrink: 0,
                      marginTop: 2,
                      borderRadius: 5,
                      border: `2px solid ${agreed ? T.amber : T.border}`,
                      background: agreed ? T.amber : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    {agreed && (
                      <Check size={12} strokeWidth={3.5} color="#0A0A0F" />
                    )}
                  </div>
                  <span
                    style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}
                  >
                    I agree to PaxeL's{" "}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/terms");
                      }}
                      style={{
                        color: T.amber,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Terms & Conditions
                    </span>
                    , including the no-refund policy after dispatch and escrow
                    release rules.
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: T.rustBg,
                  border: `1px solid ${T.rustBorder}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 14,
                  fontSize: 13,
                  color: T.rust,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === "register" && !agreed)}
              style={{
                width: "100%",
                border: "none",
                cursor:
                  loading || (mode === "register" && !agreed)
                    ? "not-allowed"
                    : "pointer",
                background:
                  loading || (mode === "register" && !agreed)
                    ? T.border
                    : T.amber,
                color:
                  loading || (mode === "register" && !agreed)
                    ? T.textDim
                    : "#0A0A0F",
                fontWeight: 700,
                fontSize: 15,
                padding: "13px 0",
                borderRadius: 10,
                marginBottom: 12,
                fontFamily: "'Inter',sans-serif",
                transition: "all .2s",
              }}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login to PaxeL"
                  : "Create account"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 12, color: T.textDim }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <button
            type="button"
            onClick={() =>
              (window.location.href = `${import.meta.env.VITE_API_URL || "https://paxel-backend.onrender.com"}/auth/google`)
            }
            style={{
              width: "100%",
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.text,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              padding: "12px 0",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: "'Inter',sans-serif",
              transition: "border-color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.amber)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20H24v8h11.3C33.6 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.5-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1L6 33.2C9.5 39.5 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.2 5.2C41 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: T.textMuted,
            marginTop: 16,
          }}
        >
          © {new Date().getFullYear()} PaxeL · GlobTec · Built on Nomba
        </p>
      </div>
    </div>
  );
}
