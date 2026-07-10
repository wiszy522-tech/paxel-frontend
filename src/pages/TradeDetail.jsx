import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Check, Camera } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import {
  Badge,
  Button,
  Input,
  Spinner,
  Modal,
  Toast,
  Avatar,
  Divider,
} from "../components/UI";
import { api, apiForm } from "../utils/api";
import { getSocket } from "../utils/socket";

const STATE_VARIANT = {
  CREATED: "muted",
  SECURED: "amber",
  DISPATCHED: "amber",
  RELEASED: "jade",
  REFUNDED: "muted",
  DISPUTED: "rust",
};

const STEPS = ["SECURED", "DISPATCHED", "RELEASED"];

function StateTimeline({ state }) {
  const { theme: T } = useTheme();
  if (state === "DISPUTED") return null;
  const idx = STEPS.indexOf(state);
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      {STEPS.map((s, i) => (
        <div
          key={s}
          style={{
            display: "flex",
            alignItems: "center",
            flex: i < STEPS.length - 1 ? 1 : "none",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: i <= idx ? T.amber : T.surfaceAlt,
              border: `2px solid ${i <= idx ? T.amber : T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: i <= idx ? "#0A0A0F" : T.textMuted,
              flexShrink: 0,
            }}
          >
            {i < idx ? <Check size={13} strokeWidth={3} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: i < idx ? T.amber : T.border,
                margin: "0 4px",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PhotoCapture({ label, onCaptured }) {
  const { theme: T } = useTheme();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const data = await apiForm("/trades/upload-photo", formData);
      onCaptured(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: T.textDim,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          aspectRatio: "4/3",
          borderRadius: 12,
          border: `1.5px dashed ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
          background: T.surfaceAlt,
          position: "relative",
        }}
      >
        {preview ? (
          <img
            src={preview}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ textAlign: "center", color: T.textDim }}>
            <Camera size={30} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 13 }}>Tap to take a photo</div>
          </div>
        )}
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: T.overlay,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner size={24} />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

function ChatPanel({ tradeCode }) {
  const { theme: T } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    api(`/chat/${tradeCode}`)
      .then((d) => setMessages(d.messages))
      .finally(() => setLoading(false));

    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();
    socket.emit("join_trade", tradeCode);

    function onMessage(msg) {
      setMessages((prev) => [...prev, msg]);
    }
    socket.on("new_message", onMessage);
    return () => socket.off("new_message", onMessage);
  }, [tradeCode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit("send_message", { tradeCode, text: text.trim() });
    setText("");
  }

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: T.text,
          marginBottom: 12,
        }}
      >
        Trade chat
      </div>
      <div
        style={{
          maxHeight: 280,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 20 }}
          >
            <Spinner size={20} />
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: T.textMuted,
              textAlign: "center",
              padding: 20,
            }}
          >
            No messages yet
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender?._id === user?.id;
            return (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: mine ? "row-reverse" : "row",
                }}
              >
                <Avatar
                  name={m.sender?.name}
                  photo={m.sender?.profilePhoto}
                  size={26}
                />
                <div
                  style={{
                    maxWidth: "75%",
                    background: mine ? T.amberBg : T.surfaceAlt,
                    border: `1px solid ${mine ? T.amberBorder : T.border}`,
                    borderRadius: 12,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: T.text,
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: T.bg,
            color: T.text,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            outline: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <button
          type="submit"
          style={{
            background: T.amber,
            color: "#0A0A0F",
            border: "none",
            borderRadius: 10,
            padding: "0 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function TradeDetail() {
  const { theme: T } = useTheme();
  const { tradeCode } = useParams();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [waybillModal, setWaybillModal] = useState(false);
  const [disputeModal, setDisputeModal] = useState(false);
  const [busCompany, setBusCompany] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [dispatchPhotoUrl, setDispatchPhotoUrl] = useState("");
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    api(`/trades/${tradeCode}`)
      .then((d) => setTrade(d.trade))
      .finally(() => setLoading(false));
  }, [tradeCode]);

  useEffect(() => {
    load();
  }, [load]);

  const isBuyer = trade?.buyer?._id === user?.id;
  const isSeller = trade?.seller?._id === user?.id;

  async function submitWaybill() {
    setSubmitting(true);
    try {
      await api(`/trades/${tradeCode}/waybill`, {
        method: "POST",
        body: JSON.stringify({
          busCompany,
          driverName,
          driverPhone,
          busNumber,
          dispatchPhotoUrl,
        }),
      });
      setWaybillModal(false);
      load();
    } catch (err) {
      setToast(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmReceipt() {
    if (!receiptPhotoUrl) {
      setToast("Take a photo of the item first");
      return;
    }
    setSubmitting(true);
    try {
      await api(`/trades/${tradeCode}/confirm-receipt`, {
        method: "POST",
        body: JSON.stringify({ receiptPhotoUrl }),
      });
      load();
    } catch (err) {
      setToast(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitDispute() {
    setSubmitting(true);
    try {
      await api(`/trades/${tradeCode}/dispute`, {
        method: "POST",
        body: JSON.stringify({ reason: disputeReason }),
      });
      setDisputeModal(false);
      load();
    } catch (err) {
      setToast(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spinner size={28} />
        </div>
      </Layout>
    );
  }
  if (!trade) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: 60, color: T.textDim }}>
          Trade not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {toast && (
        <Toast message={toast} type="error" onClose={() => setToast(null)} />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: T.textMuted,
          }}
        >
          {trade.tradeCode}
        </div>
        <Badge variant={STATE_VARIANT[trade.state]}>{trade.state}</Badge>
      </div>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: T.text,
          marginBottom: 4,
        }}
      >
        {trade.item}
      </h1>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 22,
          fontWeight: 700,
          color: T.amber,
          marginBottom: 20,
        }}
      >
        ₦{Number(trade.amount).toLocaleString()}
      </div>

      <StateTimeline state={trade.state} />

      {trade.state === "SECURED" && isSeller && (
        <Button
          fullWidth
          size="lg"
          onClick={() => setWaybillModal(true)}
          style={{ marginBottom: 20 }}
        >
          Log waybill & dispatch
        </Button>
      )}

      {trade.state === "SECURED" && isBuyer && (
        <div
          style={{
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            fontSize: 13,
            color: T.textDim,
          }}
        >
          Waiting for the seller to dispatch your item. You'll be notified the
          moment it ships.
        </div>
      )}

      {trade.state === "DISPATCHED" && trade.waybill && (
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.text,
              marginBottom: 10,
            }}
          >
            Dispatch details
          </div>
          <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.9 }}>
            <div>
              Bus company:{" "}
              <strong style={{ color: T.text }}>
                {trade.waybill.busCompany}
              </strong>
            </div>
            <div>
              Bus/waybill number:{" "}
              <strong style={{ color: T.text }}>
                {trade.waybill.busNumber}
              </strong>
            </div>
            {isBuyer && (
              <>
                <div>
                  Driver:{" "}
                  <strong style={{ color: T.text }}>
                    {trade.waybill.driverName}
                  </strong>
                </div>
                <div>
                  Driver phone:{" "}
                  <a
                    href={`tel:${trade.waybill.driverPhone}`}
                    style={{ color: T.amber }}
                  >
                    {trade.waybill.driverPhone}
                  </a>
                </div>
              </>
            )}
          </div>
          {trade.waybill.dispatchPhotoUrl && (
            <img
              src={trade.waybill.dispatchPhotoUrl}
              style={{ width: "100%", borderRadius: 10, marginTop: 12 }}
            />
          )}
        </div>
      )}

      {trade.state === "DISPATCHED" && isBuyer && (
        <>
          <PhotoCapture
            label="Take a photo of the item at pickup to confirm receipt"
            onCaptured={setReceiptPhotoUrl}
          />
          <Button
            fullWidth
            size="lg"
            variant="jade"
            onClick={confirmReceipt}
            loading={submitting}
            style={{ marginBottom: 10 }}
          >
            Confirm receipt & release funds
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => setDisputeModal(true)}
          >
            Raise a dispute
          </Button>
          <p
            style={{
              fontSize: 12,
              color: T.textMuted,
              marginTop: 10,
              lineHeight: 1.6,
            }}
          >
            Only confirm once goods have physically arrived. No refunds after
            dispatch per our Terms.
          </p>
        </>
      )}

      {trade.state === "RELEASED" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.jadeBg,
            border: `1px solid ${T.jadeBorder}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            fontSize: 13,
            color: T.jade,
          }}
        >
          <Check size={16} strokeWidth={3} /> Funds released. This trade is
          complete.
        </div>
      )}

      {trade.state === "DISPUTED" && (
        <div
          style={{
            background: T.rustBg,
            border: `1px solid ${T.rustBorder}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            fontSize: 13,
            color: T.rust,
          }}
        >
          Dispute raised on{" "}
          {new Date(trade.dispute?.raisedAt).toLocaleDateString()}:{" "}
          {trade.dispute?.reason}
          <br />
          <br />
          Funds are frozen. A PaxeL agent is reviewing evidence and will
          independently verify with the transport company.
        </div>
      )}

      <Divider />
      <ChatPanel tradeCode={tradeCode} />

      <Modal
        open={waybillModal}
        onClose={() => setWaybillModal(false)}
        title="Log dispatch"
      >
        <Input
          label="Bus/transport company"
          value={busCompany}
          onChange={setBusCompany}
          placeholder="Peace Mass Transit"
          required
        />
        <Input
          label="Driver name"
          value={driverName}
          onChange={setDriverName}
          required
        />
        <Input
          label="Driver phone"
          value={driverPhone}
          onChange={setDriverPhone}
          placeholder="08012345678"
          required
        />
        <Input
          label="Bus/waybill number"
          value={busNumber}
          onChange={setBusNumber}
          placeholder="PMT 1001"
          required
        />
        <PhotoCapture
          label="Live photo of the wrapped parcel"
          onCaptured={setDispatchPhotoUrl}
        />
        <Button
          fullWidth
          loading={submitting}
          onClick={submitWaybill}
          disabled={!dispatchPhotoUrl}
        >
          Confirm dispatch
        </Button>
      </Modal>

      <Modal
        open={disputeModal}
        onClose={() => setDisputeModal(false)}
        title="Raise a dispute"
      >
        <p
          style={{
            fontSize: 13,
            color: T.textDim,
            marginBottom: 14,
            lineHeight: 1.6,
          }}
        >
          Funds will be frozen until a PaxeL agent reviews the evidence and
          independently confirms with the transport company.
        </p>
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            rows={4}
            placeholder="Describe what went wrong..."
            style={{
              width: "100%",
              background: T.bg,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 14,
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
        <Button
          fullWidth
          variant="danger"
          loading={submitting}
          onClick={submitDispute}
          disabled={!disputeReason.trim()}
        >
          Submit dispute
        </Button>
      </Modal>
    </Layout>
  );
}
