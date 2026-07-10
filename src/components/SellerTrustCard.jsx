import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Modal, Avatar, Spinner, Badge } from "./UI";
import { api } from "../utils/api";

const KYC_LABEL = {
  0: "Not verified",
  1: "Profile complete",
  2: "ID submitted",
  3: "Fully verified (ID + selfie)",
};

function Stat({ label, value, T }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700,
          fontSize: 18,
          color: T.text,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

export default function SellerTrustCard({ sellerId, open, onClose }) {
  const { theme: T } = useTheme();
  const [profile, setProfile] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !sellerId) return;
    setLoading(true);
    Promise.all([api(`/profile/${sellerId}`), api(`/reviews/user/${sellerId}`)])
      .then(([p, r]) => {
        setProfile(p.user);
        setReviewData(r);
      })
      .finally(() => setLoading(false));
  }, [open, sellerId]);

  const total = reviewData?.total || 0;
  const successRate =
    total > 0
      ? Math.round(
          (reviewData.reviews.filter((r) => r.rating >= 4).length / total) *
            100,
        )
      : null;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Seller trust profile"
      width={420}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spinner size={26} />
        </div>
      ) : !profile ? (
        <div style={{ textAlign: "center", padding: 20, color: T.textDim }}>
          Couldn't load this profile.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <Avatar
              name={profile.name}
              photo={profile.profilePhoto}
              size={56}
            />
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: T.text,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {profile.name}
                {profile.kycLevel >= 3 && <span title="Verified">✅</span>}
              </div>
              <div style={{ fontSize: 12, color: T.textDim }}>
                {profile.primaryTag === "seller"
                  ? "Seller"
                  : profile.primaryTag === "rider"
                    ? "Rider"
                    : "Buyer"}{" "}
                · {profile.address?.state || "Nigeria"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <Badge variant={profile.kycLevel >= 3 ? "jade" : "muted"}>
              {profile.kycLevel >= 3
                ? "✅ KYC Verified"
                : "⚠️ " + KYC_LABEL[profile.kycLevel || 0]}
            </Badge>
            <Badge variant="muted">Member since {memberSince}</Badge>
          </div>

          <div
            style={{
              display: "flex",
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "16px 8px",
              marginBottom: 14,
            }}
          >
            <Stat T={T} label="Rated trades" value={total} />
            <div style={{ width: 1, background: T.border }} />
            <Stat
              T={T}
              label="Avg rating"
              value={reviewData?.avgRating ? `${reviewData.avgRating} ★` : "—"}
            />
            <div style={{ width: 1, background: T.border }} />
            <Stat
              T={T}
              label="Success rate"
              value={successRate !== null ? `${successRate}%` : "—"}
            />
          </div>

          <p
            style={{
              fontSize: 11,
              color: T.textMuted,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Based on {total} reviewed trade{total === 1 ? "" : "s"} on PaxeL.
            Every trade here is escrow-protected regardless of history.
          </p>
        </>
      )}
    </Modal>
  );
}
