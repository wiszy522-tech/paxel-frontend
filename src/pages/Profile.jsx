import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import {
  Button,
  Card,
  Badge,
  Spinner,
  Avatar,
  Modal,
  Input,
} from "../components/UI";
import { api, apiForm } from "../utils/api";

const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const KYC_LEVELS = [
  {
    level: 0,
    label: "Unverified",
    desc: "Email registered",
    icon: "📧",
    color: null,
  },
  {
    level: 1,
    label: "Profile Complete",
    desc: "Name, phone & address added",
    icon: "👤",
    color: "#F2A93B",
  },
  {
    level: 2,
    label: "ID Submitted",
    desc: "BVN or NIN provided",
    icon: "🪪",
    color: "#F2A93B",
  },
  {
    level: 3,
    label: "Fully Verified",
    desc: "ID + selfie confirmed",
    icon: "✅",
    color: "#3FA66B",
  },
];

function KYCProgress({ level }) {
  const { theme: T } = useTheme();
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: T.text,
          marginBottom: 12,
        }}
      >
        Verification Level
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3].map((l) => (
          <div
            key={l}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: l <= level ? T.amber : T.border,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {KYC_LEVELS.slice(1).map((k) => (
          <div
            key={k.level}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: k.level <= level ? 1 : 0.4,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background:
                  k.level <= level
                    ? k.color === "#3FA66B"
                      ? "rgba(63,166,107,0.15)"
                      : "rgba(242,169,59,0.15)"
                    : T.surface,
                border: `1px solid ${k.level <= level ? k.color || T.amber : T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                {k.label}
              </div>
              <div style={{ fontSize: 12, color: T.textDim }}>{k.desc}</div>
            </div>
            {k.level <= level && (
              <span
                style={{
                  marginLeft: "auto",
                  color: k.color || T.amber,
                  fontSize: 14,
                }}
              >
                ✓
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProfileModal({ open, onClose, profile, onSave }) {
  const { theme: T } = useTheme();
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState(profile?.address?.city || "");
  const [state, setState] = useState(profile?.address?.state || "");
  const [primaryTag, setPrimaryTag] = useState(profile?.primaryTag || "buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function save(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/profile", {
        method: "PUT",
        body: JSON.stringify({ name, phone, city, state, primaryTag }),
      });
      onSave(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <form onSubmit={save}>
        <Input
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Amaka Eze"
          required
        />
        <Input
          label="Phone number"
          value={phone}
          onChange={setPhone}
          placeholder="08012345678"
        />
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: T.textDim,
              display: "block",
              marginBottom: 5,
            }}
          >
            Primary tag
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["buyer", "seller", "rider"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPrimaryTag(t)}
                style={{
                  flex: 1,
                  border: `1px solid ${primaryTag === t ? T.amber : T.border}`,
                  background: primaryTag === t ? T.amberBg : "transparent",
                  color: primaryTag === t ? T.amber : T.textDim,
                  borderRadius: 8,
                  padding: "9px 0",
                  fontSize: 12,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {t === "buyer" ? "🛒" : t === "seller" ? "🏪" : "🛵"} {t}
              </button>
            ))}
          </div>
        </div>
        <Input
          label="City"
          value={city}
          onChange={setCity}
          placeholder="Lagos"
        />
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: T.textDim,
            display: "block",
            marginBottom: 5,
          }}
        >
          State
        </label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          style={SelectStyle}
        >
          <option value="">Select state</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
          Save changes
        </Button>
      </form>
    </Modal>
  );
}

function KYCModal({ open, onClose }) {
  const { theme: T } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startVerification() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/kyc/didit/start", { method: "POST" });
      window.location.href = data.sessionUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Verify your identity">
      <div
        style={{
          fontSize: 13,
          color: T.textDim,
          marginBottom: 20,
          lineHeight: 1.6,
        }}
      >
        We use <strong style={{ color: T.amber }}>Didit</strong> to verify your
        identity. You'll be redirected to a secure page to submit your ID and a
        selfie, then brought back here automatically once you're done.
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
      <Button fullWidth loading={loading} onClick={startVerification}>
        🪪 Start verification
      </Button>
    </Modal>
  );
}

export default function ProfilePage({ onAssistant }) {
  const { theme: T } = useTheme();
  const { user: authUser, updateUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const photoRef = useRef();

  const isMe = !userId || userId === authUser?.id;
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [kycModal, setKycModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const endpoint = isMe ? "/profile" : `/profile/${userId}`;
    api(endpoint)
      .then((d) => {
        const p = d.user;
        setProfile(p);
        api(`/reviews/user/${p._id}`)
          .then((r) => setReviews(r))
          .catch(() => {});
      })
      .catch(() => navigate("/home"))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("profilePhoto", file);
      const data = await apiForm("/profile/photo", form);
      setProfile((p) => ({ ...p, profilePhoto: data.profilePhoto }));
      updateUser({ profilePhoto: data.profilePhoto });
    } catch {
    } finally {
      setUploading(false);
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
  if (!profile) return null;

  const tagIcon =
    profile.primaryTag === "seller"
      ? "🏪"
      : profile.primaryTag === "rider"
        ? "🛵"
        : "🛒";
  const verifiedLabel =
    profile.kycLevel >= 2 ? `✓ Verified ${profile.primaryTag || "User"}` : null;

  return (
    <Layout onAssistant={onAssistant}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      {!isMe && (
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
            fontFamily: "'Inter',sans-serif",
          }}
        >
          ← Back
        </button>
      )}

      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ position: "relative" }}>
            <Avatar
              name={profile.name}
              photo={profile.profilePhoto}
              size={72}
            />
            {isMe && (
              <>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhoto}
                />
                <button
                  onClick={() => photoRef.current?.click()}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: T.amber,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {uploading ? "..." : "✎"}
                </button>
              </>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: T.text,
                marginBottom: 4,
              }}
            >
              {profile.name}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge variant="muted">
                {tagIcon} {profile.primaryTag || "buyer"}
              </Badge>
              {verifiedLabel && <Badge variant="jade">{verifiedLabel}</Badge>}
            </div>
          </div>
          {isMe && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditModal(true)}
            >
              Edit
            </Button>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
            paddingTop: 16,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          {[
            { label: "Reviews", value: reviews?.total || 0 },
            {
              label: "Rating",
              value: reviews?.avgRating ? `⭐ ${reviews.avgRating}` : "—",
            },
            { label: "Location", value: profile.address?.state || "NG" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  color: T.text,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isMe && (
        <Card style={{ marginBottom: 16 }}>
          <KYCProgress level={profile.kycLevel || 0} />
          {profile.kycLevel < 3 && (
            <Button variant="ghost" fullWidth onClick={() => setKycModal(true)}>
              🪪{" "}
              {profile.kycLevel === 0
                ? "Start verification"
                : "Continue verification"}
            </Button>
          )}
        </Card>
      )}

      {reviews?.reviews?.length > 0 && (
        <Card>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: T.text,
              marginBottom: 14,
            }}
          >
            Reviews ({reviews.total})
          </div>
          {reviews.reviews.map((r, i) => (
            <div
              key={i}
              style={{
                paddingBottom: i < reviews.reviews.length - 1 ? 14 : 0,
                marginBottom: i < reviews.reviews.length - 1 ? 14 : 0,
                borderBottom:
                  i < reviews.reviews.length - 1
                    ? `1px solid ${T.border}`
                    : "none",
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
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                  {r.reviewer?.name}
                </span>
                <span style={{ fontSize: 12, color: T.amber }}>
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>
              {r.comment && (
                <div
                  style={{ fontSize: 13, color: T.textDim, lineHeight: 1.5 }}
                >
                  {r.comment}
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      <EditProfileModal
        open={editModal}
        onClose={() => setEditModal(false)}
        profile={profile}
        onSave={(updated) => {
          setProfile(updated);
          updateUser(updated);
        }}
      />
      <KYCModal open={kycModal} onClose={() => setKycModal(false)} />
    </Layout>
  );
}
