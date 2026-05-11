import React, { useState, useEffect } from "react";

const AVATAR_STYLES = [
  "avataaars", "bottts", "lorelei", "micah", "miniavs", "peeps", "fun-emoji",
  "icons", "initials", "pixel-art", "avataaars-neutral", "notionists",
  "dylan", "shapes", "rings", "croodles", "croodles-neutral", "thumbs",
  "personas", "big-smile", "open-peeps", "adventurer", "big-ears", "bottts-neutral"
];

function Profile({ user, setShowProfile }) {
  const [selectedStyle, setSelectedStyle] = useState(
    localStorage.getItem("avatarStyle") || "avataaars"
  );
  
  useEffect(() => {
    localStorage.setItem("avatarStyle", selectedStyle);
    // Dispatch a custom event so other components (PostCard, Navbar) can instantly update
    window.dispatchEvent(new Event('avatarChanged'));
  }, [selectedStyle]);

  const dicebearUrl = (style) => `https://api.dicebear.com/7.x/${style}/svg?seed=${user.id}&backgroundColor=transparent`;

  const infoRows = [
    { label: "Email",          value: user.email,                          icon: "📧" },
    { label: "User ID",        value: user.id,                             icon: "🆔" },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 2000, padding: 20,
        animation: "slideUp 0.3s ease",
      }}
      onClick={() => setShowProfile(false)}
    >
      <div
        style={{
          width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
          background: "rgba(13,13,35,0.96)",
          backdropFilter: "blur(30px)",
          borderRadius: 24, padding: "36px 32px",
          border: "1px solid rgba(0,212,255,0.2)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,212,255,0.06), 0 0 60px rgba(0,212,255,0.05)",
          position: "relative",
          display: "flex", flexDirection: "column", gap: 24
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow & border */}
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 220, height: 140, background: "radial-gradient(ellipse, rgba(0,212,255,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #00d4ff, #a855f7, #ff006e)", borderRadius: "24px 24px 0 0" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, margin: "0 0 6px",
              background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
              backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              👤 My Profile
            </h2>
            <p style={{ margin: 0, color: "#6272a4", fontSize: 13 }}>Customize your anonymous identity</p>
          </div>
          <button
            onClick={() => setShowProfile(false)}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#8892b0",
              cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,107,107,0.15)"; e.currentTarget.style.color = "#ff6b6b"; e.currentTarget.style.borderColor = "rgba(255,107,107,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8892b0"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Left panel - Info & Stats */}
          <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Current Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <img src={dicebearUrl(selectedStyle)} alt="Current Avatar" style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "linear-gradient(135deg, #1a1a2e, #0f0c29)",
                boxShadow: "0 0 0 4px rgba(0,0,0,0.5), 0 0 30px rgba(0,212,255,0.3)",
                border: "2px solid rgba(0,212,255,0.3)",
                marginBottom: 12
              }} />
              <div style={{ fontSize: 11, color: "#00d4ff", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Current Avatar Theme</div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{selectedStyle}</div>
            </div>

            {/* Info rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {infoRows.map((row, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 12,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{row.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#00d4ff", letterSpacing: "1px", textTransform: "uppercase" }}>{row.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8892b0", wordBreak: "break-all", paddingLeft: 20 }}>{row.value}</div>
                </div>
              ))}
            </div>

            {/* Privacy notice */}
            <div style={{
              padding: "12px 14px", borderRadius: 10,
              background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.12)",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <p style={{ margin: 0, fontSize: 11, color: "#6272a4", lineHeight: 1.4 }}>
                Your identity is completely anonymous. The seeds are tied to UID but cannot be reversed.
              </p>
            </div>
          </div>

          {/* Right panel - Avatar style grid */}
          <div style={{ flex: "2 1 300px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: 14, color: "#fff", margin: "0 0 12px 0", fontWeight: 700 }}>Choose your style</h3>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 12,
              maxHeight: 400, overflowY: "auto", paddingRight: 8,
              paddingBottom: 10, scrollbarWidth: "thin", scrollbarColor: "#a855f7 transparent"
            }}>
              {AVATAR_STYLES.map((style) => (
                <div
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  title={style}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer",
                    padding: 8, borderRadius: 12, transition: "all 0.2s",
                    background: selectedStyle === style ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedStyle === style ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.05)"}`,
                    boxShadow: selectedStyle === style ? "0 4px 14px rgba(168,85,247,0.2)" : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedStyle !== style) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedStyle !== style) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <img src={dicebearUrl(style)} alt={style} style={{ width: 48, height: 48, background: "#1a1a2e", borderRadius: "50%", marginBottom: 6 }} />
                  <span style={{ fontSize: 9, color: selectedStyle === style ? "#fff" : "#6272a4", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {style.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
