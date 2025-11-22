import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const enabled = !!url && !!key;
export const supabase = enabled ? createClient(url, key, { auth: { persistSession: false } }) : null;