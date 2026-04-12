const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ozyocfvizvkbnyjsccvu.supabase.co";
const supabaseKey = "sb_publishable_ZrQmlpQ8Q0pNnJglxD30ZQ_AcX-wJIP";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
