import React, { useState, useContext } from "react";
import axios from "axios";
import IconButton from "./IconButton";
import CommentModal from "./CommentModal";
import { ThemeContext } from "../context/ThemeContext";

function PostCard({ post, fetchPosts, user }) {
  const [liked, setLiked] = useState(post.liked_by?.includes(user?.id));
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleString();
  };

  const handleLike = async () => {
    await axios.post(`http://localhost:5000/like-post/${post.id}`, {
      user_id: user.id,
    });

    setLiked(!liked);
    fetchPosts();
  };

  return (
    <>
      {showComments && (
        <CommentModal
          post={post}
          setShowComments={setShowComments}
          isDarkMode={isDarkMode}
          user={user}
          fetchPosts={fetchPosts}
        />
      )}

      <div
        style={{
          width: window.innerWidth < 480 ? "calc(100% - 20px)" : "100%",
          maxWidth: window.innerWidth < 480 ? "100%" : "550px",
          margin: "20px auto",
          backgroundColor: isDarkMode
            ? "rgba(26, 26, 46, 0.7)"
            : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: isDarkMode
            ? "0 8px 24px rgba(0,0,0,0.3)"
            : "0 8px 24px rgba(0,0,0,0.1)",
          border: isDarkMode
            ? "1px solid rgba(0, 212, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          transform: "perspective(1000px) rotateX(0deg)",
          color: isDarkMode ? "#fff" : "#000",
        }}
        onMouseEnter={(e) => {
          if (window.innerWidth > 768) {
            e.currentTarget.style.boxShadow = isDarkMode
              ? "0 12px 32px rgba(0, 212, 255, 0.15)"
              : "0 12px 32px rgba(0, 0, 0, 0.15)";
            e.currentTarget.style.borderColor = isDarkMode
              ? "rgba(0, 212, 255, 0.2)"
              : "rgba(0, 0, 0, 0.2)";
            e.currentTarget.style.transform =
              "perspective(1000px) rotateX(-3deg) translateY(-5px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = isDarkMode
            ? "0 8px 24px rgba(0,0,0,0.3)"
            : "0 8px 24px rgba(0,0,0,0.1)";
          e.currentTarget.style.borderColor = isDarkMode
            ? "rgba(0, 212, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg)";
        }}
      >
        {/* HEADER (Avatar + UUID) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "15px",
            borderBottom: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.05)"
              : "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`}
            alt="avatar"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              marginRight: "12px",
              border: isDarkMode
                ? "2px solid rgba(0, 212, 255, 0.3)"
                : "2px solid rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              transform: "perspective(800px) rotateY(0deg)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "perspective(800px) rotateY(10deg)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "perspective(800px) rotateY(0deg)";
            }}
          />
          <div>
            <span
              style={{
                fontWeight: "700",
                fontSize: "15px",
                background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              UID-{post.uid ? String(post.uid).padStart(5, "0") : "00001"}
            </span>
            <div
              style={{
                fontSize: "11px",
                color: isDarkMode ? "#888" : "#666",
                marginTop: "3px",
              }}
            >
              {formatTime(post.created_at)}
            </div>
          </div>
        </div>

        {/* IMAGE */}
        {post.image_url && (
          <div style={{ position: "relative", cursor: "pointer" }}>
            <img
              src={post.image_url}
              alt="post"
              style={{
                width: "100%",
                display: "block",
                transition: "filter 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.filter = "brightness(0.9)";
              }}
              onMouseLeave={(e) => {
                e.target.style.filter = "brightness(1)";
              }}
              onDoubleClick={() => {
                handleLike();
                setShowHeart(true);
                setTimeout(() => setShowHeart(false), 500);
              }}
            />

            {showHeart && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "60px",
                  color: "white",
                  opacity: 0.9,
                  animation: "pop 0.5s ease-out",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                ❤️
              </div>
            )}
          </div>
        )}

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            padding: "12px 15px",
            fontSize: "22px",
            borderBottom: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.05)"
              : "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <IconButton
            icon={liked ? "❤️" : "🤍"}
            onClick={handleLike}
            title="Like"
          />
          <span
            onClick={() => setShowComments(true)}
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
              padding: "4px 8px",
              borderRadius: "6px",
              transform: "perspective(800px) rotateZ(0deg)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDarkMode
                ? "rgba(0, 212, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)";
              e.target.style.transform = "perspective(800px) rotateZ(-5deg) scale(1.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.transform = "perspective(800px) rotateZ(0deg) scale(1)";
            }}
            title="Comment"
          >
            💬
          </span>

          <span
            title="Share"
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
              padding: "4px 8px",
              borderRadius: "6px",
              transform: "perspective(800px) rotateZ(0deg)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDarkMode
                ? "rgba(0, 212, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)";
              e.target.style.transform = "perspective(800px) rotateZ(5deg) scale(1.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.transform = "perspective(800px) rotateZ(0deg) scale(1)";
            }}
          >
            📤
          </span>
        </div>

        {/* LIKES COUNT */}
        <div
          style={{
            padding: "8px 15px",
            fontSize: "13px",
            fontWeight: "600",
            borderBottom: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.05)"
              : "1px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
            gap: "20px",
          }}
        >
          <span style={{ color: "#00d4ff" }}>
            {post.likes} {post.likes === 1 ? "like" : "likes"}
          </span>
          <span style={{ color: "#14b8a6" }}>
            {(post.comments?.length || 0)} {(post.comments?.length || 0) === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* CAPTION */}
        <div style={{ padding: "12px 15px" }}>
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: isDarkMode ? "#d0d0d0" : "#333",
              marginBottom: "8px",
              wordBreak: "break-word",
            }}
          >
            {post.content}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostCard;
