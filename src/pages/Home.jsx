import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, BadgeCheck, ShoppingBag } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Layout } from "../components/Layout";
import { Spinner, EmptyState, Input } from "../components/UI";
import { api } from "../utils/api";

function ProductCard({ product, onClick }) {
  const { theme: T } = useTheme();
  return (
    <div
      onClick={onClick}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 12px 28px ${T.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1/1",
          background: T.surfaceAlt,
        }}
      >
        <img
          src={product.images?.[0]}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
          }}
        />
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span
            style={{
              background: "rgba(63,166,107,0.92)",
              color: "#fff",
              fontSize: 10.5,
              fontWeight: 700,
              borderRadius: 999,
              padding: "4px 9px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <ShieldCheck size={11} /> Escrow
          </span>
        </div>
        {product.seller?.primaryTag && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <span
              style={{
                background:
                  product.seller?.kycLevel >= 3
                    ? "rgba(63,166,107,0.92)"
                    : "rgba(10,10,15,0.55)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 999,
                padding: "4px 9px",
                textTransform: "capitalize",
                fontFamily: "'Inter', sans-serif",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              {product.seller?.kycLevel >= 3 && <BadgeCheck size={12} />}{" "}
              {product.seller.primaryTag}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: 13 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: T.text,
            marginBottom: 6,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 34,
          }}
        >
          {product.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 17,
              fontWeight: 700,
              color: T.amber,
            }}
          >
            ₦{Number(product.price).toLocaleString()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: T.amberBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 800,
                color: T.amber,
                flexShrink: 0,
              }}
            >
              {product.seller?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <span
              style={{
                fontSize: 11.5,
                color: T.textMuted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.seller?.name}
            </span>
            {product.seller?.kycLevel >= 3 && (
              <BadgeCheck size={13} color={T.jade} style={{ flexShrink: 0 }} />
            )}
          </div>
          <span
            style={{
              fontSize: 10.5,
              color: T.textDim,
              fontWeight: 600,
              flexShrink: 0,
              background: T.surfaceAlt,
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            {product.location?.state || "NG"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { theme: T } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadProducts = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(opts.page || 1),
        ...(opts.category ? { category: opts.category } : {}),
        ...(opts.search ? { search: opts.search } : {}),
      });
      const data = await api(`/products?${params.toString()}`);
      setProducts(data.products);
      setPages(data.pagination.pages);
      setPage(data.pagination.page);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api("/products/categories")
      .then((d) => setCategories(d.categories))
      .catch(() => {});
    loadProducts({ page: 1 });
  }, [loadProducts]);

  function handleSearch(e) {
    e.preventDefault();
    loadProducts({ page: 1, category, search });
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: T.text,
            marginBottom: 6,
          }}
        >
          Trade with strangers, safely
        </h1>
        <p style={{ fontSize: 14, color: T.textDim }}>
          Every listing here is backed by escrow. Funds only move when delivery
          is proven.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <div style={{ flex: 1 }}>
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search products..."
            style={{ marginBottom: 0 }}
          />
        </div>
        <button
          type="submit"
          style={{
            background: T.amber,
            color: "#0A0A0F",
            border: "none",
            borderRadius: 10,
            padding: "0 20px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Search
        </button>
      </form>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => {
            setCategory("");
            loadProducts({ page: 1, search });
          }}
          style={{
            flexShrink: 0,
            border: `1px solid ${!category ? T.amber : T.border}`,
            background: !category ? T.amberBg : "transparent",
            color: !category ? T.amber : T.textDim,
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: !category ? 600 : 400,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setCategory(c.value);
              loadProducts({ page: 1, search, category: c.value });
            }}
            style={{
              flexShrink: 0,
              border: `1px solid ${category === c.value ? T.amber : T.border}`,
              background: category === c.value ? T.amberBg : "transparent",
              color: category === c.value ? T.amber : T.textDim,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: category === c.value ? 600 : 400,
              fontFamily: "'Inter', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={28} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={24} />}
          title="No listings found"
          body="Try a different search or category, or be the first to list something here."
        />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onClick={() => navigate(`/products/${p._id}`)}
              />
            ))}
          </div>
          {pages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => loadProducts({ page: n, category, search })}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${n === page ? T.amber : T.border}`,
                    background: n === page ? T.amber : "transparent",
                    color: n === page ? "#0A0A0F" : T.textDim,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
