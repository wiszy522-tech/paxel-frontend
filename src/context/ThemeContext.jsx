import { createContext, useContext, useState, useEffect } from "react";
const ThemeContext = createContext();
export const DARK = {
  bg: "#0A0A0F",
  bgAlt: "#0F1018",
  surface: "#1C1F2B",
  surfaceAlt: "#242838",
  border: "#2A2E3D",
  borderLight: "#353A4F",
  amber: "#F2A93B",
  amberDim: "#B9790A",
  amberBg: "rgba(242,169,59,0.08)",
  amberBorder: "rgba(242,169,59,0.2)",
  jade: "#3FA66B",
  jadeBg: "rgba(63,166,107,0.08)",
  jadeBorder: "rgba(63,166,107,0.2)",
  rust: "#C1502E",
  rustBg: "rgba(193,80,46,0.08)",
  rustBorder: "rgba(193,80,46,0.2)",
  text: "#F1EDE3",
  textDim: "#9CA0AE",
  textMuted: "#5A6072",
  shadow: "rgba(0,0,0,0.5)",
  overlay: "rgba(0,0,0,0.7)",
  name: "dark",
};
export const LIGHT = {
  bg: "#F4F1EB",
  bgAlt: "#EDE9E0",
  surface: "#FFFFFF",
  surfaceAlt: "#F8F6F1",
  border: "#E2DDD4",
  borderLight: "#EDE9E0",
  amber: "#B9790A",
  amberDim: "#8A5A07",
  amberBg: "rgba(185,121,10,0.08)",
  amberBorder: "rgba(185,121,10,0.2)",
  jade: "#2E7A50",
  jadeBg: "rgba(46,122,80,0.08)",
  jadeBorder: "rgba(46,122,80,0.2)",
  rust: "#A63A20",
  rustBg: "rgba(166,58,32,0.08)",
  rustBorder: "rgba(166,58,32,0.2)",
  text: "#1A1714",
  textDim: "#6B6560",
  textMuted: "#A09890",
  shadow: "rgba(0,0,0,0.12)",
  overlay: "rgba(0,0,0,0.5)",
  name: "light",
};
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("paxel_theme");
    return saved === "light" ? LIGHT : DARK;
  });
  function toggleTheme() {
    const next = theme.name === "dark" ? LIGHT : DARK;
    setTheme(next);
    localStorage.setItem("paxel_theme", next.name);
  }
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
