import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import FriendRequests from "./FriendRequests";

const API = process.env.REACT_APP_API_URL || "http://localhost:5005";
const shortId = (id) => id ? `UID-${id.slice(0, 6).toUpperCase()}` : "Unknown";

function Navbar({ setUser, showMobileMenu, setShowMobileMenu, user, setCurrentPage, setShowProfile, onSearch }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [showRequests, setShowRequests] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [myAvatarStyle, setMyAvatarStyle] = useState(localStorage.getItem("avatarStyle") || "avataaars");

  useEffect(() => {
    const handleAvatarChange = () => setMyAvatarStyle(localStorage.getItem("avatarStyle") || "avataaars");
    window.addEventListener('avatarChanged', handleAvatarChange);
    return () => window.removeEventListener('avatarChanged', handleAvatarChange);
  }, []);

  const dicebearUrl = `https://api.dicebear.com/7.x/${myAvatarStyle}/svg?seed=${user?.id}&backgroundColor=transparent`;

  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
      try {
        const [reqs, msgs] = await Promise.all([
          axios.get(`${API}/friend-requests/${user.id}`),
          axios.get(`${API}/messages/unread/${user.id}`)
        ]);
        setPendingRequestsCount(reqs.data.length || 0);
        setUnreadMsgCount(msgs.data.count || 0);
      } catch (err) {}
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    // simulate tiny delay for UX
    await new Promise(r => setTimeout(r, 600));
    setUser(null);
    setCurrentPage("landing");
  };

  const navBtnBase = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#ccd6f6", width: 44, height: 44, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    fontSize: 18, transition: "all 0.2s", position: "relative", fontFamily: "inherit"
  };

  const badgeStyle = {
    position: "absolute", top: -4, right: -4, background: "#ff006e", color: "#fff",
    fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #1a1a2e"
  };

  // responsive class for profile/theme based on screen size, wait since we can't reliably use native inline media query, we will add className properties, but I'll make sure theme toggle is always flex
  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        height: 72,
        background: "rgba(13,13,35,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,212,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
      }}>
        {/* Left: Logo */}
        <div 
          onClick={() => setCurrentPage("feed")}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, #00d4ff, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#fff", boxShadow: "0 0 20px rgba(0,212,255,0.4)"
          }}>
            #
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #fff 0%, #a855f7 100%)",
            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Indent.
          </h1>
        </div>

        {/* Middle: Search */}
        {onSearch && (
          <div style={{ flex: 1, padding: "0 20px", maxWidth: 400 }}>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => onSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 16px 10px 40px", borderRadius: 20,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", outline: "none", fontSize: 14, transition: "all 0.2s"
                }}
                onFocus={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)" }}
                onBlur={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
              />
              <span style={{ position: "absolute", left: 14, top: 10, filter: "grayscale(1) opacity(0.5)" }}>🔍</span>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar / Profile trigger -> moved from feed */}
          <button 
            onClick={() => { if(setShowProfile) setShowProfile(true); }}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 6px", 
              background: "rgba(0,212,255,0.1)", borderRadius: 24, border: "1px solid rgba(0,212,255,0.3)", 
              marginRight: 8, cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; }}
            title="My Profile"
          >
            <img src={dicebearUrl} alt="Me" style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a1a2e" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#ccd6f6" }}>Profile</span>
          </button>

          <button
            onClick={() => setCurrentPage("chat")}
            title="Messages"
            style={navBtnBase}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(168,85,247,0.15)";e.currentTarget.style.borderColor="rgba(168,85,247,0.4)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}
          >
            💬
            {unreadMsgCount > 0 && <div style={badgeStyle}>{unreadMsgCount > 9 ? "9+" : unreadMsgCount}</div>}
          </button>

          <button
            onClick={() => setShowRequests(true)}
            title="Friend Requests"
            style={navBtnBase}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,212,255,0.15)";e.currentTarget.style.borderColor="rgba(0,212,255,0.4)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}
          >
            🔔
            {pendingRequestsCount > 0 && <div style={badgeStyle}>{pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}</div>}
          </button>

          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            style={{...navBtnBase, display: "flex"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)"}}
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            style={{
              background: logoutLoading ? "rgba(255,107,107,0.1)" : "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b",
              padding: "0 18px", height: 44, borderRadius: 14, cursor: logoutLoading ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", fontFamily: "inherit"
            }}
            onMouseEnter={(e) => { if(!logoutLoading) { e.currentTarget.style.background = "rgba(255,107,107,0.2)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,107,107,0.2)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,107,107,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {logoutLoading ? <><div className="spinner" style={{width: 14, height: 14, borderWidth: 2, borderColor: "rgba(255,107,107,0.2)", borderTopColor: "#ff6b6b"}}></div> Out</> : "Log Out"}
          </button>

          {/* Hamburger (only for mobile/tablet menus now, styled responsive via custom css if needed, but we keep it here for existing prop) */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              ...navBtnBase, 
              background: showMobileMenu ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.05)",
              borderColor: showMobileMenu ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.1)",
            }}
            className="mobile-hamburger-btn"
          >
            ☰
          </button>
        </div>
      </nav>

      <style>{`
        @media (min-width: 900px) {
          .mobile-hamburger-btn { display: none !important; }
        }
      `}</style>

      {showRequests && <FriendRequests user={user} onClose={() => setShowRequests(false)} />}
    </>
  );
}

export default Navbar;
