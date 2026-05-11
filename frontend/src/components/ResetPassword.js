import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const move = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
    };
    const leave = () => { card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"; };
    card.addEventListener("mousemove", move);
    card.addEventListener("mouseleave", leave);
    return () => { card.removeEventListener("mousemove", move); card.removeEventListener("mouseleave", leave); };
  }, []);

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) { alert("Passwords do not match ❌"); return; }
    if (password.length < 6) { alert("Password must be at least 6 characters ⚠️"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { alert(error.message); return; }
      alert("Password updated successfully ✅");
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.15)",
    color: "#ccd6f6", fontSize: 14, outline: "none",
    transition: "all 0.3s ease", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
      padding: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)", animation: "floatCard 9s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "15%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)", animation: "floatCard 12s ease-in-out infinite reverse", pointerEvents: "none" }} />

      <div
        ref={cardRef}
        style={{
          width: "100%", maxWidth: 420,
          background: "rgba(13,13,35,0.92)",
          backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
          borderRadius: 24, padding: "44px 36px",
          border: "1px solid rgba(0,212,255,0.15)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(0,212,255,0.04)",
          transition: "transform 0.1s ease",
          position: "relative", overflow: "hidden",
          animation: "slideUp 0.5s ease",
        }}
      >
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 200, height: 160, background: "radial-gradient(ellipse, rgba(0,212,255,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 26, fontWeight: 800, margin: "0 0 8px",
            background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Set New Password</h1>
          <p style={{ margin: 0, color: "#6272a4", fontSize: 13 }}>Choose a strong password to secure your account</p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>New Password</label>
          <input
            type="password" placeholder="Min. 6 characters" value={password}
            onChange={(e) => setPassword(e.target.value)} style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; e.target.style.background = "rgba(0,212,255,0.05)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.08)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.15)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Confirm Password</label>
          <input
            type="password" placeholder="Repeat password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdatePassword()}
            style={{
              ...inputStyle,
              borderColor: confirmPassword && confirmPassword !== password ? "rgba(255,107,107,0.5)" : "rgba(0,212,255,0.15)",
              boxShadow: confirmPassword && confirmPassword !== password ? "0 0 0 3px rgba(255,107,107,0.08)" : "none",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; e.target.style.background = "rgba(0,212,255,0.05)"; }}
            onBlur={(e) => { e.target.style.background = "rgba(255,255,255,0.04)"; }}
          />
          {confirmPassword && confirmPassword !== password && (
            <p style={{ fontSize: 11, color: "#ff6b6b", margin: "6px 0 0", paddingLeft: 4 }}>Passwords don't match</p>
          )}
        </div>

        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: loading ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
            color: "#fff", fontWeight: 700, fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 6px 24px rgba(0,212,255,0.35)",
            transition: "all 0.3s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,212,255,0.5)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,212,255,0.35)"; }}
        >
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Updating...</>
            : "✨ Update Password"
          }
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
