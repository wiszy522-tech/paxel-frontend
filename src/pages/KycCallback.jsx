import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/UI";
import { api } from "../utils/api";

export default function KycCallback() {
  const { theme: T } = useTheme();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api("/kyc/status")
      .then((d) => setStatus(d))
      .catch(() => setStatus(null))
      .finally(() => setChecking(false));
  }, []);

  return (
    <Layout>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        {checking ? (
          <>
            <Spinner size={36} />
            <div style={{ marginTop: 16, color: T.textDim, fontSize: 14 }}>
              Checking verification status...
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {status?.diditStatus === "approved" ? "✅" : "🕒"}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: T.text,
                marginBottom: 8,
              }}
            >
              {status?.diditStatus === "approved"
                ? "Verification complete"
                : "Verification submitted"}
            </div>
            <div
              style={{
                fontSize: 14,
                color: T.textDim,
                marginBottom: 24,
                maxWidth: 360,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.6,
              }}
            >
              {status?.diditStatus === "approved"
                ? "Your identity has been verified. You now have full access to PaxeL."
                : "We're reviewing your submission. This can take a few minutes \u2014 check back on your profile shortly."}
            </div>
            <button
              onClick={() => navigate("/profile")}
              style={{
                background: T.amber,
                border: "none",
                color: "#0A0A0F",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 28px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Back to profile
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}
