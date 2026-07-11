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
  Search,
  ChevronDown,
  BadgeCheck,
  Loader2,
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
import { api, sameId } from "../utils/api";

function maskAmount(n) {
  return "₦" + "•".repeat(String(Math.round(n)).length + 2);
}

function activityFromTrade(trade, userId) {
  const isBuyer = sameId(trade.buyer, userId);
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
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState(null);
  const [resolvingName, setResolvingName] = useState(false);
  const [resolveError, setResolveError] = useState(null);
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

  useEffect(() => {
    if (!withdrawModal || banks.length > 0) return;
    setBanksLoading(true);
    api("/wallet/banks")
      .then((d) => setBanks(d.banks))
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, [withdrawModal]);

  useEffect(() => {
    setResolvedName(null);
    setResolveError(null);
    if (!selectedBank || accountNumber.length !== 10) return;
    const delay = setTimeout(() => {
      setResolvingName(true);
      api("/wallet/lookup-account", {
        method: "POST",
        body: JSON.stringify({ bankCode: selectedBank.code, accountNumber }),
      })
        .then((d) => setResolvedName(d.accountName))
        .catch((err) => setResolveError(err.message))
        .finally(() => setResolvingName(false));
    }, 500);
    return () => clearTimeout(delay);
  }, [selectedBank, accountNumber]);

  function resetWithdrawForm() {
    setSelectedBank(null);
    setBankSearch("");
    setAccountNumber("");
    setResolvedName(null);
    setResolveError(null);
    setAmount("");
  }

  async function handleWithdraw() {
    setSubmitting(true);
    try {
      const data = await api("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          bankCode: selectedBank.code,
          accountNumber,
          amount: Number(amount),
        }),
      });
      setToast(
        `₦${amount} sent to ${data.recipient}${data.fee ? ` (fee: ₦${data.fee.toLocaleString()})` : ""}`,
      );
      setWithdrawModal(false);
      resetWithdrawForm();
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
        onClose={() => {
          setWithdrawModal(false);
          resetWithdrawForm();
        }}
        title="Withdraw funds"
      >
        <div style={{ marginBottom: 16, position: "relative" }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: T.textDim,
              display: "block",
              marginBottom: 6,
            }}
          >
            Bank
          </label>
          <div
            onClick={() => setBankDropdownOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              fontSize: 14,
              color: selectedBank ? T.text : T.textMuted,
            }}
          >
            {selectedBank ? selectedBank.name : "Select your bank"}
            <ChevronDown size={16} />
          </div>

          {bankDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 20,
                marginTop: 6,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                boxShadow: `0 12px 32px ${T.shadow}`,
                maxHeight: 280,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: 10,
                  borderBottom: `1px solid ${T.border}`,
                  position: "relative",
                }}
              >
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: T.textMuted,
                  }}
                />
                <input
                  autoFocus
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Search bank name..."
                  style={{
                    width: "100%",
                    background: T.bg,
                    color: T.text,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "8px 10px 8px 30px",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ overflowY: "auto" }}>
                {banksLoading ? (
                  <div
                    style={{
                      padding: 20,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Spinner size={18} />
                  </div>
                ) : (
                  banks
                    .filter((b) =>
                      b.name.toLowerCase().includes(bankSearch.toLowerCase()),
                    )
                    .slice(0, 30)
                    .map((b) => (
                      <div
                        key={b.code}
                        onClick={() => {
                          setSelectedBank(b);
                          setBankDropdownOpen(false);
                          setBankSearch("");
                        }}
                        style={{
                          padding: "10px 14px",
                          fontSize: 13.5,
                          color: T.text,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = T.surfaceAlt)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {b.name}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Account number"
          value={accountNumber}
          onChange={(v) => setAccountNumber(v.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit account number"
          required
        />

        {resolvingName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: T.textDim,
              marginBottom: 16,
              marginTop: -8,
            }}
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <Loader2
              size={14}
              style={{ animation: "spin 0.8s linear infinite" }}
            />{" "}
            Resolving account name...
          </div>
        )}
        {resolveError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: T.rust,
              marginBottom: 16,
              marginTop: -8,
            }}
          >
            <AlertTriangle size={14} /> {resolveError}
          </div>
        )}
        {resolvedName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: T.jadeBg,
              border: `1px solid ${T.jadeBorder}`,
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              marginTop: -8,
              fontSize: 14,
              fontWeight: 600,
              color: T.jade,
            }}
          >
            <BadgeCheck size={16} /> {resolvedName}
          </div>
        )}

        <Input
          label="Amount (₦)"
          type="number"
          value={amount}
          onChange={setAmount}
          required
        />

        <Button
          fullWidth
          loading={submitting}
          disabled={!resolvedName || !amount}
          onClick={handleWithdraw}
        >
          Withdraw
        </Button>
      </Modal>
    </Layout>
  );
}
