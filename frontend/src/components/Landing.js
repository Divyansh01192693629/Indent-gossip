import React, { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "../App.css";

function Landing({ setCurrentPage }) {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);
  const heroRef = useRef(null);

  // Parallax tilt on hero card
  useEffect(() => {
    const card = heroRef.current;
    if (!card) return;
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateZ(20px)`;
    };
    const handleLeave = () => {
      card.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    };
    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const features = [
    { icon: "🎭", text: "Complete anonymity — no profiles, no identity" },
    { icon: "💬", text: "Real connections through genuine confessions" },
    { icon: "🛡️", text: "Safe space — hate speech not tolerated" },
    { icon: "❤️", text: "Like, comment & reply on confessions" },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Animated orbs */}
      <div style={{
        position: "fixed", top: "10%", left: "5%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
        borderRadius: "50%", animation: "floatCard 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "15%", right: "5%", width: 300, height: 300,
        background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
        borderRadius: "50%", animation: "floatCard 10s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", top: "50%", right: "20%", width: 200, height: 200,
        background: "radial-gradient(circle, rgba(255,0,110,0.05) 0%, transparent 70%)",
        borderRadius: "50%", animation: "floatCard 12s ease-in-out infinite", pointerEvents: "none", zIndex: 0,
      }} />

      {/* NAVBAR */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 48px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(6, 6, 18, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0, 212, 255, 0.08)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 24, fontWeight: 800,
          background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 60%, #ff006e 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: "-0.5px",
        }}>
          🔥 Indent Gossip
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(0,212,255,0.2)",
              background: "rgba(0,212,255,0.06)", color: "#00d4ff", fontSize: 13, cursor: "pointer",
              fontWeight: 600, transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,212,255,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,212,255,0.06)"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setCurrentPage("login")}
            style={{
              padding: "9px 22px", borderRadius: 20, border: "1px solid rgba(0,212,255,0.3)",
              background: "transparent", color: "#00d4ff", fontSize: 13, cursor: "pointer",
              fontWeight: 600, transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Login
          </button>
          <button
            onClick={() => setCurrentPage("signup")}
            style={{
              padding: "9px 22px", borderRadius: 20, border: "none",
              background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
              color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 700,
              boxShadow: "0 4px 20px rgba(0,212,255,0.35)", transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,212,255,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,255,0.35)"; }}
          >
            🚀 Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 80, padding: "80px 60px", maxWidth: 1300, margin: "0 auto",
        minHeight: "calc(100vh - 80px)",
        flexWrap: "wrap",
      }}>
        {/* LEFT */}
        <div style={{ flex: "1 1 480px", animation: "slideUp 0.8s ease" }}>
          <div style={{
            display: "inline-block", padding: "6px 16px", borderRadius: 20,
            background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
            color: "#00d4ff", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px",
            textTransform: "uppercase", marginBottom: 24,
          }}>
            🔒 100% Anonymous Platform
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(40px, 5vw, 68px)",
            fontWeight: 800, lineHeight: 1.1, marginBottom: 24,
            background: "linear-gradient(135deg, #ffffff 0%, #8892b0 100%)",
            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Share Secrets.<br />
            <span style={{
              background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 60%, #ff006e 100%)",
              backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Stay Anonymous.
            </span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.8, color: "#8892b0", marginBottom: 40, maxWidth: 500 }}>
            Indent Gossip is your safe space to share confessions and secrets without revealing who you are. Join thousands living their truth.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 18px", borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.25s ease",
                animation: `slideUp ${0.8 + i * 0.1}s ease`,
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,212,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)";
                  e.currentTarget.style.transform = "translateX(6px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: "#ccd6f6", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={() => setCurrentPage("signup")}
              style={{
                padding: "14px 36px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                boxShadow: "0 6px 24px rgba(0,212,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,212,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,212,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
            >
              🚀 Join for Free
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 32, marginTop: 52,
            paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {[
              { n: "2.3K", l: "Active Users" },
              { n: "12K", l: "Confessions" },
              { n: "48K", l: "Reactions" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 28, fontWeight: 800,
                  background: "linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)",
                  backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  marginBottom: 4,
                }}>{s.n}</div>
                <div style={{ fontSize: 12, color: "#6272a4", fontWeight: 500, letterSpacing: "0.5px" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — 3D Hero Card */}
        <div style={{
          flex: "0 0 380px", display: "flex", justifyContent: "center", alignItems: "center",
          perspective: "1200px",
        }}>
          <div
            ref={heroRef}
            style={{
              width: 340, background: "rgba(13,13,35,0.9)",
              backdropFilter: "blur(30px)", border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 24,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.1), 0 0 60px rgba(0,212,255,0.05)",
              padding: "32px 28px",
              transition: "transform 0.1s ease",
              cursor: "default",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow top */}
            <div style={{
              position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
              width: 200, height: 120,
              background: "radial-gradient(ellipse, rgba(0,212,255,0.3) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Mock post 1 */}
            <div style={{
              background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)",
              borderRadius: 12, padding: "16px", marginBottom: 16, position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>😊</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#00d4ff" }}>UID-00042</div>
                  <div style={{ fontSize: 10, color: "#6272a4" }}>2 minutes ago</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#ccd6f6", lineHeight: 1.6, margin: 0 }}>
                I told my crush I liked them and they said they had feelings for me too… but now it's awkward 😅
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "#ff006e" }}>❤️ 128</span>
                <span style={{ fontSize: 12, color: "#00d4ff" }}>💬 34</span>
              </div>
            </div>

            {/* Mock post 2 */}
            <div style={{
              background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)",
              borderRadius: 12, padding: "16px", position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #ff006e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎭</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a855f7" }}>UID-00099</div>
                  <div style={{ fontSize: 10, color: "#6272a4" }}>15 minutes ago</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#ccd6f6", lineHeight: 1.6, margin: 0 }}>
                Bunk karo ya mat karo? That's always the real question at 8am 💀
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "#ff006e" }}>❤️ 256</span>
                <span style={{ fontSize: 12, color: "#00d4ff" }}>💬 71</span>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 11, color: "#6272a4", letterSpacing: "0.5px" }}>
                🔒 All posts are 100% anonymous
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
