require('dotenv').config({path: './.env'});
const axios = require('axios');
async function test() {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "hello" },
          { role: "user", content: "hi" }
        ],
        max_tokens: 150
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );
    console.log(response.data.choices[0].message.content.trim());
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
