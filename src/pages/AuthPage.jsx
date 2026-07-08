import { useState } from "react";

const C = {
  bg: "#0A0A0F",
  surface: "#1C1F2B",
  border: "#2A2E3D",
  amber: "#F2A93B",
  jade: "#3FA66B",
  rust: "#C1502E",
  text: "#F1EDE3",
  textDim: "#9CA0AE",
};

const API =
  import.meta.env.VITE_API_URL || "https://paxel-backend.onrender.com";

function LogoPulse() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <style>{`
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0.6; }
        }
        @keyframes fadeText {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
      <img
        src="/logo.jpg"
        alt="PaxeL"
        style={{
          width: 90,
          height: 90,
          borderRadius: 20,
          animation: "logoPulse 1.6s ease-in-out infinite",
          boxShadow: `0 0 40px rgba(242,169,59,0.3)`,
        }}
      />
      <span
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: C.text,
          animation: "fadeText 1.6s ease-in-out infinite",
        }}
      >
        Pax<span style={{ color: C.amber }}>eL</span>
      </span>
    </div>
  );
}

function MeshBackground() {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: `${8 + (i % 4) * 28}%`,
    y: `${10 + Math.floor(i / 4) * 35}%`,
    delay: `${i * 0.4}s`,
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
        @keyframes nodeFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-12px); opacity: 0.9; }
        }
        @keyframes linePulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.12; }
        }
      `}</style>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {nodes.map((a, i) =>
          nodes
            .slice(i + 1, i + 3)
            .map((b, j) => (
              <line
                key={`${i}-${j}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={C.amber}
                strokeWidth="1"
                style={{
                  animation: `linePulse ${2 + j}s ease-in-out infinite`,
                  animationDelay: a.delay,
                }}
              />
            )),
        )}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r="4"
            fill={C.amber}
            style={{
              animation: `nodeFloat ${2.5 + (n.id % 3) * 0.5}s ease-in-out infinite`,
              animationDelay: n.delay,
            }}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(242,169,59,0.05) 0%, rgba(10,10,15,0.97) 70%)`,
        }}
      />
    </div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          fontSize: 13,
          color: C.textDim,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: C.bg,
          color: C.text,
          border: `1px solid ${focused ? C.amber : C.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          fontSize: 14,
          outline: "none",
          transition: "border-color 0.2s",
          fontFamily: "'Inter', sans-serif",
        }}
      />
    </div>
  );
}

function AuthPage({ onLogin, onOpenTerms, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer");
  const [agreeTerms, setAgreeTerms] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register" && !agreeTerms) {
      setError("You must accept the Terms and Conditions to create an account");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { name, email, phone, password, role };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("paxel_token", data.token);
      localStorage.setItem("paxel_user", JSON.stringify(data.user));

      setPageLoading(true);
      setTimeout(() => {
        onLogin(data.user);
      }, 1200);
    } catch {
      setError("Network error — check your connection");
      setLoading(false);
    }
  }

  function handleGoogle() {
    window.location.href = `${API}/auth/google`;
  }

  if (pageLoading) return <LogoPulse />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #555; }
      `}</style>

      <MeshBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/logo.jpg"
            alt="PaxeL"
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              marginBottom: 14,
              boxShadow: `0 8px 32px rgba(242,169,59,0.25)`,
            }}
          />
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: C.text,
            }}
          >
            Pax<span style={{ color: C.amber }}>eL</span>
          </div>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>
            Trade safely across Nigeria
          </div>
        </div>

        <div
          style={{
            background: "rgba(28,31,43,0.9)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "32px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              background: C.bg,
              borderRadius: 10,
              padding: 4,
              marginBottom: 28,
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                style={{
                  flex: 1,
                  border: "none",
                  cursor: "pointer",
                  background: mode === m ? C.amber : "transparent",
                  color: mode === m ? "#0A0A0F" : C.textDim,
                  fontWeight: mode === m ? 700 : 400,
                  fontSize: 14,
                  padding: "9px 0",
                  borderRadius: 7,
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <Input
                  label="Full name"
                  value={name}
                  onChange={setName}
                  placeholder="Amaka Eze"
                  required
                />
                <Input
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="08012345678"
                />
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      fontSize: 13,
                      color: C.textDim,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    I am primarily a
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["buyer", "seller"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          flex: 1,
                          border: `1px solid ${role === r ? C.amber : C.border}`,
                          background:
                            role === r ? "rgba(242,169,59,0.1)" : "transparent",
                          color: role === r ? C.amber : C.textDim,
                          borderRadius: 8,
                          padding: "9px 0",
                          fontSize: 13,
                          cursor: "pointer",
                          fontWeight: role === r ? 600 : 400,
                          textTransform: "capitalize",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />

            {mode === "register" && (
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 16,
                  cursor: "pointer",
                  fontSize: 13,
                  color: C.textDim,
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: C.amber, flexShrink: 0 }}
                />
                <span>
                  I agree to PaxeL's{" "}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenTerms?.();
                    }}
                    style={{
                      color: C.amber,
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Terms and Conditions
                  </span>
                </span>
              </label>
            )}

            {error && (
              <div
                style={{
                  background: "rgba(193,80,46,0.1)",
                  border: `1px solid rgba(193,80,46,0.3)`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: C.rust,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === "register" && !agreeTerms)}
              style={{
                width: "100%",
                border: "none",
                cursor:
                  loading || (mode === "register" && !agreeTerms)
                    ? "not-allowed"
                    : "pointer",
                background:
                  loading || (mode === "register" && !agreeTerms)
                    ? C.border
                    : C.amber,
                color:
                  loading || (mode === "register" && !agreeTerms)
                    ? C.textDim
                    : "#0A0A0F",
                fontWeight: 700,
                fontSize: 15,
                padding: "14px 0",
                borderRadius: 10,
                marginBottom: 14,
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
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
              marginBottom: 14,
            }}
          >
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.textDim }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <button
            onClick={handleGoogle}
            style={{
              width: "100%",
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.text,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              padding: "13px 0",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.amber)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
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
            fontSize: 12,
            color: C.textDim,
            marginTop: 20,
          }}
        >
          By continuing you agree to PaxeL's terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
