/**
 * Supabase client configuration
 * Central setup for database and authentication
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduledTask } from '../scheduling/SchedulingService';

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with React Native configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence
    storage: AsyncStorage,
    // Auto refresh tokens
    autoRefreshToken: true,
    // Persist session across app restarts
    persistSession: true,
    // Detect session changes
    detectSessionInUrl: false,
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'blob-ai-mobile',
    },
  },
  // Real-time configuration for live updates
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          onboarding_step: number;
          chronotype: "morning" | "evening" | "flexible" | null;
          work_style: "deep_focus" | "multitasking" | "balanced" | null;
          motivation_type: "intrinsic" | "extrinsic" | "mixed" | null;
          work_start_time: string | null;
          work_end_time: string | null;
          break_duration: number;
          ai_personality: any;
          user_preferences: any;
          xp_total: number;
          current_level: number;
          current_streak: number;
          longest_streak: number;
          calendar_connected: boolean;
          calendar_provider: string | null;
          calendar_sync_token: string | null;
          last_calendar_sync: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          chronotype?: "morning" | "evening" | "flexible" | null;
          work_style?: "deep_focus" | "multitasking" | "balanced" | null;
          motivation_type?: "intrinsic" | "extrinsic" | "mixed" | null;
          work_start_time?: string | null;
          work_end_time?: string | null;
          break_duration?: number;
          ai_personality?: any;
          user_preferences?: any;
          xp_total?: number;
          current_level?: number;
          current_streak?: number;
          longest_streak?: number;
          calendar_connected?: boolean;
          calendar_provider?: string | null;
          calendar_sync_token?: string | null;
          last_calendar_sync?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          chronotype?: "morning" | "evening" | "flexible" | null;
          work_style?: "deep_focus" | "multitasking" | "balanced" | null;
          motivation_type?: "intrinsic" | "extrinsic" | "mixed" | null;
          work_start_time?: string | null;
          work_end_time?: string | null;
          break_duration?: number;
          ai_personality?: any;
          user_preferences?: any;
          xp_total?: number;
          current_level?: number;
          current_streak?: number;
          longest_streak?: number;
          calendar_connected?: boolean;
          calendar_provider?: string | null;
          calendar_sync_token?: string | null;
          last_calendar_sync?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          tasks: ScheduledTask[];
          total_scheduled_hours: number;
          is_generated: boolean;
          generated_at: string;
          last_modified: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          date: string;
          tasks: ScheduledTask[];
          total_scheduled_hours?: number;
          is_generated?: boolean;
          generated_at?: string;
          last_modified?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          tasks?: ScheduledTask[];
          total_scheduled_hours?: number;
          is_generated?: boolean;
          generated_at?: string;
          last_modified?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      schedule_with_user: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          tasks: ScheduledTask[];
          total_scheduled_hours: number;
          is_generated: boolean;
          generated_at: string;
          last_modified: string;
          created_at: string;
          full_name: string | null;
          chronotype: "morning" | "evening" | "flexible" | null;
          work_style: "deep_focus" | "multitasking" | "balanced" | null;
          work_start_time: string | null;
          work_end_time: string | null;
          break_duration: number;
          timezone: string;
          ai_personality: any;
        };
      };
    };
  };
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
  
  return data;
};

export default supabase;