import { createClient } from "@supabase/supabase-js";

function pick(keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v) return { key: k, value: v };
  }
  for (const k of Object.keys(process.env)) {
    if (keys.some(p => k.toLowerCase().includes(p.toLowerCase()))) {
      const v = process.env[k];
      if (v) return { key: k, value: v };
    }
  }
  return { key: "", value: "" };
}

const urlPick = pick([
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "Mehryar_Auto_SUPABASE_URL",
  "NEXT_PUBLIC_Mehryar_Auto_SUPABASE_URL"
]);

const servicePick = pick([
  "SUPABASE_SERVICE_ROLE_KEY",
  "Mehryar_Auto_SUPABASE_SERVICE_ROLE_KEY"
]);

const anonPick = pick([
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "Mehryar_Auto_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_Mehryar_Auto_SUPABASE_ANON_KEY"
]);

const url = urlPick.value;
const key = servicePick.value || anonPick.value;
const enabled = !!url && !!key;

export const supabaseInfo = {
  enabled,
  urlPresent: !!url,
  keyPresent: !!key,
  urlKey: urlPick.key,
  keyKey: servicePick.key || anonPick.key
};

export const supabase = enabled ? createClient(url, key, { auth: { persistSession: false } }) : null;
