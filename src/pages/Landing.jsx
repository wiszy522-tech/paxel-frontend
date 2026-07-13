import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#0A0A0F",
  surface: "#1C1F2B",
  border: "#2A2E3D",
  amber: "#F2A93B",
  amberDim: "#B9790A",
  jade: "#3FA66B",
  rust: "#C1502E",
  text: "#F1EDE3",
  textDim: "#9CA0AE",
};

const STEPS = [
  { state: "SECURED", label: "Funds locked in escrow", color: C.amber },
  { state: "DISPATCHED", label: "Goods in transit", color: C.amber },
  { state: "RELEASED", label: "Payment released", color: C.jade },
];

function TradeTicket() {
  const [step, setStep] = useState(0);
  const [stamping, setStamping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStamping(true);
      setTimeout(() => {
        setStep((s) => (s + 1) % STEPS.length);
        setStamping(false);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const current = STEPS[step];

  return (
    <div
      style={{
        background: "#F6F1E4",
        color: "#2A2118",
        borderRadius: 20,
        padding: "28px 24px",
        width: "min(300px, 90vw)",
        fontFamily: "'IBM Plex Mono', monospace",
        transform: "rotate(-2deg)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          opacity: 0.5,
          marginBottom: 12,
          letterSpacing: "0.12em",
        }}
      >
        PAXEL ESCROW TICKET
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
          fontFamily: "'Syne', sans-serif",
        }}
      >
        PXL-7F3A9C2B
      </div>
      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 20 }}>
        50 bags of Premium Rice
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 10, opacity: 0.5 }}>BUYER</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Amaka · Lagos</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, opacity: 0.5 }}>SELLER</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Ibrahim · Kano</div>
        </div>
      </div>
      <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4 }}>
        AMOUNT IN ESCROW
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          marginBottom: 20,
        }}
      >
        ₦185,000
      </div>
      <div
        key={step}
        style={{
          border: `2px solid ${current.color}`,
          color: current.color,
          borderRadius: 10,
          padding: "10px 14px",
          textAlign: "center",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.06em",
          transform: stamping
            ? "scale(1.1) rotate(-3deg)"
            : "scale(1) rotate(0deg)",
          transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {current.state}
      </div>
      <div
        style={{
          fontSize: 11,
          textAlign: "center",
          marginTop: 8,
          opacity: 0.5,
        }}
      >
        {current.label}
      </div>
    </div>
  );
}

function NavBar({ onAuthClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(10,10,15,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 5vw",
        height: 64,
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/logo.jpg"
          alt="PaxeL"
          style={{ height: 34, borderRadius: 6 }}
        />
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: C.text,
          }}
        >
          Pax<span style={{ color: C.amber }}>eL</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <a
          href="#how"
          className="nav-link"
          style={{
            color: C.textDim,
            textDecoration: "none",
            fontSize: 14,
            padding: "8px 14px",
          }}
        >
          How it works
        </a>
        <button
          onClick={onAuthClick}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.text,
            cursor: "pointer",
            fontSize: 14,
            padding: "8px 18px",
            borderRadius: 8,
          }}
        >
          Login
        </button>
        <button
          onClick={onAuthClick}
          style={{
            background: C.amber,
            border: "none",
            color: "#0A0A0F",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            padding: "8px 20px",
            borderRadius: 8,
          }}
        >
          Get started
        </button>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .nav-link { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function Hero({ onAuthClick }) {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "100px 5vw 60px",
        background: `radial-gradient(ellipse 80% 60% at 60% 40%, rgba(242,169,59,0.08) 0%, transparent 70%), ${C.bg}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(63,166,107,0.1)",
              border: "1px solid rgba(63,166,107,0.3)",
              borderRadius: 999,
              padding: "5px 14px",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.jade,
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: C.jade,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Built on Nomba · Instant settlement
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(38px, 5.5vw, 68px)",
              lineHeight: 1.08,
              color: C.text,
              margin: "0 0 24px",
            }}
          >
            Trade with strangers.
            <br />
            <span style={{ color: C.amber }}>Trust the system,</span>
            <br />
            not the person.
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              color: C.textDim,
              lineHeight: 1.75,
              maxWidth: 480,
              margin: "0 0 36px",
            }}
          >
            PaxeL holds your payment securely in escrow and releases it only
            when your goods physically arrive. Built for vendor-to-buyer trade
            across Nigerian states.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={onAuthClick}
              style={{
                background: C.amber,
                border: "none",
                color: "#0A0A0F",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 16,
                padding: "14px 28px",
                borderRadius: 12,
              }}
            >
              Start trading safely →
            </button>
            <a
              href="#how"
              style={{
                border: `1px solid ${C.border}`,
                color: C.text,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 16,
                padding: "14px 28px",
                borderRadius: 12,
                display: "inline-block",
              }}
            >
              See how it works
            </a>
          </div>

          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 48,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Trades secured", value: "Live" },
              { label: "Nomba-powered", value: "✓" },
              { label: "Disputes resolved", value: "100%" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: 24,
                    color: C.amber,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            flex: "0 0 auto",
          }}
        >
          <TradeTicket />
          <img
            src="/hero.png"
            alt="PaxeL user"
            style={{
              width: "min(280px, 80vw)",
              filter: "drop-shadow(0 24px 48px rgba(242,169,59,0.2))",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Fund your wallet",
      body: "Transfer to your personal PaxeL account number from any Nigerian bank. Funds settle instantly via Nomba.",
      icon: "💳",
    },
    {
      n: "02",
      title: "Place an order",
      body: "Browse products, pick a vendor, and lock your payment into escrow with one tap.",
      icon: "🔒",
    },
    {
      n: "03",
      title: "Seller dispatches",
      body: "Seller logs driver name, bus number (e.g. PMT 1001), and a live waybill photo. You get the driver's contact instantly.",
      icon: "🚌",
    },
    {
      n: "04",
      title: "Confirm receipt",
      body: "Goods arrive? Take a live photo and confirm. Payment releases instantly to the seller's wallet.",
      icon: "✅",
    },
  ];

  return (
    <section id="how" style={{ padding: "100px 5vw", background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            style={{
              fontSize: 11,
              color: C.amber,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
              marginBottom: 12,
            }}
          >
            HOW IT WORKS
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 48px)",
              color: C.text,
              margin: 0,
            }}
          >
            Four steps. No trust required.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "28px 24px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.amber)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = C.border)
              }
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: C.amber,
                  fontSize: 11,
                  marginBottom: 8,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  color: C.text,
                  marginBottom: 10,
                }}
              >
                {s.title}
              </div>
              <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.65 }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NombaSection() {
  return (
    <section
      style={{
        padding: "80px 5vw",
        background: `linear-gradient(135deg, rgba(242,169,59,0.06) 0%, rgba(10,10,15,0) 60%), ${C.surface}`,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          gap: 48,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontSize: 11,
              color: C.amber,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
              marginBottom: 16,
            }}
          >
            INFRASTRUCTURE
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 3.5vw, 40px)",
              color: C.text,
              marginBottom: 20,
            }}
          >
            Every naira moves
            <br />
            on <span style={{ color: C.amber }}>Nomba rails.</span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: C.textDim,
              lineHeight: 1.75,
              marginBottom: 24,
            }}
          >
            PaxeL is built on Nomba's financial infrastructure — virtual
            accounts, instant settlement, and real-time payment webhooks. Every
            transaction is secured, every payout is instant, and every naira is
            accounted for. The same rails powering thousands of Nigerian
            businesses, now protecting your trades.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              "Virtual Accounts",
              "Instant Settlement",
              "Webhook Events",
              "Bank Transfers",
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(242,169,59,0.08)",
                  border: "1px solid rgba(242,169,59,0.2)",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 12,
                  color: C.amber,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            flex: "0 0 auto",
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            minWidth: 200,
          }}
        >
          <img
            src="/nomba-logo.png"
            alt="Nomba"
            style={{
              height: 40,
              filter: "brightness(0) invert(1)",
              opacity: 0.9,
            }}
          />
          <div style={{ width: 48, height: 1, background: C.border }} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 28,
                color: C.amber,
              }}
            >
              ₦0+
            </div>
            <div style={{ fontSize: 12, color: C.textDim }}>Secured so far</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 28,
                color: C.jade,
              }}
            >
              100%
            </div>
            <div style={{ fontSize: 12, color: C.textDim }}>
              Settlement rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const features = [
    {
      icon: "🔐",
      title: "Escrow-backed",
      body: "Your money never reaches the seller until you physically confirm receipt of your goods.",
    },
    {
      icon: "📦",
      title: "Waybill verified",
      body: "Driver name, bus number, and live dispatch photo required. No photo, no shipment.",
    },
    {
      icon: "⭐",
      title: "Verified reviews",
      body: "Only buyers who completed a real trade can leave a review. Zero fake ratings.",
    },
    {
      icon: "🛡️",
      title: "Dispute protection",
      body: "If something goes wrong, our agents review photo evidence and resolve it fairly.",
    },
    {
      icon: "💬",
      title: "In-app chat only",
      body: "All communication stays inside PaxeL. Your phone number is never exposed to strangers.",
    },
    {
      icon: "⚡",
      title: "Instant settlement",
      body: "Powered by Nomba. Funds release to your wallet in seconds, not days.",
    },
  ];

  return (
    <section style={{ padding: "100px 5vw", background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            style={{
              fontSize: 11,
              color: C.amber,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
              marginBottom: 12,
            }}
          >
            WHY PAXEL
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 48px)",
              color: C.text,
              margin: 0,
            }}
          >
            Built for Nigerian trade.
            <br />
            <span
              style={{ color: C.textDim, fontWeight: 400, fontSize: "0.65em" }}
            >
              Not a checkout page. An entire trust layer.
            </span>
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "24px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                transition: "transform 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = C.amber;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
              }}
            >
              <div style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.text,
                    marginBottom: 6,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}
                >
                  {f.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onAuthClick }) {
  return (
    <section
      style={{
        padding: "120px 5vw",
        background: `radial-gradient(ellipse 60% 70% at 50% 50%, rgba(242,169,59,0.1) 0%, transparent 70%), ${C.bg}`,
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 5vw, 56px)",
            color: C.text,
            margin: "0 0 20px",
            lineHeight: 1.1,
          }}
        >
          Ready to trade
          <br />
          <span style={{ color: C.amber }}>without the risk?</span>
        </h2>
        <p
          style={{
            fontSize: 16,
            color: C.textDim,
            lineHeight: 1.7,
            marginBottom: 36,
            maxWidth: 460,
            margin: "0 auto 36px",
          }}
        >
          Join PaxeL and buy or sell across Nigeria with confidence. Your money
          is safe until your goods arrive — guaranteed.
        </p>
        <button
          onClick={onAuthClick}
          style={{
            background: C.amber,
            border: "none",
            color: "#0A0A0F",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 18,
            padding: "18px 44px",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(242,169,59,0.3)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow =
              "0 12px 40px rgba(242,169,59,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(242,169,59,0.3)";
          }}
        >
          Create your free account →
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        padding: "32px 5vw",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/logo.jpg"
          alt="PaxeL"
          style={{ height: 28, borderRadius: 4 }}
        />
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            color: C.text,
          }}
        >
          Pax<span style={{ color: C.amber }}>eL</span>
        </span>
      </div>
      <span style={{ fontSize: 12, color: C.textDim }}>
        © {new Date().getFullYear()} PaxeL · GlobTec
      </span>
      <span style={{ fontSize: 12, color: C.textDim }}>
        Nomba × DevCareer Hackathon 2026
      </span>
    </footer>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/auth");

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        color: C.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0A0F; overflow-x: hidden; }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.82; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <NavBar onAuthClick={goToAuth} />
      <Hero onAuthClick={goToAuth} />
      <HowItWorks />
      <NombaSection />
      <TrustSection />
      <CTA onAuthClick={goToAuth} />
      <Footer />
    </div>
  );
}
