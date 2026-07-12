import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button, Card, Modal, Input, Spinner } from "../components/UI";
import { api } from "../utils/api";

const BANKS = [
  { code: "058", name: "GTBank" },
  { code: "033", name: "UBA" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "221", name: "Stanbic IBTC" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "305", name: "Paycom (OPay)" },
  { code: "50211", name: "Kuda Bank" },
  { code: "090110", name: "Palmpay" },
];

function StatCard({ label, value, sub, accent }) {
  const { theme: T } = useTheme();
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "18px 20px",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 12, color: T.textDim, marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          fontSize: "clamp(20px,4vw,26px)",
          color: accent || T.text,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function FundModal({ open, onClose, user }) {
  const { theme: T } = useTheme();
  const [copied, setCopied] = useState(false);

  function copy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Fund your wallet">
      <div
        style={{
          background: T.amberBg,
          border: `1px solid ${T.amberBorder}`,
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: T.amber,
            fontFamily: "'IBM Plex Mono',monospace",
            marginBottom: 8,
          }}
        >
          YOUR PAXEL WALLET ACCOUNT
        </div>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: T.text,
            marginBottom: 4,
          }}
        >
          {user?.virtualAccountNumber || "—"}
        </div>
        <div style={{ fontSize: 14, color: T.textDim, marginBottom: 12 }}>
          Nombank MFB · {user?.name}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy(user?.virtualAccountNumber)}
        >
          {copied ? "✓ Copied!" : "Copy account number"}
        </Button>
      </div>

      <div
        style={{
          fontSize: 14,
          color: T.textDim,
          lineHeight: 1.7,
          marginBottom: 16,
        }}
      >
        Transfer any amount to this account from your bank app. Funds settle
        instantly and appear in your PaxeL wallet.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { icon: "🏦", text: "Open your banking app" },
          { icon: "📱", text: "Select Transfer → Other Banks" },
          { icon: "🔍", text: "Search Nombank MFB" },
          { icon: "🔢", text: `Enter account: ${user?.virtualAccountNumber}` },
          { icon: "💸", text: "Enter amount and confirm" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: T.text,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function WithdrawModal({ open, onClose, maxAmount, onSuccess }) {
  const { theme: T } = useTheme();
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [looking, setLooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    if (!bankCode || accountNumber.length < 10) return;
    setLooking(true);
    setAccountName("");
    try {
      const data = await api("/profile/bank", {
        method: "POST",
        body: JSON.stringify({ bankCode, accountNumber }),
      });
      setAccountName(data.bank?.accountName || "");
    } catch {
      setAccountName("");
    } finally {
      setLooking(false);
    }
  }

  useEffect(() => {
    if (accountNumber.length === 10 && bankCode) lookup();
  }, [accountNumber, bankCode]);

  async function submit(e) {
    e.preventDefault();
    if (!accountName) {
      setError("Please verify your bank account first");
      return;
    }
    if (Number(amount) > maxAmount) {
      setError(`Max withdrawal is ₦${maxAmount.toLocaleString()}`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          bankCode,
          accountNumber,
          amount: Number(amount),
        }),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const SelectStyle = {
    width: "100%",
    background: T.bg,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Inter',sans-serif",
    marginBottom: 14,
  };

  return (
    <Modal open={open} onClose={onClose} title="Withdraw to bank">
      <form onSubmit={submit}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: T.textDim,
            display: "block",
            marginBottom: 5,
          }}
        >
          Select bank
        </label>
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          style={SelectStyle}
          required
        >
          <option value="">Select your bank</option>
          {BANKS.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>

        <Input
          label="Account number"
          value={accountNumber}
          onChange={setAccountNumber}
          placeholder="0123456789"
          rightElement={
            looking ? (
              <Spinner size={14} />
            ) : accountName ? (
              <span style={{ fontSize: 16 }}>✓</span>
            ) : null
          }
        />

        {accountName && (
          <div
            style={{
              background: T.jadeBg,
              border: `1px solid ${T.jadeBorder}`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 14,
              fontSize: 13,
              color: T.jade,
            }}
          >
            ✓ {accountName}
          </div>
        )}

        <Input
          label={`Amount (₦) — max ₦${maxAmount?.toLocaleString()}`}
          type="number"
          value={amount}
          onChange={setAmount}
          placeholder="5000"
        />

        {error && (
          <div
            style={{
              background: T.rustBg,
              border: `1px solid ${T.rustBorder}`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 12,
              fontSize: 13,
              color: T.rust,
            }}
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={!accountName}
        >
          Withdraw ₦{Number(amount || 0).toLocaleString()}
        </Button>
      </form>
    </Modal>
  );
}

export default function WalletPage({ onAssistant }) {
  const { theme: T } = useTheme();
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fundModal, setFundModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api("/wallet/balance")
      .then((d) => {
        setBalance(d.user);
        updateUser({
          walletBalance: d.user.walletBalance,
          lockedBalance: d.user.lockedBalance,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout onAssistant={onAssistant}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        select{color-scheme:${T.name}}
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: "clamp(20px,4vw,28px)",
            color: T.text,
            marginBottom: 4,
          }}
        >
          Wallet
        </h1>
        <p style={{ fontSize: 13, color: T.textDim }}>
          Fund, manage, and withdraw your PaxeL balance
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : (
        <>
          <div
            style={{
              background: `linear-gradient(135deg, #1C1F2B 0%, #242838 100%)`,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: "28px 24px",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(242,169,59,0.06)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -10,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(242,169,59,0.04)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#9CA0AE",
                  fontFamily: "'IBM Plex Mono',monospace",
                  marginBottom: 6,
                }}
              >
                AVAILABLE BALANCE
              </div>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(32px,6vw,48px)",
                  color: "#F1EDE3",
                  marginBottom: 4,
                }}
              >
                ₦{(balance?.walletBalance || 0).toLocaleString()}
              </div>
              {balance?.lockedBalance > 0 && (
                <div style={{ fontSize: 13, color: "#F2A93B" }}>
                  + ₦{balance.lockedBalance.toLocaleString()} locked in escrow
                </div>
              )}
              <div
                style={{
                  fontSize: 12,
                  color: "#9CA0AE",
                  marginTop: 8,
                  fontFamily: "'IBM Plex Mono',monospace",
                }}
              >
                Acct: {user?.virtualAccountNumber} · Nombank MFB
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <Button
              fullWidth
              onClick={() => setFundModal(true)}
              variant="ghost"
            >
              💳 Fund wallet
            </Button>
            <Button
              fullWidth
              onClick={() => setWithdrawModal(true)}
              disabled={!balance?.walletBalance}
            >
              🏦 Withdraw
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <StatCard
              label="Available"
              value={`₦${(balance?.walletBalance || 0).toLocaleString()}`}
              accent={T.jade}
            />
            <StatCard
              label="In Escrow"
              value={`₦${(balance?.lockedBalance || 0).toLocaleString()}`}
              accent={T.amber}
            />
          </div>

          <Card>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: T.text,
                marginBottom: 12,
              }}
            >
              How your wallet works
            </div>
            {[
              {
                icon: "💳",
                title: "Fund",
                body: "Transfer to your Nombank MFB account number. Settles instantly.",
              },
              {
                icon: "🔒",
                title: "Escrow",
                body: "When you place a trade, funds move from wallet to escrow. Safe until delivery.",
              },
              {
                icon: "✅",
                title: "Release",
                body: "Confirm receipt → seller's wallet is credited. Your locked balance frees.",
              },
              {
                icon: "🏦",
                title: "Withdraw",
                body: "Send from your wallet to any Nigerian bank account anytime.",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: i < 3 ? 14 : 0,
                  paddingBottom: i < 3 ? 14 : 0,
                  borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: T.text,
                      fontSize: 14,
                      marginBottom: 2,
                    }}
                  >
                    {s.title}
                  </div>
                  <div style={{ fontSize: 13, color: T.textDim }}>{s.body}</div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      <FundModal
        open={fundModal}
        onClose={() => setFundModal(false)}
        user={user}
      />
      <WithdrawModal
        open={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        maxAmount={balance?.walletBalance || 0}
        onSuccess={() => {
          setToast("Withdrawal initiated successfully!");
          api("/wallet/balance").then((d) => {
            setBalance(d.user);
            updateUser(d.user);
          });
        }}
      />

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: T.surface,
            border: `1px solid ${T.jade}`,
            borderRadius: 12,
            padding: "12px 20px",
            fontSize: 14,
            color: T.jade,
            zIndex: 900,
          }}
        >
          ✓ {toast}
          <button
            onClick={() => setToast("")}
            style={{
              marginLeft: 12,
              background: "none",
              border: "none",
              color: T.textDim,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </Layout>
  );
}
