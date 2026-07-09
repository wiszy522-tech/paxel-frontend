import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Layout } from "../components/Layout";
import { Input, Button, Toast } from "../components/UI";
import { api, apiForm } from "../utils/api";

export default function NewProduct({ onAssistant }) {
  const { theme: T } = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [quantity, setQuantity] = useState("1");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api("/products/categories")
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  function handleFiles(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (images.length === 0) {
      setToast("Add at least one photo");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("condition", condition);
      formData.append("quantity", quantity);
      formData.append("city", city);
      formData.append("state", state);
      images.forEach((img) => formData.append("images", img));

      const data = await apiForm("/products", formData);
      navigate(`/products/${data.product._id}`);
    } catch (err) {
      setToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout onAssistant={onAssistant}>
      {toast && (
        <Toast message={toast} type="error" onClose={() => setToast(null)} />
      )}

      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: T.text,
          marginBottom: 20,
        }}
      >
        List a product
      </h1>

      <form onSubmit={handleSubmit}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: T.textDim,
            display: "block",
            marginBottom: 6,
          }}
        >
          Photos
        </label>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                objectFit: "cover",
              }}
            />
          ))}
          <label
            style={{
              width: 72,
              height: 72,
              borderRadius: 10,
              border: `1.5px dashed ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.textDim,
              fontSize: 24,
            }}
          >
            +
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <Input
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="What are you selling?"
          required
        />

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: T.textDim,
              display: "block",
              marginBottom: 6,
            }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{
              width: "100%",
              background: T.bg,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 14,
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        <Input
          label="Price (₦)"
          type="number"
          value={price}
          onChange={setPrice}
          placeholder="15000"
          required
        />

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: T.textDim,
              display: "block",
              marginBottom: 6,
            }}
          >
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{
              width: "100%",
              background: T.bg,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              outline: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.textDim,
                display: "block",
                marginBottom: 6,
              }}
            >
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={{
                width: "100%",
                background: T.bg,
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: 12,
                fontSize: 14,
                outline: "none",
                marginBottom: 16,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
          <div style={{ width: 100 }}>
            <Input
              label="Qty"
              type="number"
              value={quantity}
              onChange={setQuantity}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Input
              label="City"
              value={city}
              onChange={setCity}
              placeholder="Lagos"
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label="State"
              value={state}
              onChange={setState}
              placeholder="Lagos"
              required
            />
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Publish listing
        </Button>
      </form>
    </Layout>
  );
}
