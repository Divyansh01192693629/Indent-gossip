require("dotenv").config();
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./my-key.json";
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const supabase = require("./supabaseClient");
const { checkTextAI, checkImageSafety } = require("./services/moderation");

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

// 🔹 Upload Image
app.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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
          error: "❌ Abusive content not allowed! Post rejected.",
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

// 🔹 Start Server
app.listen(5000, () => {
  console.log("Server started on 5000 🚀");
});

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
