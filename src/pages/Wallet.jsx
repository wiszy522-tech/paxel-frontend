import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Card, Button, Input, Modal, Toast, Spinner } from "../components/UI";
import { api } from "../utils/api";

export default function Wallet({ onAssistant }) {
  const { theme: T } = useTheme();
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fundModal, setFundModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  function load() {
    setLoading(true);
    api("/wallet/balance")
      .then((d) => setBalance(d.user))
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

  return (
    <Layout onAssistant={onAssistant}>
      {toast && (
        <Toast
          message={toast}
          type={toast.startsWith("₦") ? "success" : "error"}
          onClose={() => setToast(null)}
        />
      )}

      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: T.text,
          marginBottom: 20,
        }}
      >
        Wallet
      </h1>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={28} />
        </div>
      ) : (
        <>
          <Card
            style={{
              background: `linear-gradient(135deg, ${T.amberBg}, ${T.surface})`,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, color: T.textDim, marginBottom: 6 }}>
              Available balance
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 32,
                fontWeight: 700,
                color: T.text,
                marginBottom: 16,
              }}
            >
              ₦{Number(balance?.walletBalance || 0).toLocaleString()}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button fullWidth onClick={() => setFundModal(true)}>
                Fund wallet
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => setWithdrawModal(true)}
              >
                Withdraw
              </Button>
            </div>
          </Card>

          {balance?.lockedBalance > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: T.textDim, marginBottom: 4 }}>
                Locked in active trades
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 20,
                  fontWeight: 700,
                  color: T.amber,
                }}
              >
                ₦{Number(balance.lockedBalance).toLocaleString()}
              </div>
              <p style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                Held in escrow until you confirm receipt or a dispute is
                resolved.
              </p>
            </Card>
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
            marginBottom: 8,
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
