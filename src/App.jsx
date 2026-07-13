import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/Home";
import ProductDetailPage from "./pages/ProductDetail";
import CreateProductPage from "./pages/CreateProduct";
import TradesPage from "./pages/Trades";
import TradeDetailPage from "./pages/TradeDetail";
import WalletPage from "./pages/Wallet";
import ProfilePage from "./pages/Profile";
import AssistantWidget from "./pages/Assistant";
import LandingPage from "./pages/Landing";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/home" replace />;
  return children;
}

function AppRoutes() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <CreateProductPage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trades"
          element={
            <ProtectedRoute>
              <TradesPage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trades/:code"
          element={
            <ProtectedRoute>
              <TradeDetailPage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage onAssistant={() => setAssistantOpen(true)} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
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
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
