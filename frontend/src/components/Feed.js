import React, { useEffect, useState, useCallback } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import Navbar from "./Navbar";
import Profile from "./Profile";
import axios from "axios";
import "./Feed.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Feed({ user, setUser, setCurrentPage }) {
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/posts?user_id=${user.id}`);
      setPosts(data);
    } catch (err) {
      console.log(err);
    } finally {
      setPostsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await axios.get(`${API}/search?q=${searchQuery}`);
        setSearchResults(data);
      } catch (err) {
        console.log("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <Navbar
        setUser={setUser}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        user={user}
        setCurrentPage={setCurrentPage}
        setShowProfile={setShowProfile}
        onSearch={setSearchQuery}
      />

      <div className="feed-layout">
        {/* Left Sidebar */}
        <div className={`feed-column-left ${leftCollapsed ? "collapsed" : ""}`}>
          <div className="glass-panel" style={{ padding: 12 }}>
            <div className="panel-header" style={{ padding: "8px 12px", marginBottom: 8 }}>
              <h3 className="panel-title">Navigation</h3>
              <button className="close-panel-btn" onClick={() => setLeftCollapsed(true)} title="Close Panel">✕</button>
            </div>
            
            <button className="nav-menu-item active">🏠 Feed</button>
            <button className="nav-menu-item">🌍 Explore</button>
            <button className="nav-menu-item">🔔 Notifications</button>
            <button className="nav-menu-item">🔖 Bookmarks</button>
            <button className="nav-menu-item" onClick={() => setCurrentPage("chat")}>💬 Chat</button>
          </div>
        </div>

        {/* Center Feed */}
        <div className="feed-column-center">
          {/* Main Feed Layout */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Inline Create Post toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, margin: 0, color: "var(--text)" }}>Feed</h2>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            style={{
              background: showCreatePost ? "var(--accent-red-bg)" : "var(--accent-bg)",
              color: showCreatePost ? "var(--accent-red)" : "var(--accent)", border: "none",
              borderRadius: 12, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14, transition: "all 0.2s"
            }}
          >
            {showCreatePost ? "✕ Cancel" : "+ New Post"}
          </button>
        </div>

        {/* Expandable Create Post */}
        <div style={{
          overflow: "hidden", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          maxHeight: showCreatePost ? 500 : 0, opacity: showCreatePost ? 1 : 0
        }}>
          <CreatePost fetchPosts={fetchPosts} user={user} />
        </div>

        {/* Feed Posts */}
        {searchQuery.trim() ? (
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, color: "var(--text)", marginBottom: 16 }}>Search Results</h3>
            {isSearching ? (
              <div style={{ color: "var(--text-muted)", fontSize: 15 }}>Searching...</div>
            ) : (
              <>
                {searchResults?.users?.length > 0 && (
                  <div style={{ marginBottom: 24, padding: "16px 20px", background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)" }}>
                    <h4 style={{ margin: "0 0 12px", color: "var(--text)" }}>Users</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {searchResults.users.map(u => (
                         <div key={u.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: "var(--border-light)", borderRadius: 12 }}>
                           <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}&backgroundColor=transparent`} alt="avatar" style={{width: 32, height: 32, borderRadius: "50%", background: "#1a1a2e"}}/>
                           <span style={{ color: "var(--text)", fontWeight: 600 }}>{u.username}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults?.posts?.length > 0 ? (
                  searchResults.posts.map(post => <PostCard key={post.id} post={post} fetchPosts={fetchPosts} user={user} />)
                ) : (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No posts found for "{searchQuery}"</div>
                )}
              </>
            )}
          </div>
        ) : postsLoading ? (
          <div> {/* Skeleton loaders */}
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ background: "var(--card-bg)", backdropFilter: "blur(20px)", borderRadius: 20, padding: 20, marginBottom: 20, border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", animation: "pulse 2s infinite" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--border)" }}></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                    <div style={{ width: 120, height: 12, borderRadius: 6, background: "var(--border)" }}></div>
                    <div style={{ width: 80, height: 10, borderRadius: 5, background: "var(--border)" }}></div>
                  </div>
                </div>
                <div style={{ width: "100%", height: 14, borderRadius: 7, background: "var(--border)", marginBottom: 12 }}></div>
                <div style={{ width: "80%", height: 14, borderRadius: 7, background: "var(--border)", marginBottom: 16 }}></div>
                <div style={{ height: 160, borderRadius: 12, background: "var(--border)" }}></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: "var(--card-bg)", backdropFilter: "blur(20px)", borderRadius: 20, padding: 40, textAlign: "center", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: 60, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(0,212,255,0.4))" }}>📭</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>It's quiet here...</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 15 }}>Be the first to share something with the world.</p>
            <button onClick={() => setShowCreatePost(true)} style={{ background: "linear-gradient(135deg, #00d4ff, #a855f7)", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,212,255,0.3)" }}>
              Create a Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} fetchPosts={fetchPosts} user={user} />
          ))
        )}

          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`feed-column-right ${rightCollapsed ? "collapsed" : ""}`}>
          
          <div className="glass-panel" style={{ marginBottom: 20, padding: 16 }}>
            <div className="panel-header" style={{ marginBottom: 12 }}>
              <h3 className="panel-title">Indent Bot</h3>
              <button className="close-panel-btn" onClick={() => setRightCollapsed(true)} title="Close Panel">✕</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
              No friends online? Talk to our friendly AI bot anytime you want!
            </div>
            <button 
              onClick={() => setCurrentPage("chat")}
              style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #00d4ff, #a855f7)", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,212,255,0.3)" }}
            >
              🤖 Chat with Bot
            </button>
          </div>

          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="panel-header" style={{ marginBottom: 12 }}>
              <h3 className="panel-title">Trending Topics</h3>
            </div>
            {[
              { tag: "#tech", posts: "1.2k posts" },
              { tag: "#gossip", posts: "856 posts" },
              { tag: "#confessions", posts: "432 posts" }
            ].map((topic) => (
              <div key={topic.tag} className="topic-widget">
                <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{topic.tag}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>{topic.posts}</div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Slide-in Hamburger Menu Menu (All screens use this now) */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: showMobileMenu ? "auto" : "none", zIndex: 900
      }}>
        {/* Backdrop */}
        <div 
          onClick={() => setShowMobileMenu(false)}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", opacity: showMobileMenu ? 1 : 0, transition: "opacity 0.3s" }} 
        />
        {/* Drawer */}
        <div style={{
          position: "absolute", top: 72, right: 0, bottom: 0, width: 280, maxWidth: "80vw",
          background: "var(--card-bg)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
          borderLeft: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 32,
          transform: showMobileMenu ? "translateX(0)" : "translateX(100%)", transition: "transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
          boxShadow: showMobileMenu ? "-10px 0 30px rgba(0,0,0,0.5)" : "none", overflowY: "auto"
        }}>
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Menu</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Feed", "Explore", "Notifications", "Bookmarks", "Chat"].map((item, i) => (
                <div key={item} 
                  onClick={() => { if(item === "Chat") setCurrentPage("chat"); }}
                  style={{
                  padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                  background: i === 0 ? "var(--accent-bg)" : "transparent",
                  color: i === 0 ? "var(--accent)" : "var(--text-muted)", fontWeight: 600, transition: "all 0.2s"
                }}>{item}</div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Trending Topics</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { tag: "#tech", posts: "1.2k posts" },
                { tag: "#gossip", posts: "856 posts" },
                { tag: "#confessions", posts: "432 posts" }
              ].map((topic) => (
                <div key={topic.tag} style={{ padding: "10px 14px", borderRadius: 12, background: "var(--border-light)", border: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{topic.tag}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>{topic.posts}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {showProfile && <Profile user={user} setShowProfile={setShowProfile} />}
    </div>
  );
}

export default Feed;
