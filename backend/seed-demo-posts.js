// 🌱 Seed Demo Posts Script
// Run: node seed-demo-posts.js
// This seeds demo posts from Indent Bot so there's content on first load.

require("dotenv").config({ path: "./.env" });
const supabase = require("./supabaseClient");

const BOT_USER_ID = "00000000-0000-0000-0000-000000000001";

const DEMO_POSTS = [
  {
    user_id: BOT_USER_ID,
    content: `🤖 Welcome to Indent Gossip! 🎉\n\nThe anonymous social platform where you can share thoughts, confessions, and memes — safely and anonymously. Your identity stays hidden (only your UID is shown).\n\n✨ Features: Post | Like | Comment | Chat with friends | Talk to me, the bot!\n\nGo ahead — what's on your mind? 👀`,
    image_url: null,
  },
  {
    user_id: BOT_USER_ID,
    content: `🔥 Confession of the day:\n\n"I told my entire team I was busy in a meeting when I was actually watching a 3-hour documentary about penguins." 🐧\n\nNo regrets. Penguins are important.\n\n#AnonymousConfessions #IndentGossip`,
    image_url: null,
  },
  {
    user_id: BOT_USER_ID,
    content: `💡 Tech Tip of the Day:\n\nIf your code works but you don't know why — that's not a bug, that's a feature.\n\nIf it doesn't work and you don't know why — that's a Tuesday.\n\n👨‍💻 Happy coding, everyone!\n\n#ProgrammerLife #IndentGossip`,
    image_url: null,
  },
  {
    user_id: BOT_USER_ID,
    content: `😂 Daily Joke:\n\nA programmer's wife tells him: "Go to the store and get a loaf of bread. If they have eggs, get a dozen."\n\nHe comes home with 12 loaves of bread.\n\n"They had eggs." 🥚\n\n#DadJoke #ProgrammerHumor #IndentGossip`,
    image_url: null,
  },
  {
    user_id: BOT_USER_ID,
    content: `🌍 Anonymous Poll — Vote in the comments!\n\nWhat's your go-to stress reliever? 👇\n\n😴 Sleep everything away\n🎮 Gaming marathon\n🍕 Stress eating (pizza FTW)\n📺 Binge-watching shows\n💪 Working out\n\nComment your pick! No judgment here 🫶\n\n#Poll #IndentGossip`,
    image_url: null,
  },
  {
    user_id: BOT_USER_ID,
    content: `📚 Study Motivation (or the lack of it) 😅\n\n"I'll start studying after this one YouTube video."\n\n*3 hours later*\n\n"How did I end up watching a documentary about deep sea creatures at 2 AM?"\n\nWe've all been there. You're not alone! 🫂\n\n#StudentLife #Relatable #IndentGossip`,
    image_url: null,
  },
  {
    user_id: BOT_USER_ID,
    content: `🎭 Late Night Thought:\n\nIsn't it wild that we're all just spinning on a rock in space, worrying about what people think of us?\n\nAnd yet here we are, posting anonymously on the internet at midnight. Peak humanity. 🌙\n\n#DeepThoughts #Philosophy #IndentGossip`,
    image_url: null,
  },
  {
    user_id: BOT_USER_ID,
    content: `🏆 Hot Take:\n\nPeople who say "I'll sleep when I'm dead" have clearly never felt the pure bliss of a Sunday nap at 3 PM with the fan on and the curtains closed. 💤\n\nThat's not laziness. That's peak human achievement.\n\n#HotTake #NapCulture #IndentGossip`,
    image_url: null,
  },
];

async function seedDemoPosts() {
  console.log("🌱 Checking existing posts...");

  const { data: existingPosts, error: fetchErr } = await supabase
    .from("posts")
    .select("user_id")
    .eq("user_id", BOT_USER_ID)
    .limit(1);

  if (fetchErr) {
    console.error("❌ Error checking posts:", fetchErr.message);
    return;
  }

  if (existingPosts && existingPosts.length > 0) {
    console.log("✅ Demo posts already exist! Skipping seed.");
    return;
  }

  console.log("📝 Inserting demo posts...");

  const { data, error } = await supabase
    .from("posts")
    .insert(DEMO_POSTS)
    .select();

  if (error) {
    console.error("❌ Failed to seed demo posts:", error.message);
    return;
  }

  console.log(`✅ Successfully seeded ${data.length} demo posts!`);
}

seedDemoPosts();
