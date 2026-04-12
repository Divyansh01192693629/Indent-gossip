import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully ✅");
    window.location.href = "/";
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          backgroundColor: "rgba(26, 26, 46, 0.8)",
          backdropFilter: "blur(15px)",
          borderRadius: "16px",
          textAlign: "center",
          border: "1px solid rgba(0, 212, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "28px",
              margin: "0 0 8px 0",
              background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "700",
            }}
          >
            🔐 Reset Password
          </h1>
          <p
            style={{
              margin: 0,
              color: "#888",
              fontSize: "13px",
              letterSpacing: "0.5px",
            }}
          >
            Enter your new password
          </p>
        </div>

        <input
          type="password"
          placeholder="🔑 New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            margin: "12px 0",
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(0, 212, 255, 0.5)";
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.boxShadow = "0 0 0 3px rgba(0, 212, 255, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(0, 212, 255, 0.2)";
            e.target.style.background = "rgba(255,255,255,0.07)";
            e.target.style.boxShadow = "none";
          }}
        />

        <input
          type="password"
          placeholder="✓ Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            marginBottom: "20px",
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(0, 212, 255, 0.5)";
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.boxShadow = "0 0 0 3px rgba(0, 212, 255, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(0, 212, 255, 0.2)";
            e.target.style.background = "rgba(255,255,255,0.07)";
            e.target.style.boxShadow = "none";
          }}
        />

        <button
          onClick={handleUpdatePassword}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(0, 212, 255, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(0, 212, 255, 0.3)";
          }}
        >
          ✨ Update Password
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
