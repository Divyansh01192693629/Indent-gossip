require('dotenv').config({path: './.env'});
const supabase = require('./supabaseClient');

const BOT_USER_ID = "00000000-0000-0000-0000-000000000001";

async function seedBotUser() {
  try {
    // Try upsert — if row already exists, ignore
    const { data, error } = await supabase
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
    console.log("Upsert result:", { data, error });
    
    // verify it's there
    const res2 = await supabase.from("users").select("*").eq("id", BOT_USER_ID);
    console.log("Verify result:", res2.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
seedBotUser();
