import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Must match BOT_USER_ID in backend/server.js
const BOT_USER_ID = "00000000-0000-0000-0000-000000000001";

// Helper: shorten UUID
const shortId = (id) => id ? `UID-${id.slice(0, 6).toUpperCase()}` : "Unknown";
const dicebear = (seed, style = "avataaars") =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;

function ChatPage({ user, setCurrentPage }) {
  const [activeTab, setActiveTab] = useState("dms"); // dms | groups
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null); // { type: 'dm'|'group', data: {} }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState([]);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [deletingMsgId, setDeletingMsgId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const myStyle = localStorage.getItem("avatarStyle") || "avataaars";

  const fetchFriends = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/friends/${user.id}`);
      const fetched = res.data || [];
      if (!fetched.find(f => f.friend_id === BOT_USER_ID)) {
        fetched.unshift({ friend_id: BOT_USER_ID, isBot: true });
      }
      setFriends(fetched);
    } catch {}
  }, [user.id]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/groups/${user.id}`);
      setGroups(res.data || []);
    } catch {}
  }, [user.id]);

  const fetchMessages = useCallback(async () => {
    if (!selected) return;
    try {
      const url =
        selected.type === "dm"
          ? `${API}/messages/${user.id}/${selected.data.friend_id}?requester_id=${user.id}`
          : `${API}/group/${selected.data.id}/messages`;
      const res = await axios.get(url);
      setMessages(res.data || []);
      // Mark as read
      if (selected.type === "dm") {
        axios.post(`${API}/messages/read`, { userId: user.id, friendId: selected.data.friend_id }).catch(() => {});
      }
    } catch {}
  }, [selected, user.id]);

  useEffect(() => { fetchFriends(); fetchGroups(); }, [fetchFriends, fetchGroups]);

  // Poll messages every 2.5s when a conversation is open
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 2500);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      if (selected.type === "dm") {
        await axios.post(`${API}/message`, { from_user_id: user.id, to_user_id: selected.data.friend_id, content: text });
      } else {
        await axios.post(`${API}/group/${selected.data.id}/message`, { from_user_id: user.id, content: text });
      }
      fetchMessages();
    } catch (err) {
      alert("Failed to send: " + (err.response?.data?.error || err.message));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  // Delete a single message
  const deleteMessage = async (msgId) => {
    setDeletingMsgId(msgId);
    try {
      await axios.delete(`${API}/message/${msgId}`, {
        data: { user_id: user.id }
      });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      alert("Failed to delete message: " + (err.response?.data?.error || err.message));
    } finally {
      setDeletingMsgId(null);
      setHoveredMsgId(null);
    }
  };

  // Clear entire conversation
  const clearConversation = async () => {
    if (!selected || selected.type !== "dm") return;
    setClearingChat(true);
    try {
      await axios.delete(`${API}/messages/conversation`, {
        data: { userId: user.id, friendId: selected.data.friend_id }
      });
      setMessages([]);
      setShowClearConfirm(false);
    } catch (err) {
      alert("Failed to clear chat: " + (err.response?.data?.error || err.message));
    } finally {
      setClearingChat(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return alert("Group name required");
    try {
      await axios.post(`${API}/group`, {
        name: groupName,
        created_by: user.id,
        member_ids: selectedFriendsForGroup,
      });
      setGroupName("");
      setSelectedFriendsForGroup([]);
      setShowGroupCreate(false);
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const glassCard = {
    background: "rgba(13,13,35,0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(0,212,255,0.1)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div style={{
        ...glassCard,
        display: "flex", alignItems: "center", gap: 16,
        padding: "0 24px", height: 60,
        borderBottom: "1px solid rgba(0,212,255,0.1)",
        position: "sticky", top: 0, zIndex: 100,
        borderRadius: 0,
      }}>
        <button
          onClick={() => setCurrentPage("feed")}
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#8892b0", borderRadius: 10, padding: "7px 14px",
            cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.08)"; e.currentTarget.style.color = "#00d4ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8892b0"; }}
        >
          ← Feed
        </button>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18,
          background: "linear-gradient(135deg, #00d4ff, #a855f7)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>💬 Messages</div>
        <button
          onClick={() => setShowGroupCreate(true)}
          style={{
            marginLeft: "auto", background: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7",
            borderRadius: 10, padding: "7px 14px", cursor: "pointer",
            fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; }}
        >
          + New Group
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, maxWidth: 1100, margin: "20px auto", width: "100%", padding: "0 16px", gap: 16, height: "calc(100vh - 96px)" }}>
        {/* ── LEFT PANEL ── */}
        <div style={{ ...glassCard, borderRadius: 20, width: 300, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
            {["dms", "groups"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: "14px", border: "none", cursor: "pointer",
                  background: activeTab === tab ? "rgba(0,212,255,0.08)" : "transparent",
                  color: activeTab === tab ? "#00d4ff" : "#6272a4",
                  fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                  fontFamily: "inherit",
                  borderBottom: activeTab === tab ? "2px solid #00d4ff" : "2px solid transparent",
                }}
              >
                {tab === "dms" ? "💬 Direct" : "👥 Groups"}
                <span style={{
                  marginLeft: 6, background: activeTab === tab ? "#00d4ff" : "rgba(255,255,255,0.1)",
                  color: activeTab === tab ? "#000" : "#6272a4",
                  borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 800,
                }}>
                  {tab === "dms" ? friends.length : groups.length}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {activeTab === "dms" && (
              friends.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "#44475a" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🤝</div>
                  <div style={{ fontSize: 13 }}>No friends yet.<br />Add friends from posts!</div>
                </div>
              ) : friends.map((f) => (
                <div
                  key={f.friend_id}
                  onClick={() => setSelected({ type: "dm", data: f })}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 10px", borderRadius: 12, cursor: "pointer",
                    background: selected?.data?.friend_id === f.friend_id ? "rgba(0,212,255,0.1)" : "transparent",
                    border: `1px solid ${selected?.data?.friend_id === f.friend_id ? "rgba(0,212,255,0.25)" : "transparent"}`,
                    transition: "all 0.2s", marginBottom: 4,
                  }}
                  onMouseEnter={(e) => { if (selected?.data?.friend_id !== f.friend_id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (selected?.data?.friend_id !== f.friend_id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ position: "relative" }}>
                    <img src={dicebear(f.friend_id)} alt="av" style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1a2e", flexShrink: 0 }} />
                    {f.friend_id === BOT_USER_ID && (
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 12, height: 12, borderRadius: "50%",
                        background: "#00ff88", border: "2px solid #0d0d23"
                      }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ccd6f6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {f.friend_id === BOT_USER_ID ? "🤖 Indent Bot" : shortId(f.friend_id)}
                    </div>
                    <div style={{ fontSize: 11, color: f.friend_id === BOT_USER_ID ? "#00ff88" : "#44475a" }}>
                      {f.friend_id === BOT_USER_ID ? "● Always online" : "Tap to chat"}
                    </div>
                  </div>
                </div>
              ))
            )}
            {activeTab === "groups" && (
              groups.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "#44475a" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
                  <div style={{ fontSize: 13 }}>No groups yet.<br />Create one above!</div>
                </div>
              ) : groups.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelected({ type: "group", data: g })}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 10px", borderRadius: 12, cursor: "pointer",
                    background: selected?.data?.id === g.id ? "rgba(168,85,247,0.1)" : "transparent",
                    border: `1px solid ${selected?.data?.id === g.id ? "rgba(168,85,247,0.25)" : "transparent"}`,
                    transition: "all 0.2s", marginBottom: 4,
                  }}
                  onMouseEnter={(e) => { if (selected?.data?.id !== g.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (selected?.data?.id !== g.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg, #a855f7, #ff006e)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>👥</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ccd6f6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: "#44475a" }}>Group chat</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ ...glassCard, borderRadius: 20, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#44475a" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#6272a4", marginBottom: 8 }}>Select a conversation</div>
              <div style={{ fontSize: 13 }}>Choose a friend or group from the left panel</div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid rgba(0,212,255,0.08)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                {selected.type === "dm" ? (
                  <div style={{ position: "relative" }}>
                    <img src={dicebear(selected.data.friend_id)} alt="av" style={{ width: 38, height: 38, borderRadius: "50%", background: "#1a1a2e" }} />
                    {selected.data.friend_id === BOT_USER_ID && (
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#00ff88", border: "2px solid #0d0d23"
                      }} />
                    )}
                  </div>
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #a855f7, #ff006e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👥</div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#ccd6f6" }}>
                    {selected.type === "dm" ? (selected.data.friend_id === BOT_USER_ID ? "🤖 Indent Bot" : shortId(selected.data.friend_id)) : selected.data.name}
                  </div>
                  <div style={{ fontSize: 11, color: selected.data.friend_id === BOT_USER_ID ? "#00ff88" : "#44475a" }}>
                    {selected.type === "dm" ? (selected.data.friend_id === BOT_USER_ID ? "● Always online — AI Assistant" : "Anonymous friend") : "Group chat"}
                  </div>
                </div>

                {/* Clear chat button (only for DMs) */}
                {selected.type === "dm" && messages.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    title="Clear conversation"
                    style={{
                      marginLeft: "auto", background: "rgba(255,59,59,0.08)",
                      border: "1px solid rgba(255,59,59,0.2)", color: "#ff6b6b",
                      borderRadius: 10, padding: "6px 12px", cursor: "pointer",
                      fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,59,59,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,59,59,0.08)"; }}
                  >
                    🗑️ Clear Chat
                  </button>
                )}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#44475a", marginTop: 40 }}>
                    <div style={{ fontSize: 40 }}>👋</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>
                      {selected.data.friend_id === BOT_USER_ID
                        ? "Say hi to Indent Bot! Ask anything 🤖"
                        : "No messages yet. Say hello!"}
                    </div>
                  </div>
                ) : messages.map((msg, i) => {
                  const isMe = msg.from_user_id === user.id;
                  const isBot = msg.from_user_id === BOT_USER_ID;
                  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const isDeleting = deletingMsgId === msg.id;
                  const isHovered = hoveredMsgId === msg.id;

                  return (
                    <div
                      key={msg.id || i}
                      style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}
                      onMouseEnter={() => setHoveredMsgId(msg.id)}
                      onMouseLeave={() => setHoveredMsgId(null)}
                    >
                      {!isMe && (
                        <img
                          src={isBot ? dicebear(BOT_USER_ID, "bottts") : dicebear(msg.from_user_id)}
                          alt="av"
                          style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a1a2e", flexShrink: 0 }}
                        />
                      )}
                      <div style={{ maxWidth: "72%" }}>
                        {!isMe && selected.type === "group" && (
                          <div style={{ fontSize: 10, color: "#6272a4", marginBottom: 4, paddingLeft: 2 }}>{shortId(msg.from_user_id)}</div>
                        )}
                        <div style={{ position: "relative" }}>
                          <div style={{
                            padding: "10px 14px",
                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: isMe
                              ? "linear-gradient(135deg, #00d4ff, #0099cc)"
                              : isBot
                                ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.08))"
                                : "rgba(255,255,255,0.07)",
                            color: isMe ? "#fff" : "#ccd6f6",
                            fontSize: 14, lineHeight: 1.5,
                            border: isMe ? "none" : isBot ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.08)",
                            boxShadow: isMe ? "0 4px 16px rgba(0,212,255,0.25)" : "none",
                            wordBreak: "break-word",
                            opacity: isDeleting ? 0.4 : 1,
                            transition: "opacity 0.2s",
                            whiteSpace: "pre-wrap",
                          }}>
                            {msg.content}
                          </div>

                          {/* Delete button — only for my messages, shown on hover */}
                          {isMe && isHovered && !isDeleting && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              title="Delete message"
                              style={{
                                position: "absolute", top: "50%", right: "calc(100% + 8px)",
                                transform: "translateY(-50%)",
                                background: "rgba(255,59,59,0.15)",
                                border: "1px solid rgba(255,59,59,0.3)",
                                color: "#ff6b6b", borderRadius: 8,
                                padding: "4px 8px", cursor: "pointer",
                                fontSize: 12, fontFamily: "inherit",
                                display: "flex", alignItems: "center", gap: 4,
                                transition: "all 0.2s", whiteSpace: "nowrap",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,59,59,0.3)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,59,59,0.15)"; }}
                            >
                              🗑️
                            </button>
                          )}
                          {isDeleting && (
                            <div style={{
                              position: "absolute", top: "50%", right: "calc(100% + 8px)",
                              transform: "translateY(-50%)", fontSize: 12, color: "#6272a4",
                            }}>
                              Deleting...
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: "#44475a", marginTop: 4, textAlign: isMe ? "right" : "left", paddingLeft: isMe ? 0 : 4 }}>
                          {time}
                        </div>
                      </div>
                      {isMe && (
                        <img src={dicebear(user.id, myStyle)} alt="av" style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a1a2e", flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,212,255,0.08)", display: "flex", gap: 10 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder={selected.data.friend_id === BOT_USER_ID ? "Ask Indent Bot anything... 🤖" : "Type a message... (Enter to send)"}
                  style={{
                    flex: 1, padding: "11px 16px", borderRadius: 12,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.15)",
                    color: "#ccd6f6", fontSize: 14, outline: "none", fontFamily: "inherit",
                    transition: "all 0.25s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.4)"; e.target.style.background = "rgba(0,212,255,0.04)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(0,212,255,0.15)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{
                    padding: "11px 20px", borderRadius: 12, border: "none",
                    background: (!input.trim() || sending) ? "rgba(0,212,255,0.2)" : "linear-gradient(135deg, #00d4ff, #0099cc)",
                    color: "#fff", cursor: (!input.trim() || sending) ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: 14, transition: "all 0.2s", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 6,
                    boxShadow: "0 4px 14px rgba(0,212,255,0.25)",
                  }}
                  onMouseEnter={(e) => { if (input.trim() && !sending) e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {sending ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "Send ➤"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Group Create Modal */}
      {showGroupCreate && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}
          onClick={() => setShowGroupCreate(false)}
        >
          <div
            style={{ ...glassCard, borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 420, position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #a855f7, #ff006e)", borderRadius: "20px 20px 0 0" }} />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#ccd6f6" }}>👥 Create Group</h2>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name..."
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.2)", color: "#ccd6f6", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 16 }}
            />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a855f7", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Add Friends</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", marginBottom: 20 }}>
              {friends.filter(f => !f.isBot).length === 0 ? (
                <div style={{ color: "#44475a", fontSize: 13 }}>No human friends to add yet</div>
              ) : friends.filter(f => !f.isBot).map((f) => (
                <label key={f.friend_id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: selectedFriendsForGroup.includes(f.friend_id) ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedFriendsForGroup.includes(f.friend_id) ? "rgba(168,85,247,0.3)" : "transparent"}`, transition: "all 0.2s" }}>
                  <input
                    type="checkbox"
                    checked={selectedFriendsForGroup.includes(f.friend_id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedFriendsForGroup((p) => [...p, f.friend_id]);
                      else setSelectedFriendsForGroup((p) => p.filter((id) => id !== f.friend_id));
                    }}
                    style={{ accentColor: "#a855f7" }}
                  />
                  <img src={dicebear(f.friend_id)} alt="av" style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a1a2e" }} />
                  <span style={{ fontSize: 13, color: "#ccd6f6", fontWeight: 600 }}>{shortId(f.friend_id)}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowGroupCreate(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#6272a4", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
              <button
                onClick={createGroup}
                style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #a855f7, #7e22ce)", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(168,85,247,0.3)" }}
              >
                🚀 Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirm Modal */}
      {showClearConfirm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}
          onClick={() => !clearingChat && setShowClearConfirm(false)}
        >
          <div
            style={{ ...glassCard, borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 380, position: "relative", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #ff6b6b, #ff006e)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 10px", color: "#ccd6f6" }}>Clear Conversation?</h2>
            <p style={{ color: "#6272a4", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              This will permanently delete all messages in this conversation. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearingChat}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#6272a4", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={clearConversation}
                disabled={clearingChat}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10, border: "none",
                  background: clearingChat ? "rgba(255,59,59,0.3)" : "linear-gradient(135deg, #ff6b6b, #ff006e)",
                  color: "#fff", cursor: clearingChat ? "not-allowed" : "pointer",
                  fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(255,0,110,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {clearingChat ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Clearing...</> : "🗑️ Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
