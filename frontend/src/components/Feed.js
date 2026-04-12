import React, { useEffect, useState, useContext } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import Navbar from "./Navbar";
import Profile from "./Profile";
import { ThemeContext } from "../context/ThemeContext";
import "../App.css";

function Feed({ user, setUser }) {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);

  const fetchPosts = () => {
    fetch(`http://localhost:5000/posts?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => setPosts(data));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    let searchText = search.toLowerCase().trim();

    if (searchText.startsWith("uid-")) {
      searchText = searchText.replace("uid-", "");
    }

    searchText = searchText.replace(/^0+/, "");

    return (
      post.content?.toLowerCase().includes(searchText) ||
      String(post.uid) === searchText
    );
  });

  const menuItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "trending", label: "Trending", icon: "🔥" },
    { id: "saved", label: "Saved", icon: "💾" },
  ];

  const trendingTopics = [
    { tag: "#college", posts: 1250 },
    { tag: "#fun", posts: 892 },
    { tag: "#confession", posts: 2341 },
    { tag: "#relationship", posts: 1876 },
    { tag: "#anonymous", posts: 3245 },
  ];

  const sidebarStyle = {
    width: "220px",
    position: "sticky",
    top: "80px",
    height: "fit-content",
  };

  const menuItemStyle = (isActive) => ({
    padding: "14px 16px",
    margin: "8px 0",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    background: isActive
      ? isDarkMode
        ? "rgba(0, 212, 255, 0.15)"
        : "rgba(0, 212, 255, 0.1)"
      : "transparent",
    color: isActive
      ? isDarkMode
        ? "#00d4ff"
        : "#0099cc"
      : isDarkMode
        ? "#b8b8d1"
        : "#666",
    borderLeft: isActive
      ? `4px solid ${isDarkMode ? "#00d4ff" : "#0099cc"}`
      : "4px solid transparent",
  });

  return (
    <>
      <Navbar
        setUser={setUser}
        search={search}
        setSearch={setSearch}
        setShowCreate={setShowCreate}
        setShowMobileMenu={setShowMobileMenu}
        showMobileMenu={showMobileMenu}
      />
      {showCreate && <CreatePost fetchPosts={fetchPosts} user={user} />}
      {showProfile && <Profile user={user} setShowProfile={setShowProfile} />}

      <div className="main-container">
        {/* MOBILE MENU DRAWER */}
        {window.innerWidth < 768 && showMobileMenu && (
          <div
            style={{
              position: "fixed",
              top: "70px",
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkMode
                ? "linear-gradient(135deg, rgba(15,15,30,0.98) 0%, rgba(26,26,46,0.98) 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,245,245,0.98) 100%)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              padding: "20px",
              overflowY: "auto",
              borderRight: isDarkMode ? "1px solid rgba(0,212,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
            }}
            onClick={() => setShowMobileMenu(false)}
          >
            {/* Menu Items */}
            <h4 style={{ marginTop: 0, marginBottom: "16px", color: isDarkMode ? "#00d4ff" : "#0099cc" }}>
              ✨ Menu
            </h4>
            {menuItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 16px",
                  margin: "8px 0",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "15px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  background: activeMenu === item.id
                    ? isDarkMode
                      ? "rgba(0, 212, 255, 0.15)"
                      : "rgba(0, 212, 255, 0.1)"
                    : "transparent",
                  color: activeMenu === item.id
                    ? isDarkMode
                      ? "#00d4ff"
                      : "#0099cc"
                    : isDarkMode
                      ? "#b8b8d1"
                      : "#666",
                  borderLeft: activeMenu === item.id
                    ? `4px solid ${isDarkMode ? "#00d4ff" : "#0099cc"}`
                    : "4px solid transparent",
                }}
                onClick={() => {
                  setActiveMenu(item.id);
                  setShowMobileMenu(false);
                }}
              >
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}

            {/* Profile */}
            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: isDarkMode ? "1px solid rgba(0,212,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: isDarkMode
                    ? "rgba(0, 212, 255, 0.1)"
                    : "rgba(0, 212, 255, 0.08)",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowProfile(true);
                  setShowMobileMenu(false);
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>👤</div>
                <div style={{ fontSize: "13px", fontWeight: "600" }}>My Profile</div>
              </div>
            </div>

            {/* Trending */}
            <h4 style={{ marginTop: "24px", marginBottom: "12px", color: "#ff006e" }}>🔥 Trending</h4>
            {trendingTopics.map((topic, i) => (
              <div
                key={i}
                onClick={() => {
                  setSearch(topic.tag);
                  setShowMobileMenu(false);
                }}
                style={{
                  padding: "12px 15px",
                  margin: "8px 0",
                  background: isDarkMode
                    ? "rgba(255, 0, 110, 0.05)"
                    : "rgba(255, 0, 110, 0.08)",
                  border: isDarkMode
                    ? "1px solid rgba(255, 0, 110, 0.15)"
                    : "1px solid rgba(255, 0, 110, 0.2)",
                  borderLeft: `4px solid #ff006e`,
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: "600", color: "#ff006e", fontSize: "14px" }}>{topic.tag}</div>
                <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "4px" }}>{topic.posts} posts</div>
              </div>
            ))}
          </div>
        )}

        {/* LEFT SIDEBAR - Hide on mobile */}
        {window.innerWidth >= 768 && (
          <div style={sidebarStyle}>
          <h4
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ✨ Menu
          </h4>

          {menuItems.map((item) => (
            <div
              key={item.id}
              style={menuItemStyle(activeMenu === item.id)}
              onClick={() => setActiveMenu(item.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? "rgba(0, 212, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = activeMenu === item.id
                  ? isDarkMode
                    ? "rgba(0, 212, 255, 0.15)"
                    : "rgba(0, 212, 255, 0.1)"
                  : "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <div
            style={{
              marginTop: "24px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: isDarkMode
                ? "rgba(0, 212, 255, 0.1)"
                : "rgba(0, 212, 255, 0.08)",
              border: isDarkMode
                ? "1px solid rgba(0, 212, 255, 0.2)"
                : "1px solid rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setShowProfile(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode
                ? "rgba(0, 212, 255, 0.2)"
                : "rgba(0, 212, 255, 0.15)";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode
                ? "rgba(0, 212, 255, 0.1)"
                : "rgba(0, 212, 255, 0.08)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>👤</div>
            <div style={{ fontSize: "13px", fontWeight: "600" }}>My Profile</div>
          </div>
        </div>
        )}

        {/* FEED */}
        <div className="feed">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  fetchPosts={fetchPosts}
                  user={user}
                />
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: isDarkMode ? "#888" : "#999",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>
                  {search ? "No posts found" : "No posts yet"}
                </div>
                <div style={{ fontSize: "14px", marginTop: "8px" }}>
                  {search
                    ? "Try a different search"
                    : "Be the first to share a confession!"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR - Hide on mobile */}
        {window.innerWidth >= 768 && (
          <div style={sidebarStyle}>
          <h4
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #ff006e 0%, #fb5607 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🔥 Trending
          </h4>

          {trendingTopics.map((topic, i) => (
            <div
              key={i}
              onClick={() => setSearch(topic.tag)}
              style={{
                padding: "12px 15px",
                margin: "10px 0",
                background: isDarkMode
                  ? "rgba(255, 0, 110, 0.05)"
                  : "rgba(255, 0, 110, 0.08)",
                border: isDarkMode
                  ? "1px solid rgba(255, 0, 110, 0.15)"
                  : "1px solid rgba(255, 0, 110, 0.2)",
                borderLeft: `4px solid ${isDarkMode ? "#ff006e" : "#ff006e"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? "rgba(255, 0, 110, 0.1)"
                  : "rgba(255, 0, 110, 0.15)";
                e.currentTarget.style.transform = "translateX(3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? "rgba(255, 0, 110, 0.05)"
                  : "rgba(255, 0, 110, 0.08)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: isDarkMode ? "#ff006e" : "#ff006e",
                  fontSize: "14px",
                }}
              >
                {topic.tag}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: isDarkMode ? 0.6 : 0.6,
                  marginTop: "4px",
                }}
              >
                {topic.posts} posts
              </div>
            </div>
          ))}

          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginTop: "24px",
              marginBottom: "12px",
              color: isDarkMode ? "#00d4ff" : "#0099cc",
            }}
          >
            💡 Tips
          </h4>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: isDarkMode
                ? "rgba(0, 212, 255, 0.05)"
                : "rgba(0, 0, 0, 0.05)",
              fontSize: "13px",
              lineHeight: "1.6",
              color: isDarkMode ? "#d0d0d0" : "#666",
            }}
          >
            ❤️ <strong>Double tap</strong> to like posts
            <br />
            💬 <strong>Comment</strong> on confessions
            <br />
            🔍 <strong>Search</strong> by UID or keywords
          </div>
        </div>
        )}
      </div>
    </>
  );
}

export default Feed;
