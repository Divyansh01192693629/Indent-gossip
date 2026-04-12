import React, { useState, useContext } from "react";
import axios from "axios";
import Loader from "./Loader";
import { ThemeContext } from "../context/ThemeContext";

function CreatePost({ fetchPosts, user }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const API = process.env.REACT_APP_API_URL;

  const handlePost = async () => {
    if (!content && !image) {
      return alert("Add caption or image ❌");
    }

    let image_url = "";

    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      const res = await axios.post(`${API}/upload-image`, formData);

      image_url = res.data.image_url;
    }

    await axios.post(`${API}/create-post`, {
      content,
      image_url,
      user_id: user.id,
      uid: user.uid,
    });

    setContent("");
    setImage(null);
    fetchPosts();
  };

  return (
    <div
      style={{
        maxWidth: window.innerWidth < 480 ? "100%" : "550px",
        width: window.innerWidth < 480 ? "calc(100% - 20px)" : "100%",
        margin: "20px auto",
        backgroundColor: isDarkMode
          ? "rgba(26, 26, 46, 0.8)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        padding: window.innerWidth < 480 ? "12px" : "20px",
        borderRadius: "12px",
        border: isDarkMode
          ? "1px solid rgba(0, 212, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.1)",
        color: isDarkMode ? "#eaeaea" : "#000",
        boxShadow: isDarkMode
          ? "0 8px 24px rgba(0, 0, 0, 0.3)"
          : "0 8px 24px rgba(0, 0, 0, 0.1)",
        transform: "perspective(1000px) rotateX(0deg)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        if (window.innerWidth > 768) {
          e.currentTarget.style.transform =
            "perspective(1000px) rotateX(-2deg) translateY(-3px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg)";
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 15,
          fontSize: "16px",
          background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        📝 What's on your mind?
      </h3>

      <textarea
        placeholder="Share your thoughts, confessions, or gossip..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: "100%",
          height: "100px",
          padding: "12px",
          backgroundColor: isDarkMode
            ? "rgba(15, 15, 30, 0.6)"
            : "rgba(0, 0, 0, 0.05)",
          color: isDarkMode ? "#eaeaea" : "#000",
          border: isDarkMode
            ? "1px solid rgba(0, 212, 255, 0.15)"
            : "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          fontSize: "14px",
          fontFamily: "inherit",
          resize: "none",
          transition: "all 0.3s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = isDarkMode
            ? "rgba(0, 212, 255, 0.4)"
            : "rgba(0, 0, 0, 0.3)";
          e.target.style.boxShadow = isDarkMode
            ? "0 0 0 3px rgba(0, 212, 255, 0.05)"
            : "0 0 0 3px rgba(0, 0, 0, 0.05)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = isDarkMode
            ? "rgba(0, 212, 255, 0.15)"
            : "rgba(0, 0, 0, 0.1)";
          e.target.style.boxShadow = "none";
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "15px 0",
        }}
      >
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "6px",
            background: isDarkMode
              ? "rgba(0, 212, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
            border: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.2)"
              : "1px solid rgba(0, 0, 0, 0.15)",
            transition: "all 0.3s ease",
            fontSize: "13px",
            transform: "perspective(800px) rotateY(0deg)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode
              ? "rgba(0, 212, 255, 0.2)"
              : "rgba(0, 0, 0, 0.15)";
            e.currentTarget.style.transform =
              "perspective(800px) rotateY(-5deg) translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode
              ? "rgba(0, 212, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.transform =
              "perspective(800px) rotateY(0deg)";
          }}
        >
          🖼️ Add Image
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            style={{ display: "none" }}
            accept="image/*"
          />
        </label>

        {image && (
          <div
            style={{
              fontSize: "13px",
              color: "#00d4ff",
              animation: "slideIn 0.3s ease",
            }}
          >
            ✓ {image.name}
          </div>
        )}
      </div>

      {/* loading  */}
      {loading && (
        <div style={{ textAlign: "center", margin: "15px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 10px" }}></div>
          <p
            style={{
              color: isDarkMode ? "#aaa" : "#666",
              fontSize: "13px",
              margin: 0,
            }}
          >
            Posting...
          </p>
        </div>
      )}

      {/* post button */}
      {loading ? (
        <Loader text="Posting..." />
      ) : (
        <button
          onClick={handlePost}
          style={{
            marginTop: "15px",
            padding: "12px 24px",
            width: "100%",
            background: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
            transform: "perspective(800px) rotateX(0deg)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform =
              "perspective(800px) rotateX(-3deg) translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(168, 85, 247, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "perspective(800px) rotateX(0deg)";
            e.target.style.boxShadow = "0 4px 12px rgba(168, 85, 247, 0.3)";
          }}
        >
          🚀 Post
        </button>
      )}
    </div>
  );
}

export default CreatePost;
