const axios = require("axios");

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Check if Gemini key looks valid (not a placeholder)
const isGeminiAvailable = () =>
  GEMINI_KEY &&
  !GEMINI_KEY.includes("placeYour") &&
  !GEMINI_KEY.includes("placeholder") &&
  GEMINI_KEY.length > 20;

// ─── Gemini text call ───────────────────────────────────────────────────────
const callGeminiText = async (prompt) => {
  const response = await axios.post(
    `${GEMINI_BASE}?key=${GEMINI_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { "Content-Type": "application/json" }, timeout: 10000 }
  );
  return response.data.candidates[0].content.parts[0].text.trim();
};

// ─── Gemini vision call with image buffer (base64) ──────────────────────────
const callGeminiImageBuffer = async (buffer, mimeType, prompt) => {
  const base64 = buffer.toString("base64");
  const response = await axios.post(
    `${GEMINI_BASE}?key=${GEMINI_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType || "image/jpeg", data: base64 } },
          ],
        },
      ],
    },
    { headers: { "Content-Type": "application/json" }, timeout: 20000 }
  );
  return response.data.candidates[0].content.parts[0].text.trim();
};

// ─── Local blacklist (fast, no API needed) ──────────────────────────────────
const maskText = (text) => {
  const abusiveWords = [
    "fuck", "shit", "bitch", "cunt", "bastard", "asshole",
    "motherfucker", "dickhead", "moron", "retard", "whore", "slut",
    "gaand", "chutiya", "behenchod", "madarchod",
    "haramzada", "bhosda", "tharki", "rand", "randi",
    "lund", "chut", "hijra", "chakka", "maderchod",
    "bhosdike", "bhosadike", "harami", "kutiya", "gandu",
    // short slang
    " mc ", " bc ", " bkl ", " mf ",
  ];
  let masked = text;
  for (let word of abusiveWords) {
    const escaped = word.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    masked = masked.replace(regex, (match) => {
      if (match.length <= 4) return match[0] + "*".repeat(match.length - 1);
      return match.substring(0, 4) + "*".repeat(match.length - 4);
    });
  }
  return masked;
};

// ─── TEXT MODERATION ────────────────────────────────────────────────────────
const checkTextAI = async (text) => {
  try {
    // Step 1: Local blacklist always runs first (fast)
    const localMasked = maskText(text);

    // Step 2: Gemini NLP for deeper context-aware check
    if (isGeminiAvailable()) {
      console.log("🔍 Gemini NLP text check...");

      const prompt = `You are a strict content moderator for a social media platform. Analyze the following text for abusive, harassing, or offensive content, including Hindi and Hinglish slang, gaalis, sexual harassment, and hate speech.

Text to analyze: "${text}"

Respond with EXACTLY one of these formats and nothing else:
- CLEAN  →  text is completely acceptable
- MASK: <cleaned_version>  →  mild profanity found; replace bad words with asterisks keeping first letter
- BLOCK  →  severe harassment, sexual abuse, threats, extreme hate speech; must be rejected

Respond in that exact format only.`;

      const result = await callGeminiText(prompt);
      console.log("🤖 Gemini NLP result:", result.substring(0, 100));

      const upper = result.toUpperCase();
      if (upper.startsWith("BLOCK")) {
        return { safe: false, blocked: true, masked: false, text };
      }
      if (upper.startsWith("MASK:")) {
        const maskedText = result.substring(5).trim();
        return { safe: false, blocked: false, masked: true, text: maskedText };
      }
      // CLEAN — still apply local masking as safety net
      if (localMasked !== text) {
        return { safe: false, blocked: false, masked: true, text: localMasked };
      }
      return { safe: true, blocked: false, masked: false, text };
    }

    // Gemini unavailable ─ use local blacklist only
    console.log("⚠️  Gemini unavailable, using local blacklist");
    if (localMasked !== text) {
      return { safe: false, blocked: false, masked: true, text: localMasked };
    }
    return { safe: true, blocked: false, masked: false, text };
  } catch (err) {
    console.log("❌ Text moderation error:", err.message);
    // On any error, fall back to local masking (never block on error)
    const masked = maskText(text);
    if (masked !== text) {
      return { safe: false, blocked: false, masked: true, text: masked };
    }
    return { safe: true, blocked: false, masked: false, text };
  }
};

// ─── IMAGE BUFFER MODERATION (called during upload, before storage) ─────────
const checkImageBuffer = async (buffer, mimeType) => {
  if (!isGeminiAvailable()) {
    console.log("⚠️  Gemini not available — skipping image pre-check");
    return { safe: true, reason: null };
  }

  try {
    console.log("🔍 Gemini Vision — checking image buffer...");

    const prompt = `You are a strict content safety AI for a social media platform. Carefully examine this image.

Reject the image if it contains ANY of these:
- Nudity, sexual or pornographic content
- Graphic violence, gore, or injuries
- Harassment, threatening, or intimidating imagery
- Hate symbols, racist content, or extremist propaganda
- Drug use or illegal activity shown explicitly

Reply with EXACTLY one word only:
SAFE   — if the image is appropriate for all audiences
UNSAFE — if it violates any rule above

One word only, nothing else.`;

    const result = await callGeminiImageBuffer(buffer, mimeType, prompt);
    const word = result.trim().toUpperCase().split(/\s/)[0];
    console.log("🤖 Gemini Vision result:", word);

    if (word === "UNSAFE") {
      return { safe: false, reason: "Image contains unsafe/abusive content" };
    }
    return { safe: true, reason: null };
  } catch (err) {
    console.log("❌ Image buffer check error:", err.message);
    return { safe: true, reason: null }; // Allow on error to avoid blocking users
  }
};

// ─── IMAGE URL MODERATION (secondary check at post-creation time) ───────────
const checkImageSafety = async (imageUrl) => {
  // Try Google Vision first (if credentials are configured)
  try {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "./my-key.json";
    const vision = require("@google-cloud/vision");
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.safeSearchDetection(imageUrl);
    const safe = result.safeSearchAnnotation;

    console.log("📊 Google Vision scores:", {
      adult: safe.adult,
      violence: safe.violence,
      racy: safe.racy,
    });

    const isSafe =
      safe.adult !== "VERY_LIKELY" &&
      safe.adult !== "LIKELY" &&
      safe.racy !== "VERY_LIKELY" &&
      safe.violence !== "VERY_LIKELY" &&
      safe.violence !== "LIKELY";

    if (!isSafe) {
      console.log("❌ Google Vision blocked image — Adult:", safe.adult, "Violence:", safe.violence);
    }
    return isSafe;
  } catch (visionErr) {
    console.log("⚠️  Google Vision unavailable:", visionErr.message);
  }

  // Fallback: download and check with Gemini Vision
  if (isGeminiAvailable()) {
    try {
      console.log("🔍 Gemini Vision fallback — checking image URL...");
      const imgRes = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 12000,
      });
      const buffer = Buffer.from(imgRes.data);
      const mimeType = imgRes.headers["content-type"] || "image/jpeg";
      const result = await checkImageBuffer(buffer, mimeType);
      return result.safe;
    } catch (geminiErr) {
      console.log("❌ Gemini Vision fallback error:", geminiErr.message);
    }
  }

  // If all checks fail, allow (to not block legitimate users)
  console.log("⚠️  No image moderation available — allowing image");
  return true;
};

module.exports = {
  checkTextAI,
  checkImageSafety,
  checkImageBuffer, // NEW: used in /upload-image for pre-upload check
};
