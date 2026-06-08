import React, { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5005";
const shortId = (id) => id ? `UID-${id.slice(0, 6).toUpperCase()}` : "Unknown";
const dicebear = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=transparent`;

function FriendRequests({ user, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/friend-requests/${user.id}`);
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.post(`${API}/friend-request/${id}/${action}`);
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      alert(`Failed to ${action} request.`);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 2000, padding: 20, animation: "slideUp 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 400,
          background: "rgba(13,13,35,0.96)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
          borderRadius: 24, padding: "28px 24px",
          border: "1px solid rgba(0,212,255,0.2)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,212,255,0.05)",
          color: "#ccd6f6", position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #00d4ff, #a855f7)", borderRadius: "24px 24px 0 0" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>
            🔔 Friend Requests
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", color: "#6272a4", fontSize: 20, cursor: "pointer", transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#6272a4"}
          >✕</button>
        </div>

        <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>Loading...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px", color: "#6272a4" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>👻</div>
              No pending requests.
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "12px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={dicebear(req.from_user_id)} alt="av" style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a1a2e" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{shortId(req.from_user_id)}</div>
                    <div style={{ fontSize: 11, color: "#a855f7" }}>Wants to be friends</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleAction(req.id, "accept")}
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12, transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,212,255,0.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,212,255,0.1)"}
                  >Accept</button>
                  <button
                    onClick={() => handleAction(req.id, "decline")}
                    style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12, transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,107,107,0.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,107,107,0.1)"}
                  >Decline</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendRequests;
