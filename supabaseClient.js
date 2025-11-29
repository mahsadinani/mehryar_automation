import { createClient } from "@supabase/supabase-js";

function findEnv(part) {
  for (const k of Object.keys(process.env)) {
    if (k.toLowerCase().includes(part.toLowerCase())) return process.env[k] || "";
  }
  return "";
}

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.Mehryar_Auto_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_Mehryar_Auto_SUPABASE_URL ||
  findEnv("SUPABASE_URL");

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.Mehryar_Auto_SUPABASE_SERVICE_ROLE_KEY ||
  findEnv("SUPABASE_SERVICE_ROLE_KEY");

const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.Mehryar_Auto_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_Mehryar_Auto_SUPABASE_ANON_KEY ||
  findEnv("SUPABASE_ANON_KEY");

const key = serviceKey || anonKey || "";
const enabled = !!url && !!key;
export const supabase = enabled ? createClient(url, key, { auth: { persistSession: false } }) : null;
