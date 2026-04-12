import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function Profile({ user, setShowProfile }) {
  const { isDarkMode } = useContext(ThemeContext);

  const styles = {
    container: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDarkMode
        ? "rgba(0, 0, 0, 0.7)"
        : "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      backdropFilter: "blur(5px)",
    },
    modal: {
      background: isDarkMode
        ? "linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)"
        : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 245, 0.95) 100%)",
      borderRadius: "16px",
      padding: "40px",
      maxWidth: "500px",
      width: "100%",
      border: isDarkMode
        ? "1px solid rgba(0, 212, 255, 0.2)"
        : "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: isDarkMode
        ? "0 8px 32px rgba(0, 212, 255, 0.1)"
        : "0 8px 32px rgba(0, 0, 0, 0.1)",
      color: isDarkMode ? "#fff" : "#000",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    closeBtn: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: isDarkMode ? "#00d4ff" : "#000",
      fontWeight: "bold",
    },
    section: {
      marginBottom: "24px",
    },
    label: {
      fontSize: "12px",
      fontWeight: "600",
      color: isDarkMode ? "#00d4ff" : "#0099cc",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "8px",
      display: "block",
    },
    value: {
      fontSize: "16px",
      padding: "12px 16px",
      borderRadius: "8px",
      background: isDarkMode
        ? "rgba(0, 212, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
      border: isDarkMode
        ? "1px solid rgba(0, 212, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.1)",
      wordBreak: "break-all",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginTop: "24px",
      padding: "16px",
      borderRadius: "8px",
      background: isDarkMode
        ? "rgba(0, 212, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
    },
    statItem: {
      textAlign: "center",
    },
    statNumber: {
      fontSize: "24px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    statLabel: {
      fontSize: "12px",
      opacity: isDarkMode ? 0.6 : 0.6,
      marginTop: "4px",
    },
  };

  return (
    <div style={styles.container} onClick={() => setShowProfile(false)}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>👤 Profile</h2>
          <button
            style={styles.closeBtn}
            onClick={() => setShowProfile(false)}
          >
            ✕
          </button>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Email</label>
          <div style={styles.value}>{user.email}</div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>User ID</label>
          <div style={styles.value}>{user.id}</div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Account Created</label>
          <div style={styles.value}>
            {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>My Posts</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>Total Likes</div>
          </div>
        </div>

        <p
          style={{
            fontSize: "12px",
            opacity: isDarkMode ? 0.5 : 0.5,
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          Your profile is completely anonymous. No one can see your identity.
        </p>
      </div>
    </div>
  );
}

export default Profile;
