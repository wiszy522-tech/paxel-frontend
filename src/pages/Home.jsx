import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Layout } from "../components/Layout";
import { Card, Badge, Spinner, EmptyState, Input } from "../components/UI";
import { api } from "../utils/api";

function ProductCard({ product, onClick }) {
  const { theme: T } = useTheme();
  return (
    <Card onClick={onClick} style={{ padding: 0, overflow: "hidden" }}>
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
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <Badge variant="jade">🔒 Escrow</Badge>
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: T.text,
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.title}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: T.amber,
            marginBottom: 6,
          }}
        >
          ₦{Number(product.price).toLocaleString()}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: T.textDim }}>
            {product.location?.state || "Nigeria"}
          </span>
          <span style={{ fontSize: 12, color: T.textMuted }}>
            {product.seller?.name}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function Home({ onAssistant }) {
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
    <Layout onAssistant={onAssistant}>
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
          icon="🛍️"
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
