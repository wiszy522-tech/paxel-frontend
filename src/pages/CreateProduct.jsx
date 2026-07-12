import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Layout } from "../components/Layout";
import { Button, Input, Card } from "../components/UI";
import { apiForm } from "../utils/api";

const CATEGORIES = [
  { value: "food_and_groceries", label: "🌾 Food & Groceries" },
  { value: "fashion_and_clothing", label: "👗 Fashion & Clothing" },
  { value: "electronics", label: "📱 Electronics" },
  { value: "home_and_furniture", label: "🪑 Home & Furniture" },
  { value: "health_and_beauty", label: "💄 Health & Beauty" },
  { value: "agriculture", label: "🌱 Agriculture" },
  { value: "building_materials", label: "🧱 Building Materials" },
  { value: "vehicles", label: "🚗 Vehicles" },
  { value: "services", label: "🔧 Services" },
  { value: "other", label: "📦 Other" },
];

const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function CreateProductPage({ onAssistant }) {
  const { theme: T } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [quantity, setQuantity] = useState("1");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImages(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(i) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (images.length === 0) {
      setError("Please add at least one image");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("price", price);
      form.append("category", category);
      form.append("condition", condition);
      form.append("quantity", quantity);
      form.append("city", city);
      form.append("state", state);
      form.append("tags", tags);
      images.forEach((img) => form.append("images", img));

      const data = await apiForm("/products", form);
      navigate(`/products/${data.product._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const SelectStyle = {
    width: "100%",
    background: T.bg,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    marginBottom: 16,
  };

  const TextareaStyle = {
    width: "100%",
    background: T.bg,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    resize: "vertical",
    minHeight: 100,
    marginBottom: 16,
  };

  return (
    <Layout onAssistant={onAssistant}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        select,textarea{color-scheme:${T.name}}
      `}</style>

      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px,4vw,28px)",
              color: T.text,
              marginBottom: 4,
            }}
          >
            List a product
          </h1>
          <p style={{ fontSize: 13, color: T.textDim }}>
            Fill in the details below. Your item will be visible to buyers
            across Nigeria.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: T.text,
                marginBottom: 14,
              }}
            >
              📸 Photos (up to 5)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {previews.map((src, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: T.bg,
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <div
                  onClick={() => inputRef.current?.click()}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    border: `2px dashed ${T.border}`,
                    background: T.bg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>+</span>
                  <span style={{ fontSize: 10, color: T.textDim }}>
                    Add photo
                  </span>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImages}
            />
            <div style={{ fontSize: 11, color: T.textMuted }}>
              First image will be the cover photo
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: T.text,
                marginBottom: 14,
              }}
            >
              📝 Details
            </div>
            <Input
              label="Product title"
              value={title}
              onChange={setTitle}
              placeholder="e.g. 50 bags of Premium Rice"
              required
            />
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: T.textDim,
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product — quality, quantity, what's included..."
                style={TextareaStyle}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Input
                label="Price (₦)"
                type="number"
                value={price}
                onChange={setPrice}
                placeholder="185000"
                required
              />
              <Input
                label="Quantity"
                type="number"
                value={quantity}
                onChange={setQuantity}
                placeholder="1"
              />
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: T.text,
                marginBottom: 14,
              }}
            >
              🏷️ Category & Condition
            </div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: T.textDim,
                display: "block",
                marginBottom: 5,
              }}
            >
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={SelectStyle}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              {["new", "used", "refurbished"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  style={{
                    flex: 1,
                    border: `1px solid ${condition === c ? T.amber : T.border}`,
                    background: condition === c ? T.amberBg : "transparent",
                    color: condition === c ? T.amber : T.textDim,
                    borderRadius: 8,
                    padding: "9px 0",
                    fontSize: 13,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: T.text,
                marginBottom: 14,
              }}
            >
              📍 Location
            </div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: T.textDim,
                display: "block",
                marginBottom: 5,
              }}
            >
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={SelectStyle}
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Input
              label="City"
              value={city}
              onChange={setCity}
              placeholder="e.g. Kano"
            />
            <Input
              label="Tags (comma separated)"
              value={tags}
              onChange={setTags}
              placeholder="rice, wholesale, food"
            />
          </Card>

          {error && (
            <div
              style={{
                background: T.rustBg,
                border: `1px solid ${T.rustBorder}`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: T.rust,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={loading}>
              Publish listing
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
