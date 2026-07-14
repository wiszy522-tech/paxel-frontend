import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button, Badge, Spinner, Modal, Avatar } from "../components/UI";
import { api, BASE_URL } from "../utils/api";
import { io } from "socket.io-client";

const STATE_CONFIG = {
  CREATED: { label: "Awaiting Payment", color: null, icon: "📝" },
  SECURED: { label: "Funds Secured", color: "#F2A93B", icon: "🔒" },
  DISPATCHED: { label: "Goods in Transit", color: "#F2A93B", icon: "🚌" },
  RELEASED: { label: "Released", color: "#3FA66B", icon: "✅" },
  REFUNDED: { label: "Refunded", color: "#3FA66B", icon: "↩️" },
  DISPUTED: { label: "Disputed", color: "#C1502E", icon: "⚠️" },
};

function WaybillForm({ tradeCode, onDone }) {
  const { theme: T } = useTheme();
  const photoRef = useRef();
  const [busCompany, setBusCompany] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handlePhoto(e) {
    const f = e.target.files[0];
    if (f) {
      setPhoto(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!driverName || !driverPhone || !busNumber) {
      setError("Driver name, phone and bus number are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api(`/trades/${tradeCode}/waybill`, {
        method: "POST",
        body: JSON.stringify({
          busCompany,
          driverName,
          driverPhone,
          busNumber,
          dispatchPhotoUrl: preview || "pending",
        }),
      });
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
          background: T.amberBg,
          border: `1px solid ${T.amberBorder}`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: T.amber,
        }}
      >
        🚌 Fill in the transport details so the buyer knows their goods are on
        the way.
      </div>

      <label
        style={{
          fontSize: 12,
          color: T.textDim,
          display: "block",
          marginBottom: 4,
        }}
      >
        Transport company
      </label>
      <input
        value={busCompany}
        onChange={(e) => setBusCompany(e.target.value)}
        placeholder="e.g. Peace Mass Transit, GUO, ABC"
        style={inputStyle}
      />

      <label
        style={{
          fontSize: 12,
          color: T.textDim,
          display: "block",
          marginBottom: 4,
        }}
      >
        Driver name *
      </label>
      <input
        value={driverName}
        onChange={(e) => setDriverName(e.target.value)}
        placeholder="e.g. Emeka Obi"
        style={inputStyle}
        required
      />

      <label
        style={{
          fontSize: 12,
          color: T.textDim,
          display: "block",
          marginBottom: 4,
        }}
      >
        Driver phone number *
      </label>
      <input
        value={driverPhone}
        onChange={(e) => setDriverPhone(e.target.value)}
        placeholder="e.g. 08012345678"
        style={inputStyle}
        required
      />

      <label
        style={{
          fontSize: 12,
          color: T.textDim,
          display: "block",
          marginBottom: 4,
        }}
      >
        Bus / waybill number *
      </label>
      <input
        value={busNumber}
        onChange={(e) => setBusNumber(e.target.value)}
        placeholder="e.g. PMT 1001"
        style={inputStyle}
        required
      />

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: 12,
            color: T.textDim,
            display: "block",
            marginBottom: 6,
          }}
        >
          Live photo of wrapped parcel (optional but recommended)
        </label>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handlePhoto}
        />
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          style={{
            width: "100%",
            border: `2px dashed ${preview ? T.jade : T.border}`,
            background: T.bg,
            color: preview ? T.jade : T.textDim,
            borderRadius: 10,
            padding: "14px",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "'Inter',sans-serif",
            textAlign: "center",
          }}
        >
          {preview
            ? "✓ Photo taken — tap to retake"
            : "📷 Take live photo of parcel"}
        </button>
        {preview && (
          <img
            src={preview}
            alt="parcel"
            style={{
              width: "100%",
              borderRadius: 10,
              marginTop: 8,
              border: `1px solid ${T.jade}`,
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
        Confirm dispatch → notify buyer
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

  const myId = user?.id || user?._id;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 300 }}>
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
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              fontSize: 13,
              color: T.textMuted,
              textAlign: "center",
              paddingTop: 24,
            }}
          >
            No messages yet. Start the conversation.
          </div>
        )}
        {messages.map((m, i) => {
          const senderId = m.sender?._id || m.sender;
          const mine = senderId === myId;
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
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "none",
            background: T.amber,
            color: "#0A0A0F",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
  const receiptRef = useRef();

  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [waybillModal, setWaybillModal] = useState(false);
  const [error, setError] = useState("");

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

  const myId = user?.id || user?._id;
  const buyerId = trade.buyer?._id || trade.buyer;
  const sellerId = trade.seller?._id || trade.seller;
  const isBuyer = buyerId === myId;
  const isSeller = sellerId === myId;
  const other = isBuyer ? trade.seller : trade.buyer;
  const cfg = STATE_CONFIG[trade.state] || STATE_CONFIG.CREATED;

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
          padding: 20,
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
              Fee ₦{trade.fee?.toLocaleString()} · Net ₦
              {trade.netAmount?.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          style={{
            border: `2px solid ${cfg.color || T.border}`,
            color: cfg.color || T.textDim,
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: "0.06em",
            marginBottom: 14,
          }}
        >
          {cfg.icon} {cfg.label}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 12,
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
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Badge variant="muted">
              {isBuyer ? "You're buying" : "You're selling"}
            </Badge>
            <Badge variant="muted">{trade.deliveryMethod}</Badge>
          </div>
        </div>
      </div>

      {isSeller && trade.state === "SECURED" && (
        <div
          style={{
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: T.amber,
              marginBottom: 6,
            }}
          >
            🚌 Action required: Dispatch goods
          </div>
          <div style={{ fontSize: 13, color: T.textDim, marginBottom: 14 }}>
            The buyer's payment is locked in escrow. Log your waybill details
            and dispatch the goods to unlock payment on confirmed delivery.
          </div>
          <Button fullWidth onClick={() => setWaybillModal(true)}>
            Log waybill & mark as dispatched
          </Button>
        </div>
      )}

      {isSeller && trade.state === "DISPATCHED" && (
        <div
          style={{
            background: T.jadeBg,
            border: `1px solid ${T.jadeBorder}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: T.jade,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            ✅ Goods dispatched
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            Waiting for buyer to confirm receipt. Payment releases automatically
            after 24 hours if no action is taken.
          </div>
        </div>
      )}

      {trade.waybill?.driverName && (
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "16px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 700,
              color: T.text,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            🚌 Waybill Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              fontSize: 13,
            }}
          >
            {trade.waybill.busCompany && (
              <div>
                <span style={{ color: T.textDim }}>Company: </span>
                <span style={{ color: T.text }}>
                  {trade.waybill.busCompany}
                </span>
              </div>
            )}
            <div>
              <span style={{ color: T.textDim }}>Bus: </span>
              <span style={{ color: T.text }}>{trade.waybill.busNumber}</span>
            </div>
            <div>
              <span style={{ color: T.textDim }}>Driver: </span>
              <span style={{ color: T.text }}>{trade.waybill.driverName}</span>
            </div>
            <div>
              <span style={{ color: T.textDim }}>Phone: </span>
              <a
                href={`tel:${trade.waybill.driverPhone}`}
                style={{ color: T.amber, textDecoration: "none" }}
              >
                {trade.waybill.driverPhone}
              </a>
            </div>
          </div>
        </div>
      )}

      {isBuyer && trade.state === "DISPATCHED" && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              background: T.jadeBg,
              border: `1px solid ${T.jadeBorder}`,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 12,
              fontSize: 13,
              color: T.jade,
            }}
          >
            📦 Your goods are on the way! When they arrive, take a live photo
            and confirm receipt to release payment to the seller.
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
          <div style={{ marginTop: 8 }}>
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
          </div>
          <div
            style={{
              fontSize: 11,
              color: T.textMuted,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            ⚠️ Only confirm receipt after physically receiving your goods. Per
            T&Cs, no refunds after confirmation.
          </div>
        </div>
      )}

      {isBuyer && trade.state === "SECURED" && (
        <div
          style={{
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: T.amber,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            🔒 Payment secured in escrow
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            Waiting for seller to dispatch goods and log waybill details.
          </div>
        </div>
      )}

      {trade.state === "RELEASED" && (
        <div
          style={{
            background: T.jadeBg,
            border: `1px solid ${T.jadeBorder}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: T.jade,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            ✅ Trade complete
          </div>
          {isBuyer && (
            <Button
              variant="ghost"
              fullWidth
              style={{ marginTop: 8 }}
              onClick={() => navigate(`/reviews/new?trade=${trade.tradeCode}`)}
            >
              ⭐ Leave a review
            </Button>
          )}
        </div>
      )}

      {trade.state === "DISPUTED" && (
        <div
          style={{
            background: T.rustBg,
            border: `1px solid ${T.rustBorder}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: T.rust,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            ⚠️ Dispute raised
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            Funds are frozen. Our team is reviewing the evidence. You'll be
            notified of the resolution.
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
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: 16,
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
