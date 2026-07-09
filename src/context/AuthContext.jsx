import { createContext, useContext, useState } from "react";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("paxel_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const token = localStorage.getItem("paxel_token");
  function login(userData, tokenStr) {
    localStorage.setItem("paxel_user", JSON.stringify(userData));
    localStorage.setItem("paxel_token", tokenStr);
    setUser(userData);
  }
  function logout() {
    localStorage.removeItem("paxel_user");
    localStorage.removeItem("paxel_token");
    setUser(null);
  }
  function updateUser(updates) {
    const updated = { ...user, ...updates };
    localStorage.setItem("paxel_user", JSON.stringify(updated));
    setUser(updated);
  }
  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
