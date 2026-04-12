const axios = require("axios");
const vision = require("@google-cloud/vision");

// Initialize Google Vision Client
let client;
try {
  client = new vision.ImageAnnotatorClient();
  console.log("✅ Google Vision API initialized");
} catch (err) {
  console.log("⚠️ Google Vision API not available:", err.message);
}

// 🔥 OPENAI MODERATION API (FREE & POWERFUL)
const checkTextAI = async (text) => {
  try {
    console.log("🔍 Analyzing text with OpenAI Moderation...");

    const response = await axios.post(
      "https://api.openai.com/v1/moderations",
      {
        input: text,
        model: "text-moderation-latest",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.results[0];
    const scores = result.category_scores;

    console.log("📊 Moderation scores:", scores);

    // Check if flagged (high toxicity)
    if (result.flagged) {
      // Find which category triggered it
      let highCategory = "";
      let highScore = 0;
      for (let [key, value] of Object.entries(scores)) {
        if (value > highScore) {
          highScore = value;
          highCategory = key;
        }
      }

      console.log(`❌ FLAGGED - High ${highCategory}: ${highScore.toFixed(2)}`);
      return { safe: false, blocked: true, category: highCategory, score: highScore };
    }

    // Check if moderate toxicity (not flagged but high scores)
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0.5) {
      console.log("⚠️ MODERATE TOXICITY - MASKING");
      return { safe: false, blocked: false, masked: true, score: maxScore, text: maskText(text) };
    }

    console.log("✅ Text is clean");
    return { safe: true, blocked: false, masked: false, score: maxScore, text: text };
  } catch (err) {
    console.log("❌ Moderation error:", err.message);
    // On error, allow post
    return { safe: true, blocked: false, masked: false, text: text };
  }
};

// 🔥 MASK ABUSIVE WORDS
const maskText = (text) => {
  const abusiveWords = [
    "fuck", "shit", "bitch", "ass", "cunt", "damn", "bastard", "asshole",
    "motherfucker", "dickhead", "moron", "retard", "whore", "slut",
    "gaand", "maa", "baap", "chutiya", "behenchod", "madarchod",
    "haramzada", "bhosda", "tharki", "rand", "randi", "bhen ke lund",
    "lund", "chut", "gadi", "nakli", "hijra", "chakka", "maderchod",
  ];

  let masked = text;
  for (let word of abusiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    masked = masked.replace(
      regex,
      (match) => match[0] + "*".repeat(match.length - 1)
    );
  }
  return masked;
};

// 🔥 IMAGE MODERATION (Google Vision API)
const checkImageSafety = async (imageUrl) => {
  try {
    if (!client) {
      console.log("⚠️ Google Vision not initialized, skipping image check");
      return true;
    }

    console.log("🔍 Checking image safety for:", imageUrl);

    const [result] = await client.safeSearchDetection(imageUrl);
    const safe = result.safeSearchAnnotation;

    console.log("📊 Image safety scores:", {
      adult: safe.adult,
      violence: safe.violence,
      racy: safe.racy,
    });

    const isSafe = (
      safe.adult !== "VERY_LIKELY" &&
      safe.violence !== "VERY_LIKELY" &&
      safe.racy !== "VERY_LIKELY"
    );

    if (!isSafe) {
      console.log("❌ UNSAFE IMAGE BLOCKED - Adult:", safe.adult, "Racy:", safe.racy);
      return false; // BLOCK unsafe images
    }

    console.log("✅ Image is safe");
    return true;
  } catch (err) {
    console.log("❌ Image moderation error:", err.message);
    // On error, REJECT to be safe
    return false;
  }
};

module.exports = {
  checkTextAI,
  checkImageSafety,
};
