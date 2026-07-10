import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  fullWidth,
  type = "button",
  style = {},
}) {
  const { theme: T } = useTheme();
  const [pressed, setPressed] = useState(false);

  const sizes = { sm: "8px 14px", md: "12px 22px", lg: "15px 32px" };
  const fontSizes = { sm: 13, md: 14, lg: 16 };

  const variants = {
    primary: { background: T.amber, color: "#0A0A0F", border: "none" },
    secondary: {
      background: "transparent",
      color: T.text,
      border: `1px solid ${T.border}`,
    },
    danger: { background: T.rust, color: "#fff", border: "none" },
    ghost: {
      background: T.amberBg,
      color: T.amber,
      border: `1px solid ${T.amberBorder}`,
    },
    jade: { background: T.jade, color: "#fff", border: "none" },
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        ...v,
        padding: sizes[size],
        fontSize: fontSizes[size],
        fontWeight: 700,
        borderRadius: 10,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.5 : 1,
        transform: pressed && !disabled ? "scale(0.97)" : "scale(1)",
        transition: "all 0.15s",
        fontFamily: "'Inter', sans-serif",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...style,
      }}
    >
      {loading ? (
        <Spinner size={14} color={variant === "primary" ? "#0A0A0F" : "#fff"} />
      ) : (
        children
      )}
    </button>
  );
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  hint,
  icon,
  rightElement,
  style = {},
}) {
  const { theme: T } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: T.textDim,
            display: "block",
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <div
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: T.textMuted,
              pointerEvents: "none",
            }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: T.bg,
            color: T.text,
            border: `1px solid ${error ? T.rust : focused ? T.amber : T.border}`,
            borderRadius: 10,
            padding: `12px ${rightElement ? "40px" : "14px"} 12px ${icon ? "38px" : "14px"}`,
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused ? `0 0 0 3px ${T.amberBg}` : "none",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {rightElement && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: T.rust, marginTop: 4 }}>{error}</div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function Card({ children, style = {}, onClick, hover = true }) {
  const { theme: T } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hovered ? T.amber : T.border}`,
        borderRadius: 16,
        padding: 20,
        cursor: onClick ? "pointer" : "default",
        transform: hovered && onClick ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 8px 24px ${T.shadow}` : `0 2px 8px ${T.shadow}`,
        transition: "all 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = "amber" }) {
  const { theme: T } = useTheme();
  const variants = {
    amber: { bg: T.amberBg, color: T.amber, border: T.amberBorder },
    jade: { bg: T.jadeBg, color: T.jade, border: T.jadeBorder },
    rust: { bg: T.rustBg, color: T.rust, border: T.rustBorder },
    muted: { bg: "transparent", color: T.textDim, border: T.border },
  };
  const v = variants[variant] || variants.amber;

  return (
    <span
      style={{
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {children}
    </span>
  );
}

export function Spinner({ size = 20, color }) {
  const { theme: T } = useTheme();
  const c = color || T.amber;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid transparent`,
        borderTopColor: c,
        borderRightColor: c,
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
        flexShrink: 0,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Modal({ open, onClose, children, title, width = 480 }) {
  const { theme: T } = useTheme();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: T.overlay,
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "28px 24px",
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "modalIn 0.2s ease-out",
        }}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
        {title && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: T.text,
                margin: 0,
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: T.textDim,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, type = "success", onClose }) {
  const { theme: T } = useTheme();
  const colors = { success: T.jade, error: T.rust, info: T.amber };
  const c = colors[type] || T.amber;

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 900,
        background: T.surface,
        border: `1px solid ${c}`,
        borderRadius: 12,
        padding: "12px 20px",
        minWidth: 260,
        maxWidth: "90vw",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: `0 8px 32px ${T.shadow}`,
        animation: "toastIn 0.3s ease-out",
      }}
    >
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: c,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 14, color: T.text, flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: T.textDim,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function Avatar({ name, photo, size = 36 }) {
  const { theme: T } = useTheme();
  if (photo)
    return (
      <img
        src={photo}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: `2px solid ${T.border}`,
        }}
      />
    );
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: T.amberBg,
        border: `2px solid ${T.amberBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: size * 0.36,
        color: T.amber,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function Divider({ style = {} }) {
  const { theme: T } = useTheme();
  return (
    <div
      style={{ height: 1, background: T.border, margin: "16px 0", ...style }}
    />
  );
}

export function EmptyState({ icon, title, body, action }) {
  const { theme: T } = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: T.surfaceAlt,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.textMuted,
          margin: "0 auto 16px",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: T.text,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: T.textDim,
          marginBottom: 24,
          maxWidth: 280,
          margin: "0 auto 24px",
        }}
      >
        {body}
      </div>
      {action}
    </div>
  );
}
