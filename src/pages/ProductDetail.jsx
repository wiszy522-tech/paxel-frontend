import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button, Badge, Card, Spinner, Modal, Avatar } from "../components/UI";
import { api } from "../utils/api";

function ImageGallery({ images }) {
  const { theme: T } = useTheme();
  const [active, setActive] = useState(0);

  if (!images?.length)
    return (
      <div
        style={{
          aspectRatio: "4/3",
          background: T.surface,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
        }}
      >
        📦
      </div>
    );

  return (
    <div>
      <div
        style={{
          aspectRatio: "4/3",
          borderRadius: 16,
          overflow: "hidden",
          background: T.surface,
          marginBottom: 10,
        }}
      >
        <img
          src={images[active]}
          alt="product"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8 }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                border: `2px solid ${i === active ? T.amber : "transparent"}`,
                flexShrink: 0,
              }}
            >
              <img
                src={img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SellerCard({ seller, reviews }) {
  const { theme: T } = useTheme();
  const navigate = useNavigate();
  const avg = reviews?.avgRating;
  const total = reviews?.total || 0;

  return (
    <Card style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <Avatar name={seller?.name} photo={seller?.profilePhoto} size={44} />
        <div>
          <div style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>
            {seller?.name}
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              marginTop: 2,
            }}
          >
            {seller?.kycLevel >= 2 && (
              <Badge variant="jade">✓ Verified Seller</Badge>
            )}
            {seller?.primaryTag && (
              <Badge variant="muted">{seller.primaryTag}</Badge>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {avg && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: T.amber,
              }}
            >
              ⭐ {avg}
            </div>
            <div style={{ fontSize: 11, color: T.textDim }}>
              {total} reviews
            </div>
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: T.text,
            }}
          >
            {seller?.location?.state || "NG"}
          </div>
          <div style={{ fontSize: 11, color: T.textDim }}>Location</div>
        </div>
      </div>
      <Button
        variant="secondary"
        fullWidth
        style={{ marginTop: 12 }}
        onClick={() => navigate(`/profile/${seller?._id}`)}
      >
        View seller profile
      </Button>
    </Card>
  );
}

function TradeModal({ open, onClose, product, onSuccess }) {
  const { theme: T } = useTheme();
  const { user } = useAuth();
  const [delivery, setDelivery] = useState("waybill");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/trades", {
        method: "POST",
        body: JSON.stringify({
          sellerId: product.seller._id,
          item: product.title,
          amount: product.price,
          deliveryMethod: delivery,
        }),
      });
      onSuccess(data.tradeCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Place order" width={420}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: T.textDim, marginBottom: 4 }}>
          Product
        </div>
        <div style={{ fontWeight: 600, color: T.text }}>{product?.title}</div>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: T.amber,
            marginTop: 4,
          }}
        >
          ₦{product?.price?.toLocaleString()}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 8 }}>
          Delivery method
        </div>
        {[
          {
            v: "waybill",
            icon: "🚌",
            title: "Waybill (long-distance)",
            desc: "Seller ships via transport park (PMT, GUO, etc.)",
          },
          {
            v: "dispatch",
            icon: "🛵",
            title: "Dispatch (local delivery)",
            desc: "Rider delivers to your doorstep",
          },
        ].map((d) => (
          <div
            key={d.v}
            onClick={() => setDelivery(d.v)}
            style={{
              border: `1px solid ${delivery === d.v ? T.amber : T.border}`,
              background: delivery === d.v ? T.amberBg : T.bg,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 8,
              cursor: "pointer",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{d.icon}</span>
            <div>
              <div style={{ fontWeight: 600, color: T.text, fontSize: 14 }}>
                {d.title}
              </div>
              <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>
                {d.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: T.amberBg,
          border: `1px solid ${T.amberBorder}`,
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 12,
          color: T.amber,
        }}
      >
        🔒 Payment is held in escrow until you confirm receipt. Funds release
        only when your goods arrive.
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

      <Button fullWidth onClick={handleCreate} loading={loading}>
        Lock ₦{product?.price?.toLocaleString()} in escrow
      </Button>
    </Modal>
  );
}

export default function ProductDetailPage({ onAssistant }) {
  const { theme: T } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeModal, setTradeModal] = useState(false);

  useEffect(() => {
    Promise.all([api(`/products/${id}`)])
      .then(([p]) => {
        setProduct(p.product);
        api(`/reviews/user/${p.product.seller._id}`)
          .then((r) => setReviews(r))
          .catch(() => {});
      })
      .catch(() => navigate("/home"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Layout onAssistant={onAssistant}>
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spinner size={40} />
        </div>
      </Layout>
    );

  if (!product) return null;

  const isMine = product.seller?._id === user?.id;

  return (
    <Layout onAssistant={onAssistant}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .detail-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media(min-width: 640px) { .detail-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <button
        onClick={() => navigate(-1)}
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
          fontFamily: "'Inter', sans-serif",
        }}
      >
        ← Back
      </button>

      <div className="detail-grid">
        <div>
          <ImageGallery images={product.images} />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <Badge variant={product.condition === "new" ? "jade" : "amber"}>
              {product.condition}
            </Badge>
            <Badge variant="muted">
              {product.category?.replace(/_/g, " ")}
            </Badge>
            {product.location?.state && (
              <Badge variant="muted">📍 {product.location.state}</Badge>
            )}
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px, 4vw, 28px)",
              color: T.text,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {product.title}
          </h1>

          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: T.amber,
              marginBottom: 12,
            }}
          >
            ₦{product.price?.toLocaleString()}
          </div>

          <div
            style={{
              fontSize: 14,
              color: T.textDim,
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            {product.description}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                color: T.textDim,
              }}
            >
              📦 Qty: {product.quantity}
            </div>
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                color: T.textDim,
              }}
            >
              👁️ {product.views} views
            </div>
          </div>

          {!isMine ? (
            <Button fullWidth size="lg" onClick={() => setTradeModal(true)}>
              🔒 Buy securely with escrow
            </Button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/products/${id}/edit`)}
              >
                Edit listing
              </Button>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <SellerCard seller={product.seller} reviews={reviews} />
          </div>

          {reviews?.reviews?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.text,
                  marginBottom: 12,
                }}
              >
                Reviews ({reviews.total})
              </div>
              {reviews.reviews.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <Avatar
                      name={r.reviewer?.name}
                      photo={r.reviewer?.profilePhoto}
                      size={28}
                    />
                    <span
                      style={{ fontSize: 13, fontWeight: 600, color: T.text }}
                    >
                      {r.reviewer?.name}
                    </span>
                    <span style={{ fontSize: 12, color: T.amber }}>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: T.textDim }}>
                    {r.comment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TradeModal
        open={tradeModal}
        onClose={() => setTradeModal(false)}
        product={product}
        onSuccess={(code) => navigate(`/trades/${code}`)}
      />
    </Layout>
  );
}
