import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Layout } from "../components/Layout";
import { Card, Badge, Spinner, EmptyState, Button } from "../components/UI";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const STATE_CONFIG = {
  CREATED: { label: "Created", variant: "muted", icon: "📝" },
  SECURED: { label: "Secured", variant: "amber", icon: "🔒" },
  DISPATCHED: { label: "In Transit", variant: "amber", icon: "🚌" },
  RELEASED: { label: "Released", variant: "jade", icon: "✅" },
  REFUNDED: { label: "Refunded", variant: "jade", icon: "↩️" },
  DISPUTED: { label: "Disputed", variant: "rust", icon: "⚠️" },
};

function TradeCard({ trade, currentUserId }) {
  const { theme: T } = useTheme();
  const navigate = useNavigate();
  const cfg = STATE_CONFIG[trade.state] || STATE_CONFIG.CREATED;
  const isBuyer =
    trade.buyer?._id === currentUserId || trade.buyer === currentUserId;
  const other = isBuyer ? trade.seller : trade.buyer;

  return (
    <div
      onClick={() => navigate(`/trades/${trade.tradeCode}`)}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.2s",
        marginBottom: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = T.amber;
        e.currentTarget.style.transform = "translateX(3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: T.amber,
              }}
            >
              {trade.tradeCode}
            </span>
            <Badge variant={cfg.variant}>
              {cfg.icon} {cfg.label}
            </Badge>
            <Badge variant="muted">{isBuyer ? "Buyer" : "Seller"}</Badge>
          </div>
          <div
            style={{
              fontWeight: 600,
              color: T.text,
              fontSize: 15,
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {trade.item}
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            {isBuyer ? "From" : "To"}: {other?.name || "—"}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 17,
              color: T.amber,
            }}
          >
            ₦{trade.amount?.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
            {new Date(trade.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
      </div>

      {trade.state === "DISPATCHED" && trade.waybill?.driverName && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            borderRadius: 8,
            fontSize: 12,
            color: T.amber,
          }}
        >
          🚌 {trade.waybill.busCompany || ""} {trade.waybill.busNumber} ·
          Driver: {trade.waybill.driverName}
        </div>
      )}

      {trade.state === "DISPUTED" && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: T.rustBg,
            border: `1px solid ${T.rustBorder}`,
            borderRadius: 8,
            fontSize: 12,
            color: T.rust,
          }}
        >
          ⚠️ Dispute raised — funds frozen pending review
        </div>
      )}
    </div>
  );
}

export default function TradesPage({ onAssistant }) {
  const { theme: T } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api("/trades/my")
      .then((d) => setTrades(d.trades || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const FILTERS = [
    { v: "all", label: "All" },
    { v: "SECURED", label: "🔒 Secured" },
    { v: "DISPATCHED", label: "🚌 In Transit" },
    { v: "DISPUTED", label: "⚠️ Disputed" },
    { v: "RELEASED", label: "✅ Completed" },
  ];

  const filtered =
    filter === "all" ? trades : trades.filter((t) => t.state === filter);

  return (
    <Layout onAssistant={onAssistant}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(20px,4vw,26px)",
            color: T.text,
          }}
        >
          My Trades
        </h1>
        <Button size="sm" onClick={() => navigate("/home")}>
          + New trade
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 20,
          scrollbarWidth: "none",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            style={{
              flexShrink: 0,
              border: `1px solid ${filter === f.v ? T.amber : T.border}`,
              background: filter === f.v ? T.amberBg : T.surface,
              color: filter === f.v ? T.amber : T.textDim,
              borderRadius: 999,
              padding: "7px 14px",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: filter === f.v ? 600 : 400,
              fontFamily: "'Inter',sans-serif",
              whiteSpace: "nowrap",
              transition: "all .15s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={
            filter === "all"
              ? "No trades yet"
              : `No ${filter.toLowerCase()} trades`
          }
          body={
            filter === "all"
              ? "Browse the marketplace and place your first order safely with escrow."
              : "Try changing the filter above."
          }
          action={
            filter === "all" && (
              <Button onClick={() => navigate("/home")}>
                Browse marketplace
              </Button>
            )
          }
        />
      ) : (
        <div>
          {filtered.map((t) => (
            <TradeCard key={t._id} trade={t} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </Layout>
  );
}
