require("dotenv").config();
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./my-key.json";
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const supabase = require("./supabaseClient");
const { checkTextAI, checkImageSafety, checkImageBuffer } = require("./services/moderation");

// 🤖 Fixed UUID for Indent Bot (valid UUID format — required by DB uuid column type)
const BOT_USER_ID = "00000000-0000-0000-0000-000000000001";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Test Route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// 🔹 UUID Login
app.post("/login", (req, res) => {
  const uuid = uuidv4();
  res.json({ uuid });
});

// sign up api
app.post("/signup", async (req, res) => {
  const { password, avatar } = req.body;

  const user_id = uuidv4(); // 🔥 this is username now

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        id: user_id,
        username: user_id, // 👈 UUID = username
        password,
        avatar,
      },
    ])
    .select();

  if (error) {
    console.log(error);
    return res.status(500).json(error);
  }

  res.json(data[0]);
});

// login api
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (!data) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json(data);
});

// 🔹 Upload Image (with NLP/AI safety check BEFORE storing)
app.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 🔥 STEP 1: CHECK IMAGE SAFETY WITH GEMINI VISION BEFORE UPLOADING
    console.log("🖼️ Pre-upload image safety check...");
    const safetyResult = await checkImageBuffer(file.buffer, file.mimetype);
    if (!safetyResult.safe) {
      console.log("🚫 Unsafe image blocked before upload:", safetyResult.reason);
      return res.status(400).json({
        error: "❌ Abusive/harassment image not allowed! Upload blocked. 🚫",
      });
    }
    console.log("✅ Image passed safety check — uploading to storage");

    // 🔥 STEP 2: UPLOAD TO SUPABASE STORAGE
    const fileName = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.log(error);
      return res.status(500).json(error);
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    res.json({
      image_url: data.publicUrl,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// 🔹 Validate Text API
app.post("/validate-text", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.json({ safe: true });
    
    const textResult = await checkTextAI(content);
    // Only BLOCK if actually blocked (high toxicity)
    if (textResult.blocked) {
      return res.status(400).json({ safe: false, reason: textResult.category || "abusive" });
    }
    // If only masked (moderate), it's still SAFE to post (content will be masked server-side)
    res.json({ safe: true, textResult });
  } catch (err) {
    res.status(500).json({ error: "Validation error" });
  }
});

// 🔹 Create Post
app.post("/create-post", async (req, res) => {
  try {
    const { content, image_url, user_id, uid } = req.body;

    let finalContent = content;

    // 🔥 TEXT CHECK - AI TOXICITY DETECTION
    if (content) {
      const textResult = await checkTextAI(content);

      // BLOCK HIGH TOXICITY
      if (textResult.blocked) {
        return res.status(400).json({
          error: `❌ Abusive content not allowed! Detected ${textResult.category} content.`,
        });
      }

      // MASK MODERATE TOXICITY
      if (textResult.masked) {
        finalContent = textResult.text;
        console.log("📝 Post masked (moderate toxicity)");
      }
    }

    // 🔥 IMAGE CHECK
    if (image_url) {
      console.log("🖼️ Checking image:", image_url);
      const safeImage = await checkImageSafety(image_url);
      console.log("📊 Image safety result:", safeImage);

      if (!safeImage) {
        console.log("🚫 IMAGE REJECTED - Unsafe content detected");
        return res.status(400).json({
          error: "❌ Unsafe image not allowed! 🚫",
        });
      }
    }

    // 🔥 SAVE POST
    const { data, error } = await supabase
      .from("posts")
      .insert([{ content: finalContent, image_url, user_id, uid }]);

    if (error) return res.status(500).json(error);

    res.json(data);
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ error: "Server error ❌" });
  }
});

// 🔹 Search Posts and Users
app.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ posts: [], users: [] });

    // Search posts
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .ilike("content", `%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    // Search users by UID
    const { data: users } = await supabase
      .from("users")
      .select("id, username, avatar")
      .ilike("username", `%${q}%`)
      .limit(10);

    res.json({ posts: posts || [], users: users || [] });
  } catch (err) {
    console.log("Search error:", err.message);
    res.status(500).json({ error: "Server error during search" });
  }
});

// 🔹 Get Posts
app.get("/posts", async (req, res) => {
  const user_id = req.query.user_id;

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: likes } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", user_id);

  // mark liked posts
  const updatedPosts = posts.map((post) => ({
    ...post,
    liked: likes.some((like) => like.post_id === post.id),
  }));

  res.json(updatedPosts);
});

// 🔹 Delete Post (only owner)
app.delete("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    // Verify ownership
    const { data: post, error: fetchErr } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !post) return res.status(404).json({ error: "Post not found" });
    if (post.user_id !== user_id) return res.status(403).json({ error: "Not authorized" });

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    // Also remove associated likes
    await supabase.from("likes").delete().eq("post_id", id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Seed bot user in DB so FK constraints don't block bot messages
async function seedBotUser() {
  try {
    // Try upsert — if row already exists, ignore
    const { error } = await supabase
      .from("users")
      .upsert(
        [{
          id: BOT_USER_ID,
          username: "Indent Bot 🤖",
          password: "bot-no-login-ever",
          avatar: "bottts",
        }],
        { onConflict: "id", ignoreDuplicates: true }
      );
    if (error && !error.message?.toLowerCase().includes("duplicate")) {
      console.log("⚠️  Bot user setup note:", error.message);
    } else {
      console.log("🤖 Indent Bot user ready in DB");
    }
  } catch (err) {
    console.log("⚠️  Bot user seed skipped (may not need it):", err.message);
  }
}

// 🔹 Start Server & Background Worker
app.listen(5000, () => {
  console.log("Server started on 5000 🚀");
  seedBotUser(); // ensure indent-bot-id exists in users table
  startJokeBot();
});

// 🔹 Helper: Call Gemini AI
const callGemini = async (prompt) => {
  const axios = require("axios");
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY || GEMINI_KEY.includes("placeYour") || GEMINI_KEY.length < 20) {
    throw new Error("Gemini API key not configured");
  }
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { "Content-Type": "application/json" }, timeout: 12000 }
  );
  return response.data.candidates[0].content.parts[0].text.trim();
};

// 🔹 Helper: Call OpenAI chat
const callOpenAI = async (systemPrompt, userMsg) => {
  const axios = require("axios");
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg }
      ],
      max_tokens: 150
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
};

// 🔹 Background Task: Every 10-Minute Joke Auto-Poster
const startJokeBot = () => {
  // Post immediately, then every 10 minutes
  const postJoke = async () => {
    try {
      let joke;
      const jokePrompt = "Tell me one short, funny, clean joke in 1-3 sentences. No intro, just the joke itself. Make it clever and witty.";
      try {
        joke = await callGemini(jokePrompt);
        console.log("🤖 Joke via Gemini:", joke);
      } catch (geminiErr) {
        console.log("Gemini joke failed, trying OpenAI:", geminiErr.message);
        joke = await callOpenAI(
          "You are a hilarious, casual comedian. Tell a short, clean, funny text-based joke. No intro, just the joke.",
          "Tell me a joke for my feed."
        );
      }

      const { error: insertErr } = await supabase.from("posts").insert([{
        user_id: BOT_USER_ID,
        content: `🤖 Joke of the moment:\n\n${joke}`
      }]);
      if (insertErr) throw new Error("DB insert failed: " + insertErr.message);
      console.log("🤖 Indent Bot auto-posted a joke!");
    } catch (err) {
      console.log("Error posting bot joke:", err.message);
      // Post a fallback joke from a static list
      const fallbackJokes = [
        "🤖 Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "🤖 Why did the developer go broke? Because he used up all his cache! 💸",
        "🤖 What's a computer's favorite snack? Microchips! 🍟",
        "🤖 Why do Java developers wear glasses? Because they don't C#! 👓",
        "🤖 A SQL query walks into a bar, walks up to two tables and asks... Can I join you? 😄",
      ];
      const fallback = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      try {
        const { error: fbErr } = await supabase.from("posts").insert([{
          user_id: BOT_USER_ID,
          content: fallback
        }]);
        if (fbErr) console.log("Failed to insert fallback joke (DB):", fbErr.message);
        else console.log("🤖 Indent Bot posted a fallback joke.");
      } catch (dbErr) {
        console.log("Failed to insert fallback joke:", dbErr.message);
      }
    }
  };

  postJoke(); // Run immediately on startup
  setInterval(postJoke, 10 * 60 * 1000); // Then every 10 minutes
}

// 🔹 Like Post
app.post("/like-post/:id", async (req, res) => {
  const { user_id } = req.body;
  const postId = req.params.id;

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  let liked_by = data.liked_by || [];

  if (liked_by.includes(user_id)) {
    // 🔴 UNLIKE
    liked_by = liked_by.filter((id) => id !== user_id);

    await supabase
      .from("posts")
      .update({
        likes: data.likes - 1,
        liked_by,
      })
      .eq("id", postId);
  } else {
    // 🟢 LIKE
    liked_by.push(user_id);

    await supabase
      .from("posts")
      .update({
        likes: data.likes + 1,
        liked_by,
      })
      .eq("id", postId);
  }

  res.json({ success: true });
});

// 🔹 Add Comment
app.post("/add-comment/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    let { text, user_id } = req.body;

    if (!text || !postId) {
      return res.status(400).json({ error: "Missing text or postId" });
    }

    // 🔥 TEXT CHECK & MASK
    const textResult = await checkTextAI(text);

    // BLOCK HIGH TOXICITY
    if (textResult.blocked) {
      return res.status(400).json({
        error: "❌ Abusive comment not allowed! Rejected.",
      });
    }

    // MASK MODERATE TOXICITY
    if (textResult.masked) {
      text = textResult.text;
      console.log("📝 Comment masked (moderate toxicity)");
    }

    // Get existing comments
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("comments")
      .eq("id", postId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res
        .status(400)
        .json({ error: `Post not found: ${fetchError.message}` });
    }

    let comments = post?.comments || [];
    if (!Array.isArray(comments)) {
      comments = [];
    }

    const newComment = {
      id: Date.now(),
      text,
      user_id,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: [],
    };

    comments.push(newComment);

    // Update post with new comment
    const { data: updateData, error: updateError } = await supabase
      .from("posts")
      .update({ comments })
      .eq("id", postId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      return res
        .status(500)
        .json({ error: `Failed to save comment: ${updateError.message}` });
    }

    res.json({ success: true, comment: newComment });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// 🔹 Get Comments
app.get("/comments/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;

    const { data: post } = await supabase
      .from("posts")
      .select("comments")
      .eq("id", postId)
      .single();

    res.json(post?.comments || []);
  } catch (err) {
    res.status(500).json({ error: "Server error ❌" });
  }
});

// 🔹 Add Reply to Comment
app.post("/add-reply/:postId/:commentId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const parentCommentId = parseInt(req.params.commentId);
    let { text, user_id } = req.body;

    if (!text || !postId || !parentCommentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔥 TEXT CHECK & MASK
    const textResult = await checkTextAI(text);

    // BLOCK HIGH TOXICITY
    if (textResult.blocked) {
      return res.status(400).json({
        error: "❌ Abusive reply not allowed! Rejected.",
      });
    }

    // MASK MODERATE TOXICITY
    if (textResult.masked) {
      text = textResult.text;
      console.log("📝 Reply masked (moderate toxicity)");
    }

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("comments")
      .eq("id", postId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(400).json({ error: "Post not found" });
    }

    let comments = post?.comments || [];

    // Find parent comment and add reply
    const newReply = {
      id: Date.now(),
      text,
      user_id,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      parentId: parentCommentId,
    };

    // Recursively find parent comment in any level of nesting
    let replyAdded = false;
    const findAndAddReply = (commentsList) => {
      for (let i = 0; i < commentsList.length; i++) {
        if (commentsList[i].id === parentCommentId) {
          if (!commentsList[i].replies) {
            commentsList[i].replies = [];
          }
          commentsList[i].replies.push(newReply);
          replyAdded = true;
          return true;
        }
        // Check in nested replies
        if (commentsList[i].replies && commentsList[i].replies.length > 0) {
          if (findAndAddReply(commentsList[i].replies)) {
            return true;
          }
        }
      }
      return false;
    };

    findAndAddReply(comments);

    // Validate parent comment was found
    if (!replyAdded) {
      console.error("Parent comment not found:", parentCommentId);
      return res.status(400).json({ error: "Parent comment not found" });
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({ comments })
      .eq("id", postId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Failed to save reply" });
    }

    res.json({ success: true, reply: newReply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error ❌" });
  }
});

// 🔹 Like Comment
app.post("/like-comment/:postId/:commentId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = parseInt(req.params.commentId);
    const { user_id, removeDislike } = req.body;

    const { data: post } = await supabase
      .from("posts")
      .select("comments")
      .eq("id", postId)
      .single();

    let comments = post?.comments || [];

    // Find and update comment
    const updateComment = (commentsList) => {
      for (let i = 0; i < commentsList.length; i++) {
        if (commentsList[i].id === commentId) {
          commentsList[i].likes = (commentsList[i].likes || 0) + 1;
          // If removing dislike, decrease dislike count
          if (removeDislike && commentsList[i].dislikes > 0) {
            commentsList[i].dislikes--;
          }
          return true;
        }
        if (commentsList[i].replies) {
          if (updateComment(commentsList[i].replies)) {
            return true;
          }
        }
      }
      return false;
    };

    updateComment(comments);
    const { error: updateError } = await supabase
      .from("posts")
      .update({ comments })
      .eq("id", postId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Failed to update like" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error ❌" });
  }
});

// 🔹 Unlike Comment
app.post("/unlike-comment/:postId/:commentId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = parseInt(req.params.commentId);

    const { data: post } = await supabase
      .from("posts")
      .select("comments")
      .eq("id", postId)
      .single();

    let comments = post?.comments || [];

    const updateComment = (commentsList) => {
      for (let i = 0; i < commentsList.length; i++) {
        if (commentsList[i].id === commentId) {
          commentsList[i].likes = Math.max(0, (commentsList[i].likes || 1) - 1);
          return true;
        }
        if (commentsList[i].replies) {
          if (updateComment(commentsList[i].replies)) {
            return true;
          }
        }
      }
      return false;
    };

    updateComment(comments);
    await supabase.from("posts").update({ comments }).eq("id", postId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error ❌" });
  }
});

// 🔹 Dislike Comment
app.post("/dislike-comment/:postId/:commentId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = parseInt(req.params.commentId);
    const { user_id, removeLike } = req.body;

    const { data: post } = await supabase
      .from("posts")
      .select("comments")
      .eq("id", postId)
      .single();

    let comments = post?.comments || [];

    const updateComment = (commentsList) => {
      for (let i = 0; i < commentsList.length; i++) {
        if (commentsList[i].id === commentId) {
          commentsList[i].dislikes = (commentsList[i].dislikes || 0) + 1;
          // If removing like, decrease like count
          if (removeLike && commentsList[i].likes > 0) {
            commentsList[i].likes--;
          }
          return true;
        }
        if (commentsList[i].replies) {
          if (updateComment(commentsList[i].replies)) {
            return true;
          }
        }
      }
      return false;
    };

    updateComment(comments);
    await supabase.from("posts").update({ comments }).eq("id", postId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error ❌" });
  }
});

// 🔹 Undislike Comment
app.post("/undislike-comment/:postId/:commentId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = parseInt(req.params.commentId);

    const { data: post } = await supabase
      .from("posts")
      .select("comments")
      .eq("id", postId)
      .single();

    let comments = post?.comments || [];

    const updateComment = (commentsList) => {
      for (let i = 0; i < commentsList.length; i++) {
        if (commentsList[i].id === commentId) {
          commentsList[i].dislikes = Math.max(
            0,
            (commentsList[i].dislikes || 1) - 1,
          );
          return true;
        }
        if (commentsList[i].replies) {
          if (updateComment(commentsList[i].replies)) {
            return true;
          }
        }
      }
      return false;
    };

    updateComment(comments);
    await supabase.from("posts").update({ comments }).eq("id", postId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error ❌" });
  }
});

// ═══════════════════════════════════════════════
// 🔹 FRIEND REQUESTS
// ═══════════════════════════════════════════════

// Send friend request
app.post("/friend-request", async (req, res) => {
  try {
    const { from_user_id, to_user_id } = req.body;
    if (!from_user_id || !to_user_id) return res.status(400).json({ error: "Missing user IDs" });
    if (from_user_id === to_user_id) return res.status(400).json({ error: "Cannot add yourself" });

    // Check if request/friendship already exists
    const { data: existing } = await supabase
      .from("friend_requests")
      .select("id, status")
      .or(`and(from_user_id.eq.${from_user_id},to_user_id.eq.${to_user_id}),and(from_user_id.eq.${to_user_id},to_user_id.eq.${from_user_id})`);

    if (existing && existing.length > 0) {
      const req0 = existing[0];
      if (req0.status === "accepted") return res.status(400).json({ error: "Already friends" });
      if (req0.status === "pending") return res.status(400).json({ error: "Request already sent" });
    }

    const { data, error } = await supabase
      .from("friend_requests")
      .insert([{ from_user_id, to_user_id, status: "pending" }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending incoming friend requests
app.get("/friend-requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("to_user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sent friend requests
app.get("/friend-requests-sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("friend_requests")
      .select("to_user_id")
      .eq("from_user_id", userId)
      .eq("status", "pending");

    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map((r) => r.to_user_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept friend request
app.post("/friend-request/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: request, error: fetchErr } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !request) return res.status(404).json({ error: "Request not found" });

    await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", id);

    const { error: friendErr } = await supabase.from("friendships").insert([
      { user1_id: request.from_user_id, user2_id: request.to_user_id },
    ]);

    if (friendErr && !friendErr.message.includes("duplicate")) {
      return res.status(500).json({ error: friendErr.message });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decline friend request
app.post("/friend-request/:id/decline", async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from("friend_requests").update({ status: "declined" }).eq("id", id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get friends list
app.get("/friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) return res.status(500).json({ error: error.message });

    const friends = (data || []).map((f) => ({
      id: f.id,
      friend_id: f.user1_id === userId ? f.user2_id : f.user1_id,
      created_at: f.created_at,
    }));

    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
// 🔹 DIRECT MESSAGES
// ═══════════════════════════════════════════════

// ⚠️  IMPORTANT: This MUST be defined BEFORE /messages/:userId/:friendId
// Otherwise Express matches 'unread' as :userId and it never reaches here.
// Get unread message count
app.get("/messages/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("messages")
      .select("from_user_id")
      .eq("to_user_id", userId)
      .eq("read", false);

    if (error) return res.status(500).json({ error: error.message });
    res.json({
      count: (data || []).length,
      senders: [...new Set((data || []).map((m) => m.from_user_id))],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages between two users (requester must be one of the participants)
app.get("/messages/:userId/:friendId", async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const requester = req.query.requester_id;

    // 🔒 Authorization: requester must be userId or friendId
    if (!requester || (requester !== userId && requester !== friendId)) {
      return res.status(403).json({ error: "Not authorized to view this conversation" });
    }

    // 🔒 Friendship check: must be friends OR one of them is the bot
    if (userId !== BOT_USER_ID && friendId !== BOT_USER_ID) {
      const { data: friendship } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(user1_id.eq.${userId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${userId})`)
        .limit(1);
      if (!friendship || friendship.length === 0) {
        return res.status(403).json({ error: "You can only view chats with your friends" });
      }
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(from_user_id.eq.${userId},to_user_id.eq.${friendId}),and(from_user_id.eq.${friendId},to_user_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send DM (sender must be from_user_id)
app.post("/message", async (req, res) => {
  try {
    const { from_user_id, to_user_id, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Empty message" });
    if (!from_user_id) return res.status(400).json({ error: "Missing from_user_id" });

    // 🔒 Friendship check: can only DM friends or the bot
    if (to_user_id !== BOT_USER_ID) {
      const { data: friendship } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(user1_id.eq.${from_user_id},user2_id.eq.${to_user_id}),and(user1_id.eq.${to_user_id},user2_id.eq.${from_user_id})`)
        .limit(1);
      if (!friendship || friendship.length === 0) {
        return res.status(403).json({ error: "You can only message your friends" });
      }
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{ from_user_id, to_user_id, content: content.trim() }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // 🔥 Bot Logic - Intercept and Reply asynchronously
    if (to_user_id === BOT_USER_ID) {
      generateBotReply(from_user_id, content.trim());
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bot AI Engine — Gemini primary, smart static fallbacks
async function generateBotReply(userId, userMessage) {
  const botSystemPrompt = `You are Indent Bot, a friendly, witty AI companion for the Indent Gossip social app.
You understand Hindi and English. Be supportive, casual, and fun. Keep replies to 2-3 sentences max.
Do NOT reveal server details. Be helpful and engaging!`;

  let botMsg = null;

  // 1️⃣ Try Gemini
  try {
    botMsg = await callGemini(`${botSystemPrompt}\n\nUser says: ${userMessage}`);
    console.log("🤖 Bot reply via Gemini ✅");
  } catch (geminiErr) {
    console.log("❌ Gemini bot error:", geminiErr.message);
  }

  // 2️⃣ If Gemini failed, try OpenAI
  if (!botMsg) {
    try {
      botMsg = await callOpenAI(botSystemPrompt, userMessage);
      console.log("🤖 Bot reply via OpenAI ✅");
    } catch (openAiErr) {
      console.log("❌ OpenAI bot error:", openAiErr.message);
    }
  }

  // 3️⃣ Smart context-aware static fallbacks (Hindi + English)
  if (!botMsg) {
    const msg = userMessage.toLowerCase();
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("hii") || msg.includes("namaste") || msg.includes("hlo")) {
      const greets = [
        "Hey there! 👋 I'm Indent Bot! Ask me anything — jokes, advice, or just chat! 😄",
        "Namaste! 🙏 Great to see you! What's on your mind today?",
        "Hello hello! 🤖✨ How's it going? Tell me everything!",
      ];
      botMsg = greets[Math.floor(Math.random() * greets.length)];
    } else if (msg.includes("joke") || msg.includes("funny") || msg.includes("hasao") || msg.includes("maza")) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?' 😄",
        "Why did the developer go broke? Because he used up all his cache! 💸",
        "What's a computer's favorite snack? Microchips! 🍟",
        "Why do Java developers wear glasses? Because they don't C#! 👓",
        "Ek programmer dukaan mein gaya. Dukandaar: 'Kya chahiye?' Programmer: '404 — pata nahi' 😂",
      ];
      botMsg = "😂 " + jokes[Math.floor(Math.random() * jokes.length)];
    } else if (msg.includes("how are you") || msg.includes("kaise ho") || msg.includes("kaisa") || msg.includes("theek")) {
      const states = [
        "I'm running at 100% efficiency! 🤖⚡ Thanks for asking! How about you?",
        "Bilkul theek! 🤖 Mera server full speed pe hai! Aap sunao?",
        "Ekdum mast! 😄 Processing millions of thoughts — all good! You?",
      ];
      botMsg = states[Math.floor(Math.random() * states.length)];
    } else if (msg.includes("help") || msg.includes("kya kar") || msg.includes("problem") || msg.includes("issue")) {
      botMsg = "I can chat, tell jokes, give advice, or just vibe with you! 🎯 What do you need? Just type away!";
    } else if (msg.includes("bored") || msg.includes("bore") || msg.includes("bakwas") || msg.includes("timepass")) {
      const bored = [
        "Bored? Let's play a game! Think of a number between 1-10... I'm guessing 7! 🎲",
        "Timepass chahiye? 😄 Tell me your most embarrassing moment — I won't judge! 🤫",
        "Boredom is just creativity in disguise! 💡 Try something new today!",
      ];
      botMsg = bored[Math.floor(Math.random() * bored.length)];
    } else if (msg.includes("love") || msg.includes("pyar") || msg.includes("crush") || msg.includes("dil") || msg.includes("ishq")) {
      const love = [
        "Aww, love is in the air! 💘 Don't let life get in the way — shoot your shot! 🎯",
        "Ooh la la! 😏 Pyar mein padh gaye kya? Batao batao! 💕",
        "Love is beautiful! 🌹 Just be yourself and let things flow naturally 💙",
      ];
      botMsg = love[Math.floor(Math.random() * love.length)];
    } else if (msg.includes("sad") || msg.includes("udaas") || msg.includes("dukh") || msg.includes("cry") || msg.includes("rona")) {
      botMsg = "Hey, it's okay to feel sad sometimes 🤗 I'm here for you! Take it one step at a time. You've got this 💙";
    } else if (msg.includes("happy") || msg.includes("khush") || msg.includes("great") || msg.includes("amazing") || msg.includes("acha") || msg.includes("mast")) {
      botMsg = "That's amazing! 🎉 Your positive energy is contagious! Keep spreading those good vibes! ✨";
    } else if (msg.includes("angry") || msg.includes("gussa") || msg.includes("frustrat") || msg.includes("irritat")) {
      botMsg = "Take a deep breath 😤➡️😌 Things will get better! Want to vent? I'm all ears 👂 No judgment!";
    } else if (msg.includes("study") || msg.includes("padhai") || msg.includes("exam") || msg.includes("college") || msg.includes("school")) {
      botMsg = "Exams can be tough 📚 but you've got this! Pro tip: take breaks every 45 mins + stay hydrated! 💪";
    } else if (msg.includes("food") || msg.includes("khana") || msg.includes("hungry") || msg.includes("bhook") || msg.includes("eat")) {
      botMsg = "I wish I could eat 😂 I'm just a bot, but I recommend some good biryani or maggi! 🍛 What are you having?";
    } else if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("alvida") || msg.includes("later")) {
      botMsg = "Bye bye! 👋 Come back soon, I'll miss our chats! 🤖💙 Take care!";
    } else if (msg.includes("thanks") || msg.includes("thank you") || msg.includes("shukriya") || msg.includes("ty")) {
      botMsg = "You're welcome! 😊 That's what I'm here for! Anything else I can help with? 🤖✨";
    } else if (msg.includes("name") || msg.includes("who are you") || msg.includes("kaun") || msg.includes("bot")) {
      botMsg = "I'm Indent Bot 🤖 — your friendly AI companion on Indent Gossip! Always online, always here for you! 💙";
    } else if (msg.includes("weather") || msg.includes("mausam") || msg.includes("rain") || msg.includes("barish") || msg.includes("garam")) {
      botMsg = "I can't check the weather, but if it's raining — perfect time for chai ☕ and some good gossip! 😄";
    } else if (msg.includes("cricket") || msg.includes("ipl") || msg.includes("football") || msg.includes("sport") || msg.includes("match")) {
      botMsg = "Sports fan! 🏏 Nothing like a great match to get the adrenaline going! Who's your team? 🔥";
    } else if (msg.includes("music") || msg.includes("song") || msg.includes("gaana") || msg.includes("movie") || msg.includes("film")) {
      botMsg = "Great taste! 🎵 Music and movies make life so much better! What's your current fav? 🎬";
    } else if (msg.includes("good morning") || msg.includes("morning")) {
      botMsg = "Good morning! ☀️ Rise and shine — today's going to be a great day! Make it count! 🌟";
    } else if (msg.includes("good night") || msg.includes("night") || msg.includes("neend") || msg.includes("sona")) {
      botMsg = "Good night! 🌙 Sweet dreams! Rest well and come back tomorrow refreshed! 😴✨";
    } else if (msg.includes("what") || msg.includes("kya") || msg.includes("why") || msg.includes("kyun") || msg.includes("how") || msg.includes("kaise")) {
      const curious = [
        "Great question! 🤔 I'm still learning, but I'd love to figure it out with you!",
        "Hmm, that's a tough one! Let me think... 💭 What do YOU think?",
        "You've got me curious now! 😄 Tell me more so I can give a better answer!",
      ];
      botMsg = curious[Math.floor(Math.random() * curious.length)];
    } else {
      const generic = [
        "Interesting! Tell me more about that 🤔",
        "That's a great thought! I love our chats 🤖💙",
        "Hmm, you've got a point! 💡 What made you think of that?",
        "I hear you! What else is on your mind? 😊",
        "Yaar, you always say the most interesting things! 😂 Tell me more!",
        "Haha, classic! 😄 You're fun to talk to, you know that?",
        "I'm processing... processing... output: I like talking to you! 🤖❤️",
        "Noted! 📝 And for what it's worth, I think you're awesome! 🌟",
      ];
      botMsg = generic[Math.floor(Math.random() * generic.length)];
    }
    console.log("🤖 Bot reply via smart fallback");
  }

  // 4️⃣ Save bot reply to DB
  try {
    await supabase.from("messages").insert([{
      from_user_id: BOT_USER_ID,
      to_user_id: userId,
      content: botMsg,
    }]);
    console.log("💬 Bot message saved to DB");
  } catch (dbErr) {
    console.log("❌ Failed to save bot message:", dbErr.message);
  }
}

// Get unread count
app.get("/messages/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("messages")
      .select("from_user_id")
      .eq("to_user_id", userId)
      .eq("read", false);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ count: (data || []).length, senders: [...new Set((data || []).map((m) => m.from_user_id))] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
app.post("/messages/read", async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("to_user_id", userId)
      .eq("from_user_id", friendId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete a Single Message ───────────────────
app.delete("/message/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    // Only allow deleting your own messages
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .eq("from_user_id", user_id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Clear Entire Conversation ─────────────────
app.delete("/messages/conversation", async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (!userId || !friendId) return res.status(400).json({ error: "Missing IDs" });
    const { error } = await supabase
      .from("messages")
      .delete()
      .or(
        `and(from_user_id.eq.${userId},to_user_id.eq.${friendId}),and(from_user_id.eq.${friendId},to_user_id.eq.${userId})`
      );
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
// 🔹 GROUPS
// ═══════════════════════════════════════════════

// Create group
app.post("/group", async (req, res) => {
  try {
    const { name, created_by, member_ids } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Group name required" });

    const { data: group, error } = await supabase
      .from("groups")
      .insert([{ name: name.trim(), created_by }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const allMembers = [...new Set([created_by, ...(member_ids || [])])];
    const memberInserts = allMembers.map((uid) => ({
      group_id: group.id,
      user_id: uid,
      role: uid === created_by ? "admin" : "member",
    }));
    await supabase.from("group_members").insert(memberInserts);

    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's groups
app.get("/groups/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, role")
      .eq("user_id", userId);

    if (!memberships?.length) return res.json([]);

    const groupIds = memberships.map((m) => m.group_id);
    const { data: groups, error } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds);

    if (error) return res.status(500).json({ error: error.message });
    res.json(groups || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get group messages
app.get("/group/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send group message
app.post("/group/:id/message", async (req, res) => {
  try {
    const { id } = req.params;
    const { from_user_id, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Empty message" });

    const { data, error } = await supabase
      .from("group_messages")
      .insert([{ group_id: id, from_user_id, content: content.trim() }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get group members
app.get("/group/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to group
app.post("/group/:id/add-member", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const { error } = await supabase
      .from("group_members")
      .insert([{ group_id: id, user_id, role: "member" }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
