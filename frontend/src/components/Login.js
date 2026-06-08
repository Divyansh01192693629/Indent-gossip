import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

function Login({ setUser, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isReset, setIsReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  // Mouse tilt on card
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const move = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
    };
    const leave = () => { card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"; };
    card.addEventListener("mousemove", move);
    card.addEventListener("mouseleave", leave);
    return () => { card.removeEventListener("mousemove", move); card.removeEventListener("mouseleave", leave); };
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { alert(error.message); return; }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setCurrentPage("feed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) { alert("Enter email first ⚠️"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
      if (error) { alert(error.message); return; }
      alert("If this email exists, reset link sent 📩");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(0,212,255,0.15)",
    color: "#ccd6f6", fontSize: 14, outline: "none",
    transition: "all 0.3s ease", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
      padding: 20, position: "relative", overflow: "hidden",
    }}>
      {/* Orbs */}
      <div style={{ position: "fixed", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)", animation: "floatCard 8s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "15%", right: "10%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", animation: "floatCard 11s ease-in-out infinite reverse", pointerEvents: "none" }} />

      {/* Back */}
      <button
        onClick={() => setCurrentPage("landing")}
        style={{
          position: "absolute", top: 24, left: 24,
          padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(0,212,255,0.2)",
          background: "rgba(0,212,255,0.05)", color: "#00d4ff", fontSize: 13,
          cursor: "pointer", fontWeight: 600, fontFamily: "inherit",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.12)"; e.currentTarget.style.transform = "translateX(-3px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.05)"; e.currentTarget.style.transform = "translateX(0)"; }}
      >
        ← Back
      </button>

      <div
        ref={cardRef}
        style={{
          width: "100%", maxWidth: 420,
          background: "rgba(13,13,35,0.9)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderRadius: 24, padding: "40px 36px",
          border: "1px solid rgba(0,212,255,0.15)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.05), 0 0 80px rgba(0,212,255,0.04)",
          transition: "transform 0.1s ease",
          position: "relative", overflow: "hidden",
          animation: "slideUp 0.5s ease",
        }}
      >
        {/* Top glow */}
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 200, height: 160, background: "radial-gradient(ellipse, rgba(0,212,255,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28, fontWeight: 800, margin: "0 0 8px",
            background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {isReset ? "Reset Password" : "Welcome Back"}
          </h1>
          <p style={{ margin: 0, color: "#6272a4", fontSize: 13 }}>
            {isReset ? "We'll send a reset link to your email" : "Sign in to continue to Indent Gossip"}
          </p>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
          <input
            type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; e.target.style.background = "rgba(0,212,255,0.05)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.08)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.15)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Password */}
        {!isReset && (
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; e.target.style.background = "rgba(0,212,255,0.05)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.15)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        )}

        <p
          onClick={() => setIsReset(!isReset)}
          style={{ cursor: "pointer", color: "#00d4ff", fontSize: 12, margin: "12px 0 24px", textAlign: "right", transition: "color 0.2s" }}
          onMouseEnter={(e) => e.target.style.color = "#a855f7"}
          onMouseLeave={(e) => e.target.style.color = "#00d4ff"}
        >
          {isReset ? "← Back to Login" : "Forgot Password?"}
        </p>

        {/* Submit */}
        <button
          onClick={isReset ? handleResetPassword : handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: loading ? "rgba(255,149,0,0.4)" : "linear-gradient(135deg, #ff9500 0%, #ff6b6b 100%)",
            color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 6px 24px rgba(255,149,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            transition: "all 0.3s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit",
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,149,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,149,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
        >
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{isReset ? "Sending..." : "Logging in..."}</>
            : isReset ? "📧 Send Reset Link" : "🚀 Login"
          }
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: "#6272a4", fontSize: 11 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        <p style={{ textAlign: "center", color: "#6272a4", fontSize: 13, margin: 0 }}>
          Don't have an account?{" "}
          <span
            onClick={() => setCurrentPage("signup")}
            style={{ color: "#00d4ff", cursor: "pointer", fontWeight: 700, transition: "color 0.2s" }}
            onMouseEnter={(e) => e.target.style.color = "#a855f7"}
            onMouseLeave={(e) => e.target.style.color = "#00d4ff"}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
