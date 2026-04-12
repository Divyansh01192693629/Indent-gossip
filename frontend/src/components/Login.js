import React, { useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../context/ThemeContext";

function Login({ setUser, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isReset, setIsReset] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setCurrentPage("feed");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Enter email first ⚠️");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("If this email exists, reset link sent 📩");
  };

  return (
    <div
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: isDarkMode ? "#fff" : "#000",
        padding: "20px",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
          padding: "8px 16px",
          borderRadius: "20px",
          background: isDarkMode
            ? "rgba(0, 212, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          color: isDarkMode ? "#00d4ff" : "#000",
          transition: "all 0.3s ease",
        }}
        onClick={() => setCurrentPage("landing")}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDarkMode
            ? "rgba(0, 212, 255, 0.2)"
            : "rgba(0, 0, 0, 0.2)";
          e.currentTarget.style.transform = "translateX(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDarkMode
            ? "rgba(0, 212, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        ← Back
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          backgroundColor: isDarkMode
            ? "rgba(26, 26, 46, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(15px)",
          borderRadius: "16px",
          textAlign: "center",
          border: isDarkMode
            ? "1px solid rgba(0, 212, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: isDarkMode
            ? "0 8px 32px rgba(0, 0, 0, 0.3)"
            : "0 8px 32px rgba(0, 0, 0, 0.15)",
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
            🔥 Indent Gossip
          </h1>
          <p
            style={{
              margin: 0,
              color: isDarkMode ? "#888" : "#666",
              fontSize: "13px",
              letterSpacing: "0.5px",
            }}
          >
            Anonymous confessions, real connections
          </p>
        </div>

        {/* Email field */}
        <input
          placeholder="📧 Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            margin: "12px 0",
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.07)",
            border: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.2)"
              : "1px solid rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
            color: isDarkMode ? "white" : "#000",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = isDarkMode
              ? "rgba(0, 212, 255, 0.5)"
              : "rgba(0, 0, 0, 0.3)";
            e.target.style.background = isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)";
            e.target.style.boxShadow = isDarkMode
              ? "0 0 0 3px rgba(0, 212, 255, 0.1)"
              : "0 0 0 3px rgba(0, 0, 0, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isDarkMode
              ? "rgba(0, 212, 255, 0.2)"
              : "rgba(0, 0, 0, 0.15)";
            e.target.style.background = isDarkMode
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.07)";
            e.target.style.boxShadow = "none";
          }}
        />

        {/* password field */}
        <input
          type="password"
          placeholder="🔑 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            margin: "12px 0",
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.07)",
            border: isDarkMode
              ? "1px solid rgba(0, 212, 255, 0.2)"
              : "1px solid rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
            color: isDarkMode ? "white" : "#000",
            fontSize: "14px",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = isDarkMode
              ? "rgba(0, 212, 255, 0.5)"
              : "rgba(0, 0, 0, 0.3)";
            e.target.style.background = isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)";
            e.target.style.boxShadow = isDarkMode
              ? "0 0 0 3px rgba(0, 212, 255, 0.1)"
              : "0 0 0 3px rgba(0, 0, 0, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isDarkMode
              ? "rgba(0, 212, 255, 0.2)"
              : "rgba(0, 0, 0, 0.15)";
            e.target.style.background = isDarkMode
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.07)";
            e.target.style.boxShadow = "none";
          }}
        />

        <p
          onClick={() => setIsReset(!isReset)}
          style={{
            cursor: "pointer",
            color: "#00d4ff",
            fontSize: "12px",
            margin: "16px 0",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#0099cc";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#00d4ff";
          }}
        >
          {isReset ? "← Back to Login" : "Forgot Password?"}
        </p>

        {/* button */}
        <button
          onClick={isReset ? handleResetPassword : handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: "linear-gradient(135deg, #ff9500 0%, #ff6b6b 100%)",
            border: "none",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(255, 149, 0, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(255, 149, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(255, 149, 0, 0.3)";
          }}
        >
          {isReset ? "📧 Send Reset Link" : "🚀 Login"}
        </button>

        <p
          style={{
            marginTop: "20px",
            color: isDarkMode ? "#888" : "#666",
            fontSize: "13px",
          }}
        >
          Don't have an account?{" "}
          <span
            onClick={() => setCurrentPage("signup")}
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
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
