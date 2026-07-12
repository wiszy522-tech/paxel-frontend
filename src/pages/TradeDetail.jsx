import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button, Badge, Spinner, Modal, Avatar } from "../components/UI";
import { api } from "../utils/api";
import { io } from "socket.io-client";
import { BASE_URL } from "../utils/api";

const STATE_CONFIG = {
  CREATED: { label: "Awaiting Payment", color: null, icon: "📝" },
  SECURED: { label: "Funds Secured", color: "#F2A93B", icon: "🔒" },
  DISPATCHED: { label: "Goods in Transit", color: "#F2A93B", icon: "🚌" },
  RELEASED: { label: "Released", color: "#3FA66B", icon: "✅" },
  REFUNDED: { label: "Refunded", color: "#3FA66B", icon: "↩️" },
  DISPUTED: { label: "Disputed", color: "#C1502E", icon: "⚠️" },
};

function TradeStamp({ state }) {
  const { theme: T } = useTheme();
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.CREATED;
  return (
    <div
      style={{
        border: `2px solid ${cfg.color || T.border}`,
        color: cfg.color || T.textDim,
        borderRadius: 10,
        padding: "10px 16px",
        textAlign: "center",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: "0.06em",
        transition: "all 0.3s",
      }}
    >
      {cfg.icon} {cfg.label}
    </div>
  );
}

function WaybillForm({ tradeCode, onDone }) {
  const { theme: T } = useTheme();
  const inputRef = useRef();
  const [busCompany, setBusCompany] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!photo) {
      setError("Live photo required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("busCompany", busCompany);
      form.append("driverName", driverName);
      form.append("driverPhone", driverPhone);
      form.append("busNumber", busNumber);
      form.append("dispatchPhoto", photo);
      const token = localStorage.getItem("paxel_token");
      const res = await fetch(`${BASE_URL}/trades/${tradeCode}/waybill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busCompany,
          driverName,
          driverPhone,
          busNumber,
          dispatchPhotoUrl: preview,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: T.bg,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Inter',sans-serif",
    marginBottom: 12,
  };

  return (
    <form onSubmit={submit}>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: T.text,
          marginBottom: 14,
        }}
      >
        Log Waybill Details
      </div>
      <input
        placeholder="Transport company (e.g. Peace Mass Transit)"
        value={busCompany}
        onChange={(e) => setBusCompany(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Driver name"
        value={driverName}
        onChange={(e) => setDriverName(e.target.value)}
        style={inputStyle}
        required
      />
      <input
        placeholder="Driver phone number"
        value={driverPhone}
        onChange={(e) => setDriverPhone(e.target.value)}
        style={inputStyle}
        required
      />
      <input
        placeholder="Bus / waybill number (e.g. PMT 1001)"
        value={busNumber}
        onChange={(e) => setBusNumber(e.target.value)}
        style={inputStyle}
        required
      />

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: T.textDim, marginBottom: 6 }}>
          Live photo of wrapped parcel (gallery blocked)
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) {
              setPhoto(f);
              setPreview(URL.createObjectURL(f));
            }
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%",
            border: `2px dashed ${T.border}`,
            background: T.bg,
            color: T.textDim,
            borderRadius: 10,
            padding: "12px",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "'Inter',sans-serif",
          }}
        >
          {preview ? "✓ Photo taken — tap to retake" : "📷 Take live photo"}
        </button>
        {preview && (
          <img
            src={preview}
            alt=""
            style={{
              width: "100%",
              borderRadius: 10,
              marginTop: 8,
              border: `1px solid ${T.border}`,
            }}
          />
        )}
      </div>

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
      <Button type="submit" fullWidth loading={loading}>
        Confirm dispatch
      </Button>
    </form>
  );
}

function ChatPanel({ tradeCode }) {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    api(`/chat/${tradeCode}`)
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
    const s = io(BASE_URL, { auth: { token } });
    s.on("connect", () => s.emit("join_trade", tradeCode));
    s.on("new_message", (msg) => setMessages((prev) => [...prev, msg]));
    setSocket(s);
    return () => s.disconnect();
  }, [tradeCode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const t = text.trim();
    if (!t || !socket) return;
    socket.emit("send_message", { tradeCode, text: t });
    setText("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 320 }}>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: T.text,
          marginBottom: 10,
        }}
      >
        💬 Trade Chat
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 10,
          paddingRight: 4,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              fontSize: 13,
              color: T.textMuted,
              textAlign: "center",
              paddingTop: 20,
            }}
          >
            No messages yet. Start the conversation.
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.sender?._id === user?.id || m.sender === user?.id;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: mine ? "flex-end" : "flex-start",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              {!mine && (
                <Avatar
                  name={m.sender?.name}
                  photo={m.sender?.profilePhoto}
                  size={24}
                />
              )}
              <div
                style={{
                  maxWidth: "75%",
                  background: mine ? T.amber : T.surface,
                  color: mine ? "#0A0A0F" : T.text,
                  border: `1px solid ${mine ? T.amber : T.border}`,
                  borderRadius: mine
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                  padding: "9px 13px",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: T.bg,
            color: T.text,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            outline: "none",
            fontFamily: "'Inter',sans-serif",
          }}
        />
        <button
          onClick={send}
          style={{
            background: T.amber,
            border: "none",
            borderRadius: 10,
            width: 42,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default function TradeDetailPage({ onAssistant }) {
  const { theme: T } = useTheme();
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [waybillModal, setWaybillModal] = useState(false);
  const [error, setError] = useState("");
  const receiptRef = useRef();

  const reload = () =>
    api(`/trades/${code}`)
      .then((d) => setTrade(d.trade))
      .catch(() => navigate("/trades"));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [code]);

  async function doAction(endpoint, body = {}) {
    setError("");
    setActionLoading(true);
    try {
      await api(`/trades/${code}/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading)
    return (
      <Layout onAssistant={onAssistant}>
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spinner size={40} />
        </div>
      </Layout>
    );
  if (!trade) return null;

  const isBuyer = trade.buyer?._id === user?.id || trade.buyer === user?.id;
  const isSeller = trade.seller?._id === user?.id || trade.seller === user?.id;
  const other = isBuyer ? trade.seller : trade.buyer;

  return (
    <Layout onAssistant={onAssistant}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <button
        onClick={() => navigate("/trades")}
        style={{
          background: "none",
          border: "none",
          color: T.textDim,
          cursor: "pointer",
          fontSize: 14,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "'Inter',sans-serif",
        }}
      >
        ← Back to trades
      </button>

      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "20px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 12,
                color: T.amber,
                marginBottom: 4,
              }}
            >
              {trade.tradeCode}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: "clamp(16px,3vw,22px)",
                color: T.text,
              }}
            >
              {trade.item}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: T.amber,
              }}
            >
              ₦{trade.amount?.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: T.textDim }}>
              Fee: ₦{trade.fee?.toLocaleString()} · Net: ₦
              {trade.netAmount?.toLocaleString()}
            </div>
          </div>
        </div>

        <TradeStamp state={trade.state} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={other?.name} photo={other?.profilePhoto} size={32} />
            <div>
              <div style={{ fontSize: 12, color: T.textDim }}>
                {isBuyer ? "Seller" : "Buyer"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                {other?.name}
              </div>
            </div>
          </div>
          <Badge variant="muted">{trade.deliveryMethod}</Badge>
        </div>
      </div>

      {trade.waybill?.driverName && (
        <div
          style={{
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 700,
              color: T.amber,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            🚌 Waybill Details
          </div>
          <div
            style={{
              fontSize: 13,
              color: T.text,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
            }}
          >
            {trade.waybill.busCompany && (
              <div>
                <span style={{ color: T.textDim }}>Company: </span>
                {trade.waybill.busCompany}
              </div>
            )}
            <div>
              <span style={{ color: T.textDim }}>Bus: </span>
              {trade.waybill.busNumber}
            </div>
            <div>
              <span style={{ color: T.textDim }}>Driver: </span>
              {trade.waybill.driverName}
            </div>
            <div>
              <span style={{ color: T.textDim }}>Phone: </span>
              <a
                href={`tel:${trade.waybill.driverPhone}`}
                style={{ color: T.amber }}
              >
                {trade.waybill.driverPhone}
              </a>
            </div>
          </div>
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {isSeller && trade.state === "SECURED" && (
          <Button fullWidth onClick={() => setWaybillModal(true)}>
            🚌 Log waybill & dispatch
          </Button>
        )}
        {isBuyer && trade.state === "DISPATCHED" && (
          <>
            <div
              style={{
                background: T.jadeBg,
                border: `1px solid ${T.jadeBorder}`,
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: T.jade,
              }}
            >
              📦 Goods dispatched! Take a live photo when your package arrives
              to confirm receipt and release payment.
            </div>
            <input
              ref={receiptRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files[0];
                if (!f) return;
                const url = URL.createObjectURL(f);
                await doAction("confirm-receipt", { receiptPhotoUrl: url });
              }}
            />
            <Button
              fullWidth
              variant="jade"
              onClick={() => receiptRef.current?.click()}
              loading={actionLoading}
            >
              📷 Take photo & confirm receipt
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={() =>
                doAction("dispute", {
                  reason: "Goods not received as expected",
                })
              }
              loading={actionLoading}
            >
              ⚠️ Raise a dispute
            </Button>
          </>
        )}
        {trade.state === "RELEASED" && isBuyer && (
          <Button
            fullWidth
            variant="ghost"
            onClick={() => navigate(`/reviews/new?trade=${trade.tradeCode}`)}
          >
            ⭐ Leave a review
          </Button>
        )}
      </div>

      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "16px",
          marginBottom: 16,
        }}
      >
        <ChatPanel tradeCode={code} />
      </div>

      <Modal
        open={waybillModal}
        onClose={() => setWaybillModal(false)}
        title="Dispatch goods"
        width={460}
      >
        <WaybillForm
          tradeCode={code}
          onDone={() => {
            setWaybillModal(false);
            reload();
          }}
        />
      </Modal>
    </Layout>
  );
}
