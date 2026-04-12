import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import axios from "axios";

function Signup({ setUser, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");

  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
  ];

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user && data.user.identities.length === 0) {
      alert("User already exists ❌");
      return;
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    alert("Check your email for verification 📩");
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
          maxWidth: "420px",
          padding: "40px",
          backgroundColor: "rgba(26, 26, 46, 0.8)",
          backdropFilter: "blur(15px)",
          borderRadius: "16px",
          border: "1px solid rgba(0, 212, 255, 0.1)",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              margin: "0 0 8px 0",
              background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "700",
            }}
          >
            🔥 Join Us
          </h1>
          <p
            style={{
              margin: 0,
              color: "#888",
              fontSize: "13px",
              letterSpacing: "0.5px",
            }}
          >
            Create your account to start sharing
          </p>
        </div>

        {/* Email */}
        <input
          placeholder="📧 Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            marginBottom: "12px",
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            borderRadius: "8px",
            color: "#fff",
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

        {/* Password */}
        <input
          type="password"
          placeholder="🔑 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            marginBottom: "20px",
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            borderRadius: "8px",
            color: "#fff",
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

        {/* Avatar Selection */}
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              fontSize: "13px",
              marginBottom: "12px",
              fontWeight: "600",
              color: "#00d4ff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            👇 Select Avatar
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {avatars.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="avatar"
                onClick={() => setAvatar(img)}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    avatar === img
                      ? "3px solid #00d4ff"
                      : "2px solid rgba(0, 212, 255, 0.2)",
                  transition: "all 0.3s ease",
                  transform: avatar === img ? "scale(1.1)" : "scale(1)",
                  boxShadow:
                    avatar === img
                      ? "0 0 15px rgba(0, 212, 255, 0.4)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform =
                    avatar === img ? "scale(1.1)" : "scale(1)";
                }}
              />
            ))}
          </div>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
          }}
        >
          🎉 Create Account
        </button>

        <p style={{ marginTop: "20px", color: "#888", fontSize: "13px" }}>
          Already have an account?{" "}
          <span
            onClick={() => setCurrentPage("login")}
            style={{
              color: "#00d4ff",
              cursor: "pointer",
              fontWeight: "600",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#0099cc";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#00d4ff";
            }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
