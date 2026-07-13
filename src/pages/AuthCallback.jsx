import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { LogoPulse } from "../components/Layout";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }
    localStorage.setItem("paxel_token", token);
    api("/profile")
      .then((data) => {
        login(data.user, token);
        navigate("/home", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("paxel_token");
        navigate("/auth", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LogoPulse />;
}
