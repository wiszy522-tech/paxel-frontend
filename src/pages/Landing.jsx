import { useNavigate } from "react-router-dom";
import { ShieldCheck, Bike, Bus, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "../components/Layout";

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: "Escrow protection",
    body: "Your money sits safely locked until delivery is proven — never released on trust alone.",
  },
  {
    Icon: Bike,
    title: "Local dispatch",
    body: "Rider delivers to your door. Confirm with a fingerprint tap and funds release instantly.",
  },
  {
    Icon: Bus,
    title: "Interstate waybill",
    body: "Shipping cross-country by bus? We track driver, waybill number, and live photo proof.",
  },
  {
    Icon: Sparkles,
    title: "AI trade assistant",
    body: "Ask about any trade, dispute, or how escrow works — get answers in plain English, anytime.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Agree on a trade",
    body: "Find a listing or arrange a deal, then lock the price in PaxeL.",
  },
  {
    n: "02",
    title: "Funds go to escrow",
    body: "Your payment is held safely — the seller can't touch it yet.",
  },
  {
    n: "03",
    title: "Delivery is verified",
    body: "Fingerprint on doorstep, or photo proof for interstate transport.",
  },
  {
    n: "04",
    title: "Funds release",
    body: "Only once delivery is confirmed does the seller get paid.",
  },
];

export default function Landing() {
  const { theme: T } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box}
      `}</style>

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background:
            T.name === "dark"
              ? "rgba(10,10,15,0.85)"
              : "rgba(244,241,235,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="PaxeL" style={{ height: 34 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <button
            onClick={() => navigate("/auth")}
            style={{
              background: T.amber,
              color: "#0A0A0F",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Login
          </button>
        </div>
      </nav>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 20px 40px",
          display: "flex",
          flexWrap: "wrap-reverse",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div style={{ flex: "1 1 380px", minWidth: 300 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: T.jadeBg,
              border: `1px solid ${T.jadeBorder}`,
              color: T.jade,
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            <ShieldCheck size={13} /> Escrow-powered · Built on Nomba
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(30px, 5vw, 46px)",
              color: T.text,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Trade with strangers,{" "}
            <span style={{ color: T.amber }}>anywhere in Nigeria</span> —
            without the risk
          </h1>
          <p
            style={{
              fontSize: 16,
              color: T.textDim,
              lineHeight: 1.7,
              marginBottom: 28,
              maxWidth: 480,
            }}
          >
            No more sending money on trust alone. PaxeL locks buyer funds in
            escrow and only releases them once delivery is proven — by
            fingerprint at the door, or photo evidence across state lines.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/auth")}
              style={{
                background: T.amber,
                color: "#0A0A0F",
                border: "none",
                borderRadius: 12,
                padding: "14px 28px",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 8px 24px rgba(242,169,59,.3)",
              }}
            >
              Get started free
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                background: "transparent",
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "14px 28px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              See how it works
            </button>
          </div>
        </div>

        <div
          style={{
            flex: "1 1 300px",
            minWidth: 260,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${T.amberBg} 0%, transparent 70%)`,
              filter: "blur(10px)",
            }}
          />
          <img
            src="/hero-mockup.png"
            alt="PaxeL app on phone"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 340,
              filter: `drop-shadow(0 24px 48px ${T.shadow})`,
            }}
          />
        </div>
      </section>

      <section
        style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px 60px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 16,
                padding: 22,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: T.amberBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <f.Icon size={22} color={T.amber} />
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.text,
                  marginBottom: 6,
                }}
              >
                {f.title}
              </div>
              <div
                style={{ fontSize: 13.5, color: T.textDim, lineHeight: 1.6 }}
              >
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        style={{ background: T.surfaceAlt, padding: "60px 20px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: T.text,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            How PaxeL works
          </h2>
          <p
            style={{
              fontSize: 14,
              color: T.textDim,
              textAlign: "center",
              marginBottom: 36,
            }}
          >
            Four steps. No side deals, no guesswork, no "just trust me."
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {STEPS.map((s) => (
              <div key={s.n}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 700,
                    fontSize: 22,
                    color: T.amber,
                    marginBottom: 8,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: T.text,
                    marginBottom: 6,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{ fontSize: 13.5, color: T.textDim, lineHeight: 1.6 }}
                >
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "36px 28px",
            maxWidth: 480,
            width: "100%",
          }}
        >
          <img
            src="/nomba-mark.png"
            alt="Nomba"
            style={{ height: 40, opacity: T.name === "dark" ? 0.9 : 0.75 }}
          />
          <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
            Payments and virtual accounts on PaxeL are powered by Nomba's
            infrastructure — real bank rails, real settlement.
          </div>
        </div>
      </section>

      <section style={{ padding: "20px 20px 72px", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: T.text,
            marginBottom: 18,
          }}
        >
          Ready to trade without the risk?
        </h2>
        <button
          onClick={() => navigate("/auth")}
          style={{
            background: T.amber,
            color: "#0A0A0F",
            border: "none",
            borderRadius: 12,
            padding: "14px 36px",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 24px rgba(242,169,59,.3)",
          }}
        >
          Create your free account
        </button>
      </section>

      <footer
        style={{
          borderTop: `1px solid ${T.border}`,
          padding: "24px 20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 12, color: T.textMuted }}>
          © {new Date().getFullYear()} PaxeL · GlobTec · Built on Nomba
        </p>
      </footer>
    </div>
  );
}
