require('dotenv').config({path: './.env'});
const supabase = require('./supabaseClient');

async function test() {
  const { data, error } = await supabase.from('messages').select('*').limit(1);
  console.log("Message:", data);
}
test();
