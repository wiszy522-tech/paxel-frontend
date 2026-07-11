import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Eye,
  EyeOff,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Package,
  Inbox,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import {
  Button,
  Input,
  Modal,
  Toast,
  Spinner,
  EmptyState,
} from "../components/UI";
import { api } from "../utils/api";

function maskAmount(n) {
  return "₦" + "•".repeat(String(Math.round(n)).length + 2);
}

function activityFromTrade(trade, userId) {
  const isBuyer = trade.buyer?._id === userId || trade.buyer === userId;
  if (trade.state === "RELEASED" && !isBuyer) {
    return {
      Icon: Banknote,
      label: `Payment received · ${trade.item}`,
      amount: trade.netAmount,
      positive: true,
      date: trade.updatedAt,
      tag: "jade",
    };
  }
  if (trade.state === "RELEASED" && isBuyer) {
    return {
      Icon: CheckCircle2,
      label: `Trade completed · ${trade.item}`,
      amount: trade.amount,
      positive: false,
      date: trade.updatedAt,
      tag: "jade",
    };
  }
  if (trade.state === "DISPUTED") {
    return {
      Icon: AlertTriangle,
      label: `Dispute raised · ${trade.item}`,
      amount: trade.amount,
      positive: false,
      date: trade.updatedAt,
      tag: "rust",
    };
  }
  if (isBuyer) {
    return {
      Icon: Lock,
      label: `Funds locked · ${trade.item}`,
      amount: trade.amount,
      positive: false,
      date: trade.createdAt,
      tag: "amber",
    };
  }
  return {
    Icon: Package,
    label: `New order · ${trade.item}`,
    amount: trade.amount,
    positive: null,
    date: trade.createdAt,
    tag: "amber",
  };
}

export default function Wallet() {
  const { theme: T } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [fundModal, setFundModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([api("/wallet/balance"), api("/trades/my")])
      .then(([b, t]) => {
        setBalance(b.user);
        const sorted = [...t.trades]
          .sort((a, b2) => new Date(b2.updatedAt) - new Date(a.updatedAt))
          .slice(0, 8);
        setActivities(sorted.map((tr) => activityFromTrade(tr, user?.id)));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleWithdraw() {
    setSubmitting(true);
    try {
      const data = await api("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          bankCode,
          accountNumber,
          amount: Number(amount),
        }),
      });
      setToast(`₦${amount} sent to ${data.recipient}`);
      setWithdrawModal(false);
      setBankCode("");
      setAccountNumber("");
      setAmount("");
      load();
    } catch (err) {
      setToast(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const first = user?.name?.split(" ")[0] || "there";

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast}
          type={toast.startsWith("₦") ? "success" : "error"}
          onClose={() => setToast(null)}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: T.text,
          }}
        >
          Hi, {first}
        </h1>
        <button
          onClick={() => navigate("/trades")}
          title="Trade history"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: `1px solid ${T.border}`,
            background: T.surface,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <History size={17} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={28} />
        </div>
      ) : (
        <>
          <div
            style={{
              background: `linear-gradient(135deg, ${T.amberDim}, ${T.amber})`,
              borderRadius: 22,
              padding: "22px 20px",
              marginBottom: 14,
              boxShadow: "0 12px 32px rgba(242,169,59,.28)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(10,10,15,0.75)",
                  fontWeight: 600,
                }}
              >
                Total balance
              </span>
              <button
                onClick={() => setHidden((h) => !h)}
                style={{
                  background: "rgba(10,10,15,0.12)",
                  border: "none",
                  borderRadius: 999,
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0A0A0F",
                }}
              >
                {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 30,
                fontWeight: 800,
                color: "#0A0A0F",
                marginBottom: 18,
              }}
            >
              {hidden
                ? maskAmount(
                    (balance?.walletBalance || 0) +
                      (balance?.lockedBalance || 0),
                  )
                : `₦${Number((balance?.walletBalance || 0) + (balance?.lockedBalance || 0)).toLocaleString()}`}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div
                style={{
                  flex: 1,
                  background: "rgba(10,10,15,0.12)",
                  borderRadius: 14,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(10,10,15,0.7)",
                    marginBottom: 3,
                  }}
                >
                  Usable
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0A0A0F",
                  }}
                >
                  {hidden
                    ? maskAmount(balance?.walletBalance || 0)
                    : `₦${Number(balance?.walletBalance || 0).toLocaleString()}`}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "rgba(10,10,15,0.12)",
                  borderRadius: 14,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(10,10,15,0.7)",
                    marginBottom: 3,
                  }}
                >
                  In escrow
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0A0A0F",
                  }}
                >
                  {hidden
                    ? maskAmount(balance?.lockedBalance || 0)
                    : `₦${Number(balance?.lockedBalance || 0).toLocaleString()}`}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setFundModal(true)}
                style={{
                  flex: 1,
                  background: "#0A0A0F",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 0",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                + Fund
              </button>
              <button
                onClick={() => setWithdrawModal(true)}
                style={{
                  flex: 1,
                  background: "rgba(10,10,15,0.14)",
                  color: "#0A0A0F",
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 0",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Withdraw
              </button>
              <button
                onClick={() => navigate("/trades")}
                style={{
                  flex: 1,
                  background: "rgba(10,10,15,0.14)",
                  color: "#0A0A0F",
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 0",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                History
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
              Recent activity
            </div>
            <span
              onClick={() => navigate("/trades")}
              style={{
                fontSize: 12.5,
                color: T.amber,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              See all
            </span>
          </div>

          {activities.length === 0 ? (
            <EmptyState
              icon={<Inbox size={24} />}
              title="No activity yet"
              body="Fund your wallet or start a trade to see activity here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activities.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: T[`${a.tag}Bg`],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T[a.tag] || T.textDim,
                      flexShrink: 0,
                    }}
                  >
                    <a.Icon size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: T.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: T.textMuted }}>
                      {new Date(a.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color:
                        a.positive === true
                          ? T.jade
                          : a.positive === false
                            ? T.rust
                            : T.textDim,
                      flexShrink: 0,
                    }}
                  >
                    {a.positive === true
                      ? "+"
                      : a.positive === false
                        ? "-"
                        : ""}
                    ₦{Number(a.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={fundModal}
        onClose={() => setFundModal(false)}
        title="Fund your wallet"
      >
        <p
          style={{
            fontSize: 13,
            color: T.textDim,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Transfer any amount to your dedicated PaxeL virtual account below.
          Your wallet is credited automatically within seconds.
        </p>
        <div
          style={{
            background: T.surfaceAlt,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 4 }}>
            Bank
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: T.text,
              marginBottom: 12,
            }}
          >
            Nombank MFB
          </div>
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 4 }}>
            Account number
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: T.amber,
            }}
          >
            {user?.virtualAccountNumber || "—"}
          </div>
        </div>
      </Modal>

      <Modal
        open={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        title="Withdraw funds"
      >
        <Input
          label="Bank code"
          value={bankCode}
          onChange={setBankCode}
          placeholder="e.g. 044"
          required
        />
        <Input
          label="Account number"
          value={accountNumber}
          onChange={setAccountNumber}
          required
        />
        <Input
          label="Amount (₦)"
          type="number"
          value={amount}
          onChange={setAmount}
          required
        />
        <Button fullWidth loading={submitting} onClick={handleWithdraw}>
          Withdraw
        </Button>
      </Modal>
    </Layout>
  );
}
