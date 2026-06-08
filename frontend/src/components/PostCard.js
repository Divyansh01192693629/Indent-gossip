import React, { useState, useEffect } from "react";
import axios from "axios";
import CommentModal from "./CommentModal";

const API = process.env.REACT_APP_API_URL || "http://localhost:5005";
const BOT_USER_ID = "00000000-0000-0000-0000-000000000001";
const shortId = (id) => id ? `UID-${id.slice(0, 6).toUpperCase()}` : "Unknown";

function PostCard({ post, fetchPosts, user }) {
  const [liked, setLiked] = useState(post.liked_by?.includes(user?.id));
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [friendStatus, setFriendStatus] = useState(null); // null | 'pending' | 'friends'
  const [friendLoading, setFriendLoading] = useState(false);
  const [authorAvatarStyle, setAuthorAvatarStyle] = useState("avataaars");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Determine the style to use. Since author style isn't saved in the DB natively,
    // we use 'avataaars' as default, but if the author is ME, use my local style.
    if (post.user_id === user.id) {
      setAuthorAvatarStyle(localStorage.getItem("avatarStyle") || "avataaars");
    }
    
    // Listen for global avatar changes if it's my post
    const handleAvatar = () => {
      if (post.user_id === user.id) setAuthorAvatarStyle(localStorage.getItem("avatarStyle") || "avataaars");
    };
    window.addEventListener('avatarChanged', handleAvatar);
    
    checkFriendStatus();
    return () => window.removeEventListener('avatarChanged', handleAvatar);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.user_id, user.id]);

  const checkFriendStatus = async () => {
    if (post.user_id === user.id) return;
    try {
      // Check if friends
      const fRes = await axios.get(`${API}/friends/${user.id}`);
      if (fRes.data.some(f => f.friend_id === post.user_id)) {
        setFriendStatus("friends");
        return;
      }
      // Check pending
      const [inRes, outRes] = await Promise.all([
        axios.get(`${API}/friend-requests/${user.id}`),
        axios.get(`${API}/friend-requests-sent/${user.id}`)
      ]);
      if (inRes.data.some(r => r.from_user_id === post.user_id) || outRes.data.includes(post.user_id)) {
        setFriendStatus("pending");
      }
    } catch {}
  };

  const handleLike = async () => {
    // Optimistic UI updates
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    if (!liked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }

    try {
      await axios.post(`${API}/like-post/${post.id}`, { user_id: user.id });
    } catch (err) {
      // Revert on fail
      setLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Indent Gossip Post",
      text: post.content,
      // If we had individual post routes, we'd share that. For now, share the homepage.
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) { }
    } else {
      // Fallback
      navigator.clipboard.writeText(`Check out this post: ${post.content} on Indent Gossip!`);
      alert("Post details copied to clipboard!");
    }
  };

  const handleAddFriend = async () => {
    if (friendLoading || friendStatus === "pending" || friendStatus === "friends") return;
    setFriendLoading(true);
    try {
      await axios.post(`${API}/friend-request`, { from_user_id: user.id, to_user_id: post.user_id });
      setFriendStatus("pending");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add friend");
    } finally {
      setFriendLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/post/${post.id}`, { data: { user_id: user.id } });
      setShowDeleteConfirm(false);
      fetchPosts();
    } catch (err) {
      alert("Failed to delete post: " + (err.response?.data?.error || err.message));
      setDeleting(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, secs] of Object.entries(intervals)) {
      const i = Math.floor(seconds / secs);
      if (i >= 1) return `${i} ${unit}${i > 1 ? 's' : ''} ago`;
    }
    return "Just now";
  };

  const dicebearUrl = `https://api.dicebear.com/7.x/${authorAvatarStyle}/svg?seed=${post.user_id}&backgroundColor=transparent`;

  return (
    <div style={{
      background: "var(--card-bg)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: 20, padding: 20, marginBottom: 20,
      border: "1px solid var(--border)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      position: "relative", overflow: "hidden",
      transition: "transform 0.1s ease",
    }}
    onMouseMove={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      e.currentTarget.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"; }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={dicebearUrl} alt="author" style={{ width: 44, height: 44, borderRadius: "50%", background: "#1a1a2e", boxShadow: "0 0 0 2px rgba(0,212,255,0.3)" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 800, color: "var(--text)", fontSize: 14 }}>
                {post.user_id === BOT_USER_ID ? "🤖 Indent Bot" : shortId(post.user_id)}
              </span>
              {/* Add friend button inline if not ME and not bot */}
              {post.user_id !== user.id && post.user_id !== BOT_USER_ID && (
                <button
                  onClick={handleAddFriend}
                  disabled={friendLoading || friendStatus === "friends" || friendStatus === "pending"}
                  style={{
                    background: friendStatus === "friends" ? "rgba(0,255,136,0.1)" : friendStatus === "pending" ? "rgba(255,255,255,0.1)" : "rgba(168,85,247,0.15)",
                    border: "none", color: friendStatus === "friends" ? "#00ff88" : friendStatus === "pending" ? "#8892b0" : "#a855f7",
                    borderRadius: 12, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: (friendLoading || friendStatus) ? "default" : "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit"
                  }}
                >
                  {friendStatus === "friends" ? "✓ Friends" : friendStatus === "pending" ? "⏳ Pending" : "+ Add"}
                </button>
              )}
              {post.user_id === BOT_USER_ID && (
                <span style={{ fontSize: 10, color: "#a855f7", background: "rgba(168,85,247,0.1)", padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>BOT</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{timeAgo(post.created_at)}</div>
          </div>
        </div>
        {/* Delete button — only for my own posts */}
        {post.user_id === user.id && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete post"
            style={{
              background: "rgba(255,59,59,0.07)", border: "1px solid rgba(255,59,59,0.15)",
              color: "#ff6b6b", borderRadius: 8, padding: "5px 10px",
              cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,59,59,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,59,59,0.07)"; }}
          >
            🗑️
          </button>
        )}
      </div>

      {/* Content */}
      <p style={{ color: "var(--text)", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px", wordWrap: "break-word" }}>
        {post.content}
      </p>

      {/* Image */}
      {post.image_url && (
        <div style={{ margin: "16px -20px 20px -20px", display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.3)", position: "relative" }}>
          <img
            src={post.image_url.startsWith('/') && !post.image_url.startsWith('//') ? `${process.env.PUBLIC_URL || ''}${post.image_url}` : post.image_url}
            alt="post"
            style={{ width: "100%", maxHeight: 500, objectFit: "contain", display: "block" }}
            onDoubleClick={handleLike}
          />
          {showHeart && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 80, animation: "popBounce 0.8s ease forwards", pointerEvents: "none", filter: "drop-shadow(0 0 30px rgba(255,0,110,0.5))" }}>
              ♥️
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
        <button
          onClick={handleLike}
          style={{ display: "flex", alignItems: "center", gap: 6, background: liked ? "rgba(255,0,110,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid " + (liked ? "rgba(255,0,110,0.3)" : "rgba(255,255,255,0.1)"), color: liked ? "#ff006e" : "#8892b0", padding: "8px 16px", borderRadius: 14, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s" }}
        >
          {liked ? "♥️" : "♡"} {likeCount}
        </button>
        <button
          onClick={() => setShowComments(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#8892b0", padding: "8px 16px", borderRadius: 14, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s" }}
        >
          💬 {post.comments?.length || 0}
        </button>
        <button
          onClick={handleShare}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", padding: "8px 16px", borderRadius: 14, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s" }}
        >
          ↗ Share
        </button>
      </div>

      {showComments && <CommentModal post={post} setShowComments={setShowComments} fetchPosts={fetchPosts} user={user} />}

      {/* Delete Post Confirm Modal */}
      {showDeleteConfirm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20 }}
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            style={{ background: "rgba(13,13,35,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,59,59,0.2)", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 340, position: "relative", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #ff6b6b, #ff006e)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: "#ccd6f6", marginBottom: 8 }}>Delete Post?</div>
            <div style={{ fontSize: 13, color: "#6272a4", marginBottom: 20, lineHeight: 1.6 }}>This will permanently remove this post. This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#6272a4", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10, border: "none",
                  background: deleting ? "rgba(255,59,59,0.3)" : "linear-gradient(135deg, #ff6b6b, #ff006e)",
                  color: "#fff", cursor: deleting ? "not-allowed" : "pointer",
                  fontWeight: 700, fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {deleting ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Deleting...</> : "🗑️ Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
