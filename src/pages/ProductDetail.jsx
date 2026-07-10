import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Badge, Spinner, Avatar, Button, Modal, Toast } from "../components/UI";
import SellerTrustCard from "../components/SellerTrustCard";
import { api } from "../utils/api";

export default function ProductDetail() {
  const { theme: T } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [tradeModal, setTradeModal] = useState(false);
  const [trustCardOpen, setTrustCardOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("dispatch");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    api(`/products/${id}`)
      .then((d) => {
        setProduct(d.product);
        if (d.product?.seller?._id) {
          api(`/reviews/user/${d.product.seller._id}`)
            .then(setReviewSummary)
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function startTrade() {
    setCreating(true);
    try {
      const data = await api("/trades", {
        method: "POST",
        body: JSON.stringify({
          sellerId: product.seller._id,
          item: product.title,
          amount: product.price,
          deliveryMethod,
        }),
      });
      setTradeModal(false);
      navigate(`/trades/${data.tradeCode}`);
    } catch (err) {
      setToast(err.message);
    } finally {
      setCreating(false);
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

  if (!product) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: 60, color: T.textDim }}>
          Listing not found.
        </div>
      </Layout>
    );
  }

  const isOwnListing = user?.id === product.seller?._id;

  return (
    <Layout>
      {toast && (
        <Toast message={toast} type="error" onClose={() => setToast(null)} />
      )}

      <div
        style={{
          aspectRatio: "1/1",
          borderRadius: 16,
          overflow: "hidden",
          background: T.surfaceAlt,
          marginBottom: 10,
        }}
      >
        <img
          src={product.images?.[activeImg]}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {product.images?.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            overflowX: "auto",
          }}
        >
          {product.images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setActiveImg(i)}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                objectFit: "cover",
                cursor: "pointer",
                border: `2px solid ${activeImg === i ? T.amber : "transparent"}`,
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Badge variant="jade">🔒 Escrow Protected</Badge>
        <Badge variant="muted">{product.condition}</Badge>
        {reviewSummary?.total > 0 && (
          <span style={{ fontSize: 12.5, color: T.textDim, fontWeight: 600 }}>
            ★ {reviewSummary.avgRating}{" "}
            <span style={{ color: T.textMuted, fontWeight: 400 }}>
              ({reviewSummary.total} review
              {reviewSummary.total === 1 ? "" : "s"})
            </span>
          </span>
        )}
      </div>

      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: T.text,
          marginBottom: 8,
        }}
      >
        {product.title}
      </h1>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 28,
          fontWeight: 700,
          color: T.amber,
          marginBottom: 16,
        }}
      >
        ₦{Number(product.price).toLocaleString()}
      </div>

      <p
        style={{
          fontSize: 14,
          color: T.textDim,
          lineHeight: 1.7,
          marginBottom: 20,
          whiteSpace: "pre-wrap",
        }}
      >
        {product.description}
      </p>

      <div
        onClick={() => setTrustCardOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 14,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          marginBottom: 24,
          cursor: "pointer",
        }}
      >
        <Avatar
          name={product.seller?.name}
          photo={product.seller?.profilePhoto}
          size={44}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
            {product.seller?.name}
          </div>
          <div style={{ fontSize: 12, color: T.textDim }}>
            {product.seller?.kycLevel >= 3
              ? "✅ Identity verified"
              : "Basic account"}{" "}
            · {product.location?.city}, {product.location?.state}
          </div>
        </div>
        <span style={{ color: T.textMuted, fontSize: 18 }}>›</span>
      </div>

      <SellerTrustCard
        sellerId={product.seller?._id}
        open={trustCardOpen}
        onClose={() => setTrustCardOpen(false)}
      />

      {!isOwnListing && (
        <div
          style={{
            position: "fixed",
            bottom: 72,
            left: 0,
            right: 0,
            zIndex: 90,
            background:
              T.name === "dark"
                ? "rgba(10,10,15,0.96)"
                : "rgba(244,241,235,0.96)",
            backdropFilter: "blur(12px)",
            borderTop: `1px solid ${T.border}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: T.textDim }}>Total</div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: T.amber,
              }}
            >
              ₦{Number(product.price).toLocaleString()}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Button fullWidth size="lg" onClick={() => setTradeModal(true)}>
              Start secure trade
            </Button>
          </div>
        </div>
      )}
      <div style={{ height: !isOwnListing ? 70 : 0 }} />

      <Modal
        open={tradeModal}
        onClose={() => setTradeModal(false)}
        title="Choose delivery method"
      >
        <p
          style={{
            fontSize: 13,
            color: T.textDim,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Your ₦{Number(product.price).toLocaleString()} will be locked in
          escrow the moment you confirm. It only releases when delivery is
          verified.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            {
              v: "dispatch",
              label: "Local dispatch",
              desc: "Rider delivers to your door, you confirm with your fingerprint",
            },
            {
              v: "waybill",
              label: "Long-distance waybill",
              desc: "Seller sends via bus/interstate transport, you confirm with a photo",
            },
          ].map((m) => (
            <div
              key={m.v}
              onClick={() => setDeliveryMethod(m.v)}
              style={{
                border: `1.5px solid ${deliveryMethod === m.v ? T.amber : T.border}`,
                background: deliveryMethod === m.v ? T.amberBg : "transparent",
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 4,
                }}
              >
                {m.label}
              </div>
              <div style={{ fontSize: 12, color: T.textDim }}>{m.desc}</div>
            </div>
          ))}
        </div>
        <Button fullWidth loading={creating} onClick={startTrade}>
          Lock funds & start trade
        </Button>
      </Modal>
    </Layout>
  );
}
