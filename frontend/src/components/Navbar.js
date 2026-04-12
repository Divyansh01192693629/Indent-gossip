import React, { useContext } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../context/ThemeContext";

function Navbar({ setUser, search, setSearch, setShowCreate, setShowMobileMenu, showMobileMenu }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: window.innerWidth < 480 ? "10px 12px" : "12px 30px",
        backdropFilter: "blur(15px)",
        background: isDarkMode
          ? "linear-gradient(180deg, rgba(15,15,30,0.95) 0%, rgba(26,26,46,0.9) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: isDarkMode
          ? "1px solid rgba(0,212,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
        boxShadow: isDarkMode
          ? "0 4px 20px rgba(0,0,0,0.3)"
          : "0 4px 20px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        flexWrap: window.innerWidth < 768 ? "wrap" : "nowrap",
        gap: window.innerWidth < 480 ? "8px" : "20px",
      }}
    >
      {/* LOGO */}
      <h2
        style={{
          margin: 0,
          fontSize: window.innerWidth < 480 ? "18px" : "24px",
          fontWeight: "700",
          background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "1px",
          minWidth: "auto",
        }}
      >
        🔥 Gossip
      </h2>

      {/* SEARCH - Hide on mobile */}
      {window.innerWidth > 480 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search posts..."
          style={{
            padding: "10px 18px",
            borderRadius: "25px",
            border: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.2)"
              : "1px solid rgba(0, 0, 0, 0.1)",
            outline: "none",
            background: isDarkMode
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
            color: isDarkMode ? "white" : "#000",
            width: window.innerWidth < 768 ? "150px" : "300px",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = isDarkMode
              ? "rgba(0, 212, 255, 0.5)"
              : "rgba(0, 0, 0, 0.3)";
            e.target.style.background = isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)";
            e.target.style.boxShadow = isDarkMode
              ? "0 4px 15px rgba(0, 212, 255, 0.15)"
              : "0 4px 15px rgba(0, 0, 0, 0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isDarkMode
              ? "rgba(0, 212, 255, 0.2)"
              : "rgba(0, 0, 0, 0.1)";
            e.target.style.background = isDarkMode
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)";
            e.target.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
          }}
        />
      )}

      {/* ICONS */}
      <div style={{ display: "flex", gap: window.innerWidth < 480 ? "8px" : "20px", alignItems: "center" }}>
        {/* Hamburger Menu - Mobile Only */}
        {window.innerWidth < 768 && (
          <div
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            title="Menu"
            style={{
              fontSize: "24px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDarkMode
                ? "rgba(0, 212, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
            }}
          >
            ☰
          </div>
        )}

        <div
          title="Home"
          style={{
            fontSize: "22px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = isDarkMode
              ? "rgba(0, 212, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.transform = "scale(1)";
          }}
        >
          🏠
        </div>

        <div
          onClick={() => setShowCreate(true)}
          style={{
            fontSize: "24px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(0, 255, 136, 0.1)";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.transform = "scale(1)";
          }}
        >
          ✏️
        </div>

        <div
          title="Notifications"
          style={{
            fontSize: "22px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = isDarkMode
              ? "rgba(0, 212, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.transform = "scale(1)";
          }}
        >
          🔔
        </div>

        <button
          onClick={toggleTheme}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            border: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.3)"
              : "1px solid rgba(0, 0, 0, 0.2)",
            background: isDarkMode
              ? "rgba(0, 212, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
            color: isDarkMode ? "#00d4ff" : "#000",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = isDarkMode
              ? "rgba(0, 212, 255, 0.2)"
              : "rgba(0, 0, 0, 0.2)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isDarkMode
              ? "rgba(0, 212, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)";
            e.target.style.transform = "scale(1)";
          }}
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 18px",
            borderRadius: "20px",
            border: "none",
            background: "linear-gradient(135deg, #ff006e 0%, #fb5607 100%)",
            color: "white",
            cursor: "pointer",
            font: "inherit",
            fontWeight: "600",
            fontSize: "13px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(255, 0, 110, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(255, 0, 110, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(255, 0, 110, 0.3)";
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
