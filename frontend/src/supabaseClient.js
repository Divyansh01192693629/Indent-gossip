import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ozyocfvizvkbnyjsccvu.supabase.co";
const supabaseKey = "sb_publishable_ZrQmlpQ8Q0pNnJglxD30ZQ_AcX-wJIP";

export const supabase = createClient(supabaseUrl, supabaseKey);
