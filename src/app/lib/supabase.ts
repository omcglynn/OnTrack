import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Security check: Ensure we're not using the secret key
if (supabaseAnonKey && (supabaseAnonKey.includes('service_role') || supabaseAnonKey.startsWith('sb_secret_'))) {
  console.error('❌ SECURITY ERROR: You are using a SECRET key in the browser!');
  console.error('Your key starts with "sb_secret_" - this is WRONG for browser use.');
  console.error('Use the ANON/PUBLIC key instead (starts with "sb_publishable_" or "eyJ...").');
  console.error('Find it in: Supabase Dashboard → Project Settings → API → anon/public key');
  throw new Error('Invalid API key: Secret keys (sb_secret_*) cannot be used in the browser. Use the anon/public key.');
}

// Create client with rate limiting disabled for development
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'ontrack-app',
        },
      },
      // Disable rate limiting for development
      db: {
        schema: 'public',
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
};

// Database types
export interface University {
  id: string;
  name: string;
  aliases: string[];
  created_at: string;
}

export interface Major {
  id: string;
  name: string;
  uniId: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  university_id: string;
  major_id: string;
  career_goal: string;
  created_at: string;
  updated_at: string;
}