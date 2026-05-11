import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { playNotificationSound } from "../utils/audioNotification";

function CommentModal({ post, setShowComments, isDarkMode, user, fetchPosts }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const fetchComments = async () => {
    setFetchLoading(true);
    try {
      console.log("Fetching comments for post:", post.id);
      const { data } = await axios.get(`http://localhost:5000/comments/${post.id}`);
      console.log("Comments received:", data);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      console.error("Error details:", err.response?.data);
      alert("Error loading comments: " + (err.response?.data?.error || err.message));
      setComments([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/add-comment/${post.id}`, {
        text: comment,
        user_id: user?.id,
      });

      setComment("");
      fetchComments();
      playNotificationSound();
      fetchPosts();
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!replyText.trim()) return;

    setReplyLoading(true);
    try {
      await axios.post(`http://localhost:5000/add-reply/${post.id}/${parentCommentId}`, {
        text: replyText,
        user_id: user?.id,
      });

      setReplyText("");
      setReplyingTo(null);
      fetchComments();
      playNotificationSound();
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Failed to post reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const [userVotes, setUserVotes] = useState({}); // Track user votes per comment

  const handleLikeComment = async (commentId, isReply = false, parentId = null) => {
    const voteKey = `${post.id}-${commentId}`;
    const currentVote = userVotes[voteKey];

    // If already liked, remove the like (toggle off)
    if (currentVote === "like") {
      setUserVotes({ ...userVotes, [voteKey]: null });
      try {
        await axios.post(`http://localhost:5000/unlike-comment/${post.id}/${commentId}`, {
          user_id: user?.id,
        });
        fetchComments();
      } catch (err) {
        console.error("Error unliking comment:", err);
      }
    } else {
      // Like the comment (remove dislike if any)
      setUserVotes({ ...userVotes, [voteKey]: "like" });
      try {
        await axios.post(`http://localhost:5000/like-comment/${post.id}/${commentId}`, {
          user_id: user?.id,
          removeDislike: currentVote === "dislike",
        });
        fetchComments();
      } catch (err) {
        console.error("Error liking comment:", err);
        setUserVotes({ ...userVotes, [voteKey]: currentVote });
      }
    }
  };

  const handleDislikeComment = async (commentId, isReply = false, parentId = null) => {
    const voteKey = `${post.id}-${commentId}`;
    const currentVote = userVotes[voteKey];

    // If already disliked, remove the dislike (toggle off)
    if (currentVote === "dislike") {
      setUserVotes({ ...userVotes, [voteKey]: null });
      try {
        await axios.post(`http://localhost:5000/undislike-comment/${post.id}/${commentId}`, {
          user_id: user?.id,
        });
        fetchComments();
      } catch (err) {
        console.error("Error removing dislike:", err);
      }
    } else {
      // Dislike the comment (remove like if any)
      setUserVotes({ ...userVotes, [voteKey]: "dislike" });
      try {
        await axios.post(`http://localhost:5000/dislike-comment/${post.id}/${commentId}`, {
          user_id: user?.id,
          removeLike: currentVote === "like",
        });
        fetchComments();
      } catch (err) {
        console.error("Error disliking comment:", err);
        setUserVotes({ ...userVotes, [voteKey]: currentVote });
      }
    }
  };

  const CommentItem = ({ comment: c, isReply = false, depth = 0 }) => (
    <div
      style={{
        background: isDarkMode
          ? "rgba(0, 212, 255, 0.05)"
          : "rgba(0, 0, 0, 0.05)",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px",
        marginLeft: `${depth * 15}px`,
        border: isDarkMode
          ? "1px solid rgba(0, 212, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          fontWeight: "600",
          color: isDarkMode ? "#00d4ff" : "#0099cc",
          fontSize: "12px",
          marginBottom: "4px",
        }}
      >
        {isReply ? "↳ " : ""}Anonymous
      </div>
      <div
        style={{
          fontSize: "14px",
          marginBottom: "8px",
          lineHeight: "1.4",
        }}
      >
        {c.text}
      </div>
      <div
        style={{
          fontSize: "11px",
          opacity: isDarkMode ? 0.5 : 0.6,
          marginBottom: "8px",
        }}
      >
        {new Date(c.timestamp).toLocaleTimeString()}
      </div>

      {/* Like/Dislike Buttons */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
        <button
          onClick={() => handleLikeComment(c.id, isReply, isReply ? c.parentId : null)}
          style={{
            background: userVotes[`${post.id}-${c.id}`] === "like"
              ? "rgba(255, 0, 110, 0.15)"
              : "none",
            border: userVotes[`${post.id}-${c.id}`] === "like"
              ? "1px solid rgba(255, 0, 110, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            color: userVotes[`${post.id}-${c.id}`] === "like" ? "#ff006e" : "#8892b0",
            padding: "4px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s ease",
            fontWeight: userVotes[`${post.id}-${c.id}`] === "like" ? "600" : "400",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 0, 110, 0.15)";
            e.target.style.borderColor = "rgba(255, 0, 110, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = userVotes[`${post.id}-${c.id}`] === "like"
              ? "rgba(255, 0, 110, 0.15)"
              : "none";
            e.target.style.borderColor = userVotes[`${post.id}-${c.id}`] === "like"
              ? "1px solid rgba(255, 0, 110, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.1)";
          }}
          title={userVotes[`${post.id}-${c.id}`] === "like" ? "Remove like" : "Like"}
        >
          👍 {c.likes || 0}
        </button>

        <button
          onClick={() => handleDislikeComment(c.id, isReply, isReply ? c.parentId : null)}
          style={{
            background: userVotes[`${post.id}-${c.id}`] === "dislike"
              ? "rgba(255, 107, 107, 0.2)"
              : "none",
            border: userVotes[`${post.id}-${c.id}`] === "dislike"
              ? "1px solid rgba(255, 107, 107, 0.8)"
              : "1px solid rgba(255, 107, 107, 0.3)",
            color: "#ff6b6b",
            padding: "4px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s ease",
            fontWeight: userVotes[`${post.id}-${c.id}`] === "dislike" ? "600" : "400",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 107, 107, 0.15)";
            e.target.style.borderColor = "rgba(255, 107, 107, 0.8)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = userVotes[`${post.id}-${c.id}`] === "dislike"
              ? "rgba(255, 107, 107, 0.2)"
              : "none";
            e.target.style.borderColor = userVotes[`${post.id}-${c.id}`] === "dislike"
              ? "1px solid rgba(255, 107, 107, 0.8)"
              : "1px solid rgba(255, 107, 107, 0.3)";
          }}
          title={userVotes[`${post.id}-${c.id}`] === "dislike" ? "Remove dislike" : "Dislike"}
        >
          👎 {c.dislikes || 0}
        </button>

        {!isReply && (
          <button
            onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
            style={{
              background: "none",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              color: "#a855f7",
              padding: "4px 10px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(168, 85, 247, 0.1)";
              e.target.style.borderColor = "rgba(168, 85, 247, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "none";
              e.target.style.borderColor = "rgba(168, 85, 247, 0.3)";
            }}
          >
            💬 Reply
          </button>
        )}
      </div>

      {/* Nested Replies */}
      {c.replies && c.replies.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          {c.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Reply Form */}
      {replyingTo === c.id && (
        <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: isDarkMode ? "1px solid rgba(0, 212, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)" }}>
          <textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={replyLoading}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: isDarkMode
                ? "1px solid rgba(168, 85, 247, 0.2)"
                : "1px solid rgba(0, 0, 0, 0.15)",
              background: isDarkMode
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
              color: isDarkMode ? "#fff" : "#000",
              fontFamily: "inherit",
              fontSize: "12px",
              resize: "vertical",
              minHeight: "35px",
              marginBottom: "8px",
              opacity: replyLoading ? 0.5 : 1,
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleAddReply(c.id)}
              disabled={replyLoading}
              style={{
                flex: 1,
                padding: "6px",
                background: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
                border: "none",
                color: "#fff",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: replyLoading ? "not-allowed" : "pointer",
                fontSize: "12px",
                opacity: replyLoading ? 0.6 : 1,
              }}
            >
              {replyLoading ? "Posting..." : "Post Reply"}
            </button>
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
              style={{
                flex: 1,
                padding: "6px",
                background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                border: "none",
                color: isDarkMode ? "#fff" : "#000",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "slideUp 0.3s ease",
      }}
      onClick={() => setShowComments(false)}
    >
      <div
        style={{
          background: isDarkMode ? "rgba(13,13,35,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderRadius: 20,
          padding: window.innerWidth < 480 ? "16px" : "20px",
          maxWidth: window.innerWidth < 480 ? "95vw" : "480px",
          width: "90%",
          maxHeight: "70vh",
          overflow: "auto",
          border: isDarkMode ? "1px solid rgba(0,212,255,0.18)" : "1px solid rgba(0,0,0,0.1)",
          boxShadow: isDarkMode ? "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,212,255,0.06), 0 0 60px rgba(0,212,255,0.04)" : "0 32px 80px rgba(0,0,0,0.1)",
          color: isDarkMode ? "#ccd6f6" : "#2d3748",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
              background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "18px",
            }}
          >
            💬 Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
          </h3>
          <button
            onClick={() => setShowComments(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: isDarkMode ? "#00d4ff" : "#4a5568",
            }}
          >
            ✕
          </button>
        </div>

        {/* Comments List */}
        <div
          style={{
            maxHeight: "350px",
            overflowY: "auto",
            marginBottom: "20px",
            paddingRight: "8px",
          }}
        >
          {fetchLoading ? (
            <div
              style={{
                textAlign: "center",
                opacity: isDarkMode ? 0.6 : 0.6,
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "10px" }}>⏳</div>
              Loading comments...
            </div>
          ) : comments.length > 0 ? (
            comments.map((c) => <CommentItem key={c.id} comment={c} depth={0} />)
          ) : (
            <div
              style={{
                textAlign: "center",
                opacity: isDarkMode ? 0.6 : 0.6,
                padding: "20px",
              }}
            >
              No comments yet. Be the first! 👇
            </div>
          )}
        </div>

        {/* Add Comment */}
        <div style={{ borderTop: isDarkMode ? "1px solid rgba(0, 212, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)", paddingTop: "16px" }}>
          <textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: isDarkMode
                ? "1px solid rgba(0, 212, 255, 0.2)"
                : "1px solid rgba(0, 0, 0, 0.15)",
              background: isDarkMode
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.02)",
              color: isDarkMode ? "#fff" : "#000",
              fontFamily: "inherit",
              fontSize: "13px",
              resize: "vertical",
              minHeight: "45px",
              marginBottom: "10px",
              opacity: loading ? 0.5 : 1,
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: loading ? 0.6 : 1,
              boxShadow: "0 4px 12px rgba(20, 184, 166, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(20, 184, 166, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(20, 184, 166, 0.3)";
            }}
          >
            {loading ? "Posting..." : "💬 Post Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
