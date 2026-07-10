import { useState, useEffect } from "react";
import { BadgeCheck, AlertTriangle, ShieldCheck, Star } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Modal, Avatar, Spinner, Badge } from "./UI";
import { api } from "../utils/api";

const KYC_TIER = {
  0: { label: "No verification", short: "Unverified" },
  1: { label: "Profile complete only", short: "Unverified" },
  2: { label: "ID info submitted, not confirmed", short: "Unverified" },
  3: { label: "Verified (ID + selfie confirmed)", short: "Verified" },
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
              marginBottom: 16,
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
                {profile.kycLevel >= 3 && (
                  <BadgeCheck size={17} color={T.jade} />
                )}
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
              justifyContent: "space-between",
              alignItems: "center",
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}
              >
                Verification tier
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                {KYC_TIER[profile.kycLevel || 0].label}
              </div>
            </div>
            <Badge variant={profile.kycLevel >= 3 ? "jade" : "muted"}>
              Level {profile.kycLevel || 0}/3
            </Badge>
          </div>

          {profile.kycLevel < 3 ? (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                background: T.rustBg,
                border: `1px solid ${T.rustBorder}`,
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 12.5,
                color: T.rust,
                lineHeight: 1.6,
              }}
            >
              <AlertTriangle
                size={16}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span>
                This seller hasn't completed identity verification yet. Your
                funds are still protected by PaxeL escrow, but we recommend
                reviewing trade details carefully before you proceed.
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                background: T.jadeBg,
                border: `1px solid ${T.jadeBorder}`,
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 12.5,
                color: T.jade,
                lineHeight: 1.6,
              }}
            >
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                This seller has completed full identity verification, including
                ID document and selfie match.
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
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
              value={
                reviewData?.avgRating ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {reviewData.avgRating}{" "}
                    <Star size={14} fill={T.amber} color={T.amber} />
                  </span>
                ) : (
                  "—"
                )
              }
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
