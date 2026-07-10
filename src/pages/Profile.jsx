import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Pencil, BadgeCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import {
  Card,
  Badge,
  Button,
  Input,
  Avatar,
  Spinner,
  Toast,
  Divider,
} from "../components/UI";
import { api, apiForm } from "../utils/api";

const KYC_LABELS = {
  0: "Not started",
  1: "Profile complete",
  2: "BVN/NIN submitted",
  3: "Fully verified",
};

function KycCard() {
  const { theme: T } = useTheme();
  const [status, setStatus] = useState(null);
  const [startingKyc, setStartingKyc] = useState(false);
  const [toast, setToast] = useState(null);

  function load() {
    api("/kyc/status")
      .then(setStatus)
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function startDidit() {
    setStartingKyc(true);
    try {
      const data = await api("/kyc/didit/start", { method: "POST" });
      window.location.href = data.sessionUrl;
    } catch (err) {
      setToast(err.message);
      setStartingKyc(false);
    }
  }

  if (!status) return null;

  return (
    <Card style={{ marginBottom: 16 }}>
      {toast && (
        <Toast message={toast} type="error" onClose={() => setToast(null)} />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
          Identity verification
        </div>
        <Badge variant={status.kycLevel >= 3 ? "jade" : "amber"}>
          Level {status.kycLevel}/3
        </Badge>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[1, 2, 3].map((l) => (
          <div
            key={l}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: status.kycLevel >= l ? T.amber : T.border,
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 13, color: T.textDim, marginBottom: 14 }}>
        {status.nextStep}
      </p>
      {status.kycLevel < 3 && status.kycLevel >= 2 && (
        <Button fullWidth loading={startingKyc} onClick={startDidit}>
          {status.diditStatus === "pending"
            ? "Resume verification"
            : "Verify with Didit"}
        </Button>
      )}
      {status.kycLevel < 2 && (
        <div style={{ fontSize: 12, color: T.textMuted }}>
          Complete the steps above first.
        </div>
      )}
    </Card>
  );
}

export default function Profile() {
  const { theme: T } = useTheme();
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const isOwnProfile = !userId || userId === user?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const endpoint = isOwnProfile ? "/profile" : `/profile/${userId}`;
    api(endpoint)
      .then((d) => {
        setProfile(d.user);
        if (isOwnProfile) {
          setName(d.user.name || "");
          setPhone(d.user.phone || "");
          setCity(d.user.address?.city || "");
          setState(d.user.address?.state || "");
        }
      })
      .finally(() => setLoading(false));
  }, [isOwnProfile, userId]);

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await api("/profile", {
        method: "PUT",
        body: JSON.stringify({ name, phone, city, state }),
      });
      setProfile(data.user);
      updateUser({ name: data.user.name });
      setEditing(false);
      setToast("Profile updated");
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitKycBasics() {
    setSaving(true);
    try {
      const formData = new FormData();
      if (bvn) formData.append("bvn", bvn);
      if (nin) formData.append("nin", nin);
      const data = await apiForm("/profile/kyc", formData);
      setToast("Submitted");
      const p = await api("/profile");
      setProfile(p.user);
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      const data = await apiForm("/profile/photo", formData);
      updateUser({ profilePhoto: data.profilePhoto });
      setProfile((p) => ({ ...p, profilePhoto: data.profilePhoto }));
    } catch (err) {
      setToast(err.message);
    } finally {
      setPhotoUploading(false);
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

  return (
    <Layout>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ position: "relative" }}>
          <Avatar
            name={profile?.name}
            photo={profile?.profilePhoto}
            size={72}
          />
          {isOwnProfile && (
            <label
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                background: T.amber,
                borderRadius: "50%",
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {photoUploading ? (
                <Spinner size={12} color="#0A0A0F" />
              ) : (
                <Pencil size={12} color="#0A0A0F" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: T.text,
            }}
          >
            {profile?.name}
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            {profile?.address?.city}, {profile?.address?.state}
          </div>
          {profile?.kycLevel >= 3 && (
            <Badge variant="jade">
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <BadgeCheck size={12} /> Verified
              </span>
            </Badge>
          )}
        </div>
      </div>

      {isOwnProfile && <KycCard />}

      {isOwnProfile && profile?.kycLevel === 1 && (
        <Card style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.text,
              marginBottom: 12,
            }}
          >
            Submit BVN or NIN
          </div>
          <Input
            label="BVN (optional)"
            value={bvn}
            onChange={setBvn}
            placeholder="11 digits"
          />
          <Input
            label="NIN (optional)"
            value={nin}
            onChange={setNin}
            placeholder="11 digits"
          />
          <Button
            fullWidth
            loading={saving}
            onClick={submitKycBasics}
            disabled={!bvn && !nin}
          >
            Submit
          </Button>
        </Card>
      )}

      {isOwnProfile && (
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
              Personal details
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: T.amber,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Edit
              </button>
            )}
          </div>
          {editing ? (
            <>
              <Input label="Full name" value={name} onChange={setName} />
              <Input label="Phone" value={phone} onChange={setPhone} />
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Input label="City" value={city} onChange={setCity} />
                </div>
                <div style={{ flex: 1 }}>
                  <Input label="State" value={state} onChange={setState} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button fullWidth loading={saving} onClick={saveProfile}>
                  Save
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: T.textDim, lineHeight: 2 }}>
              <div>
                Email: <span style={{ color: T.text }}>{profile?.email}</span>
              </div>
              <div>
                Phone:{" "}
                <span style={{ color: T.text }}>{profile?.phone || "—"}</span>
              </div>
              <Divider />
              <div>
                Wallet balance:{" "}
                <span style={{ color: T.amber, fontWeight: 700 }}>
                  ₦{Number(profile?.walletBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}
    </Layout>
  );
}
