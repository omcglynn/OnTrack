import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aurpvfwmgwghhpxisssx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YCUk64IvF-J8CXw3OLRF6g_I2p2ebmk';

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
  university_id: string;
  created_at: string;
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