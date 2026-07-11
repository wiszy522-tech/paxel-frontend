import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Wheat,
  Shirt,
  Smartphone,
  Armchair,
  Flower2,
  Sprout,
  Construction,
  Car,
  Wrench,
  Package,
  Search,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Badge, Spinner, EmptyState, Button } from "../components/UI";
import { api } from "../utils/api";

const CATEGORIES = [
  { value: "", label: "All", Icon: LayoutGrid },
  { value: "food_and_groceries", label: "Food", Icon: Wheat },
  { value: "fashion_and_clothing", label: "Fashion", Icon: Shirt },
  { value: "electronics", label: "Electronics", Icon: Smartphone },
  { value: "home_and_furniture", label: "Home", Icon: Armchair },
  { value: "health_and_beauty", label: "Beauty", Icon: Flower2 },
  { value: "agriculture", label: "Agriculture", Icon: Sprout },
  { value: "building_materials", label: "Building", Icon: Construction },
  { value: "vehicles", label: "Vehicles", Icon: Car },
  { value: "services", label: "Services", Icon: Wrench },
  { value: "other", label: "Other", Icon: Package },
];

function ProductCard({ product, onClick }) {
  const { theme: T } = useTheme();
  const [hovered, setHovered] = useState(false);

  const kycVerified = product.seller?.kycLevel >= 3;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hovered ? T.amber : T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? `0 12px 32px ${T.shadow}`
          : `0 2px 8px ${T.shadow}`,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          overflow: "hidden",
          background: T.bg,
        }}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.textMuted,
            }}
          >
            <Package size={36} />
          </div>
        )}
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <Badge variant={product.condition === "new" ? "jade" : "amber"}>
            {product.condition}
          </Badge>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: T.text,
            marginBottom: 4,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.title}
        </div>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: T.amber,
            marginBottom: 8,
          }}
        >
          ₦{product.price?.toLocaleString()}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: T.amberBg,
                border: `1px solid ${T.amberBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: T.amber,
                fontWeight: 700,
              }}
            >
              {product.seller?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <span style={{ fontSize: 12, color: T.textDim }}>
              {product.seller?.name?.split(" ")[0] || "Seller"}
            </span>
            {kycVerified && <BadgeCheckIcon T={T} />}
          </div>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {product.location?.state}
          </span>
        </div>
      </div>
    </div>
  );
}

function BadgeCheckIcon({ T }) {
  return <CheckCircle size={13} color={T.jade} />;
}

function SearchBar({ value, onChange }) {
  const { theme: T } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative", marginBottom: 20 }}>
      <Search
        size={16}
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: T.textMuted,
          pointerEvents: "none",
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products, categories, locations..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: T.surface,
          color: T.text,
          border: `1px solid ${focused ? T.amber : T.border}`,
          borderRadius: 12,
          padding: "13px 14px 13px 42px",
          fontSize: 14,
          outline: "none",
          fontFamily: "'Inter', sans-serif",
          boxShadow: focused ? `0 0 0 3px ${T.amberBg}` : "none",
          transition: "all 0.2s",
        }}
      />
    </div>
  );
}

export default function HomePage() {
  const { theme: T } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const delay = setTimeout(() => load(1), 400);
    return () => clearTimeout(delay);
  }, [search, category]);

  async function load(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      const data = await api(`/products?${params}`);
      setProducts(
        p === 1 ? data.products : (prev) => [...prev, ...data.products],
      );
      setPagination(data.pagination);
      setPage(p);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
        @media(min-width: 480px) { .product-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); } }
        @media(min-width: 768px) { .product-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; } }
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px, 4vw, 28px)",
              color: T.text,
            }}
          >
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {user?.name?.split(" ")[0]}
          </h1>
          <Button onClick={() => navigate("/products/new")} size="sm">
            + List item
          </Button>
        </div>
        <p style={{ fontSize: 13, color: T.textDim }}>
          Discover verified products from sellers across Nigeria
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 20,
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setCategory(c.value);
              setPage(1);
            }}
            style={{
              flexShrink: 0,
              border: `1px solid ${category === c.value ? T.amber : T.border}`,
              background: category === c.value ? T.amberBg : T.surface,
              color: category === c.value ? T.amber : T.textDim,
              borderRadius: 999,
              padding: "7px 14px",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: category === c.value ? 600 : 400,
              fontFamily: "'Inter', sans-serif",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <c.Icon size={14} /> {c.label}
          </button>
        ))}
      </div>

      {loading && products.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="No products found"
          body={
            search
              ? `No results for "${search}". Try a different keyword.`
              : "No products in this category yet."
          }
          action={
            <Button
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onClick={() => navigate(`/products/${p._id}`)}
              />
            ))}
          </div>

          {pagination && page < pagination.pages && (
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Button
                variant="secondary"
                onClick={() => load(page + 1)}
                loading={loading}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
