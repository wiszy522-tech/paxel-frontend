import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Card, Badge, Spinner, EmptyState } from "../components/UI";
import { api } from "../utils/api";

const STATE_VARIANT = {
  CREATED: "muted",
  SECURED: "amber",
  DISPATCHED: "amber",
  RELEASED: "jade",
  REFUNDED: "muted",
  DISPUTED: "rust",
};

export default function Trades() {
  const { theme: T } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/trades/my")
      .then((d) => setTrades(d.trades))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: T.text,
          marginBottom: 20,
        }}
      >
        My Trades
      </h1>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={28} />
        </div>
      ) : trades.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="No trades yet"
          body="Trades you create or receive will show up here."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trades.map((t) => {
            const isBuyer = t.buyer?._id === user?.id;
            return (
              <Card
                key={t._id}
                onClick={() => navigate(`/trades/${t.tradeCode}`)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color: T.textMuted,
                        marginBottom: 4,
                      }}
                    >
                      {t.tradeCode}
                    </div>
                    <div
                      style={{ fontSize: 15, fontWeight: 600, color: T.text }}
                    >
                      {t.item}
                    </div>
                  </div>
                  <Badge variant={STATE_VARIANT[t.state] || "muted"}>
                    {t.state}
                  </Badge>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, color: T.textDim }}>
                    {isBuyer
                      ? `Buying from ${t.seller?.name}`
                      : `Selling to ${t.buyer?.name}`}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      color: T.amber,
                    }}
                  >
                    ₦{Number(t.amount).toLocaleString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
