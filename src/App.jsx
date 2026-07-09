import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AssistantWidget from "./components/AssistantWidget";
import { api } from "./utils/api";
import { useEffect } from "react";

import AuthPage from "./pages/Auth";
import TermsPage from "./pages/TermsPage";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import NewProduct from "./pages/NewProduct";
import Trades from "./pages/Trades";
import TradeDetail from "./pages/TradeDetail";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";

function GoogleCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/");
      return;
    }
    localStorage.setItem("paxel_token", token);
    api("/auth/me")
      .then((d) => {
        login(d.user, token);
        navigate("/home");
      })
      .catch(() => navigate("/"));
  }, [params, login, navigate]);

  return null;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const openAssistant = () => setAssistantOpen(true);

  return (
    <>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <NewProduct onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetail onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trades"
          element={
            <ProtectedRoute>
              <Trades onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trades/:tradeCode"
          element={
            <ProtectedRoute>
              <TradeDetail onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile onAssistant={openAssistant} />
            </ProtectedRoute>
          }
        />
      </Routes>
      <AssistantWidget
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
