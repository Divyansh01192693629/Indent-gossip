import React, { useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

function CreatePost({ fetchPosts, user }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Posting...");
  const { isDarkMode } = useContext(ThemeContext);
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!content && !image) return alert("Add caption or image ❌");
    setLoading(true);
    try {
      // 🔥 STEP 1: NLP TEXT CHECK — runs even if image-only post with caption
      if (content) {
        setLoadingMsg("🔍 Checking content safety...");
        const valRes = await axios.post(`${API}/validate-text`, { content });
        if (!valRes.data.safe) {
          setLoading(false);
          setLoadingMsg("Posting...");
          return alert(`🚫 Cannot post: Your caption contains ${valRes.data.reason} content. Please revise it.`);
        }
      }

      // 🔥 STEP 2: Upload image (after text is validated)
      let image_url = "";
      if (image) {
        setLoadingMsg("📤 Uploading image...");
        const formData = new FormData();
        formData.append("image", image);
        const res = await axios.post(`${API}/upload-image`, formData);
        image_url = res.data.image_url;
      }

      // 🔥 STEP 3: Create post (server will also run image safety check via Google Vision)
      setLoadingMsg("✨ Creating post...");
      await axios.post(`${API}/create-post`, {
        content, image_url, user_id: user.id, uid: user.uid,
      });

      setContent("");
      setImage(null);
      setImagePreview(null);
      fetchPosts();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      alert("Failed to post: " + errMsg);
    } finally {
      setLoading(false);
      setLoadingMsg("Posting...");
    }
  };

  return (
    <div style={{
      width: "100%", maxWidth: 560, margin: "0 auto 20px",
      background: "rgba(13,13,35,0.88)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderRadius: 20, padding: "22px 24px",
      border: "1px solid rgba(0,212,255,0.1)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05)",
      animation: "slideUp 0.4s ease",
      position: "relative", overflow: "hidden",
    }}>
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, #00d4ff, #a855f7, #ff006e)",
        borderRadius: "20px 20px 0 0",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #00d4ff, #a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>✏️</div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "#ccd6f6" }}>New Confession</div>
          <div style={{ fontSize: 11, color: "#6272a4" }}>Anonymous · Only UID shown · AI-moderated 🤖</div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        placeholder="What's on your mind? Share anonymously... (AI moderation active)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        style={{
          width: "100%", minHeight: 90, padding: "12px 14px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(0,212,255,0.12)",
          borderRadius: 12, color: "#ccd6f6", fontSize: 14,
          fontFamily: "inherit", resize: "vertical",
          outline: "none", transition: "all 0.3s ease",
          boxSizing: "border-box", lineHeight: 1.6,
          opacity: loading ? 0.5 : 1,
        }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.4)"; e.target.style.background = "rgba(0,212,255,0.04)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.06)"; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.03)"; e.target.style.boxShadow = "none"; }}
      />

      {/* Image Preview */}
      {imagePreview && (
        <div style={{
          marginTop: 12, position: "relative", borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(0,212,255,0.2)",
        }}>
          <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
          <button
            onClick={() => { setImage(null); setImagePreview(null); }}
            style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(0,0,0,0.7)", border: "none", color: "#fff",
              borderRadius: "50%", width: 28, height: 28, cursor: "pointer",
              fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
          <div style={{ padding: "6px 12px", background: "rgba(0,0,0,0.6)", fontSize: 11, color: "#8892b0" }}>
            🖼️ {image?.name} · Will be scanned for safety
          </div>
        </div>
      )}

      {/* Image picked indicator (no preview yet) */}
      {image && !imagePreview && (
        <div style={{
          marginTop: 10, padding: "8px 14px", borderRadius: 8,
          background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
          display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between",
          animation: "slideUp 0.3s ease",
        }}>
          <span style={{ fontSize: 12, color: "#00d4ff" }}>🖼️ {image.name}</span>
          <button
            onClick={() => { setImage(null); setImagePreview(null); }}
            style={{ background: "none", border: "none", color: "#6272a4", cursor: "pointer", fontSize: 16, padding: "0 4px", fontFamily: "inherit" }}
          >✕</button>
        </div>
      )}

      {/* Loading status */}
      {loading && (
        <div style={{
          marginTop: 10, padding: "8px 14px", borderRadius: 8,
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#a855f7",
        }}>
          <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderColor: "rgba(168,85,247,0.3)", borderTopColor: "#a855f7" }} />
          {loadingMsg}
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        {/* Image upload */}
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          color: "#8892b0", fontSize: 12, fontWeight: 600,
          transition: "all 0.25s ease",
          opacity: loading ? 0.5 : 1,
        }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "rgba(0,212,255,0.08)"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)"; e.currentTarget.style.color = "#00d4ff"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#8892b0"; }}
        >
          🖼️ {image ? "Change" : "Image"}
          <input type="file" onChange={handleImageChange} style={{ display: "none" }} accept="image/*" disabled={loading} />
        </label>

        {/* Char count */}
        <span style={{ fontSize: 11, color: content.length > 280 ? "#ff6b6b" : "#6272a4", marginLeft: 4 }}>
          {content.length}/500
        </span>

        {/* NLP badge */}
        <span style={{ fontSize: 10, color: "#6272a4", display: "flex", alignItems: "center", gap: 4 }}>
          🤖 AI-moderated
        </span>

        {/* Post button */}
        <button
          onClick={handlePost}
          disabled={loading || (!content && !image)}
          style={{
            marginLeft: "auto", padding: "9px 24px", borderRadius: 10, border: "none",
            background: (loading || (!content && !image))
              ? "rgba(168,85,247,0.3)"
              : "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
            color: "#fff", fontWeight: 700, fontSize: 13,
            cursor: (loading || (!content && !image)) ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(168,85,247,0.3)",
            transition: "all 0.25s ease",
            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
          }}
          onMouseEnter={(e) => { if (!loading && (content || image)) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(168,85,247,0.5)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(168,85,247,0.3)"; }}
        >
          {loading
            ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /></>
            : "🚀 Post"
          }
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
