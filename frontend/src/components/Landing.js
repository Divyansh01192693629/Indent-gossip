import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function Landing({ setCurrentPage }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const styles = {
    container: {
      minHeight: "100vh",
      background: isDarkMode
        ? "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)",
      color: isDarkMode ? "#fff" : "#000",
      transition: "all 0.3s ease",
      padding: "20px",
    },
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 40px",
      borderBottom: isDarkMode
        ? "1px solid rgba(0, 212, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.1)",
      background: isDarkMode
        ? "rgba(15, 15, 30, 0.8)"
        : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    logo: {
      fontSize: "28px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    themeToggle: {
      padding: "8px 16px",
      borderRadius: "20px",
      border: "1px solid rgba(0, 212, 255, 0.3)",
      background: isDarkMode
        ? "rgba(0, 212, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)",
      color: isDarkMode ? "#00d4ff" : "#000",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.3s ease",
    },
    heroContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "60px",
      maxWidth: "1400px",
      margin: "80px auto",
      padding: "0 40px",
    },
    heroLeft: {
      flex: 1,
    },
    heroTitle: {
      fontSize: "56px",
      fontWeight: "800",
      lineHeight: "1.2",
      marginBottom: "24px",
      color: isDarkMode ? "transparent" : "#000",
      background: isDarkMode
        ? "linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)"
        : "linear-gradient(135deg, #0099cc 0%, #ff006e 100%)",
      backgroundClip: isDarkMode ? "text" : "unset",
      WebkitBackgroundClip: isDarkMode ? "text" : "unset",
      WebkitTextFillColor: isDarkMode ? "transparent" : "unset",
    },
    heroDesc: {
      fontSize: "20px",
      lineHeight: "1.6",
      opacity: isDarkMode ? 0.7 : 0.6,
      marginBottom: "32px",
      maxWidth: "500px",
    },
    features: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginBottom: "40px",
    },
    featureItem: {
      display: "flex",
      gap: "12px",
      fontSize: "16px",
      alignItems: "center",
    },
    buttonContainer: {
      display: "flex",
      gap: "16px",
      alignItems: "center",
    },
    button: {
      padding: "14px 32px",
      borderRadius: "25px",
      border: "none",
      fontWeight: "600",
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    signupBtn: {
      background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
      color: "#fff",
      boxShadow: "0 6px 20px rgba(0, 212, 255, 0.3)",
    },
    loginBtn: {
      background: "transparent",
      border: isDarkMode
        ? "2px solid rgba(0, 212, 255, 0.5)"
        : "2px solid #000",
      color: isDarkMode ? "#00d4ff" : "#000",
    },
    heroRight: {
      flex: 1,
      textAlign: "center",
    },
    heroImage: {
      fontSize: "200px",
      marginBottom: "20px",
      animation: "float 3s ease-in-out infinite",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "24px",
      marginTop: "60px",
      padding: "40px",
      borderRadius: "16px",
      background: isDarkMode
        ? "rgba(0, 212, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
      border: isDarkMode
        ? "1px solid rgba(0, 212, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.1)",
    },
    statItem: {
      textAlign: "center",
    },
    statNumber: {
      fontSize: "32px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "8px",
    },
    statLabel: {
      fontSize: "14px",
      opacity: isDarkMode ? 0.6 : 0.6,
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.logo}>🔥 Indent Gossip</div>
        <button
          onClick={toggleTheme}
          style={styles.themeToggle}
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
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* HERO */}
      <div style={styles.heroContainer}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heroTitle}>Share Anonymously, Connect Really</h1>
          <p style={styles.heroDesc}>
            Indent Gossip is your safe space to share confessions, secrets, and
            gossip without revealing your identity. Join thousands of users
            sharing their genuine thoughts.
          </p>

          <div style={styles.features}>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>Complete anonymity - No profiles, No identity</span>
            </div>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>Real connections through genuine confessions</span>
            </div>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>Safe moderation - Hate speech not allowed</span>
            </div>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>Interactive - Like and comment on confessions</span>
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button
              style={{ ...styles.button, ...styles.signupBtn }}
              onClick={() => setCurrentPage("signup")}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 24px rgba(0, 212, 255, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 6px 20px rgba(0, 212, 255, 0.3)";
              }}
            >
              🚀 Get Started
            </button>
          </div>

          {/* STATS */}
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>2.3K</div>
              <div style={styles.statLabel}>Active Users</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>12K</div>
              <div style={styles.statLabel}>Confessions</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>48K</div>
              <div style={styles.statLabel}>Interactions</div>
            </div>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.heroImage}>🔥</div>
          <h2 style={{ fontSize: "28px", marginTop: "20px" }}>
            Your Secret, Our Platform
          </h2>
          <p
            style={{
              fontSize: "16px",
              opacity: isDarkMode ? 0.6 : 0.6,
              marginTop: "16px",
            }}
          >
            No judgement. No exposure. Just real talk.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
