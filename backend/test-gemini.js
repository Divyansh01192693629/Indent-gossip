require('dotenv').config({path: './.env'});
const axios = require('axios');
async function test() {
  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    console.log('Key length:', GEMINI_KEY ? GEMINI_KEY.length : 0);
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
      { contents: [{ parts: [{ text: 'Hello' }] }] },
      { headers: { 'Content-Type': 'application/json' }, timeout: 12000 }
    );
    console.log(response.data.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
