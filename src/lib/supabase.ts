import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          category: 'school' | 'college' | 'professional' | 'researcher';
          branch: string | null;
          domain: string | null;
          current_gpa: number | null;
          expected_gpa: number | null;
          current_study_hours: number | null;
          expected_study_hours: number | null;
          current_self_rating: number | null;
          expected_self_rating: number | null;
          target_date: string | null;
          improvement_areas: string | null;
          motivation: string | null;
          goal_start_date: string | null;
          goal_end_date: string | null;
          ai_study_plan: any | null;
          setup_complete: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          category?: 'school' | 'college' | 'professional' | 'researcher';
          branch?: string | null;
          domain?: string | null;
          current_gpa?: number | null;
          expected_gpa?: number | null;
          current_study_hours?: number | null;
          expected_study_hours?: number | null;
          current_self_rating?: number | null;
          expected_self_rating?: number | null;
          target_date?: string | null;
          improvement_areas?: string | null;
          motivation?: string | null;
          goal_start_date?: string | null;
          goal_end_date?: string | null;
          ai_study_plan?: any | null;
          setup_complete?: boolean;
          email_verified?: boolean;
        };
        Update: {
          name?: string;
          email?: string;
          category?: 'school' | 'college' | 'professional' | 'researcher';
          branch?: string | null;
          domain?: string | null;
          current_gpa?: number | null;
          expected_gpa?: number | null;
          current_study_hours?: number | null;
          expected_study_hours?: number | null;
          current_self_rating?: number | null;
          expected_self_rating?: number | null;
          target_date?: string | null;
          improvement_areas?: string | null;
          motivation?: string | null;
          goal_start_date?: string | null;
          goal_end_date?: string | null;
          ai_study_plan?: any | null;
          setup_complete?: boolean;
          email_verified?: boolean;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          duration: number;
          session_type: 'focus' | 'break' | 'review';
          notes: string | null;
          goal_progress: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          duration: number;
          session_type?: 'focus' | 'break' | 'review';
          notes?: string | null;
          goal_progress?: number;
        };
        Update: {
          subject?: string;
          duration?: number;
          session_type?: 'focus' | 'break' | 'review';
          notes?: string | null;
          goal_progress?: number;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          front: string;
          back: string;
          subject: string;
          difficulty: 'easy' | 'medium' | 'hard';
          last_reviewed: string;
          next_review: string;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          front: string;
          back: string;
          subject: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          last_reviewed?: string;
          next_review?: string;
          review_count?: number;
        };
        Update: {
          front?: string;
          back?: string;
          subject?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          last_reviewed?: string;
          next_review?: string;
          review_count?: number;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          subject: string;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          subject: string;
          tags?: string[] | null;
        };
        Update: {
          title?: string;
          content?: string;
          subject?: string;
          tags?: string[] | null;
          updated_at?: string;
        };
      };
      study_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          subject: string;
          admin_id: string;
          max_members: number;
          is_private: boolean;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          subject: string;
          admin_id: string;
          max_members?: number;
          is_private?: boolean;
          tags?: string[] | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          subject?: string;
          max_members?: number;
          is_private?: boolean;
          tags?: string[] | null;
        };
      };
      doubts: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          context: string | null;
          subject: string | null;
          solution: any | null;
          status: 'pending' | 'solved' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          context?: string | null;
          subject?: string | null;
          solution?: any | null;
          status?: 'pending' | 'solved' | 'archived';
        };
        Update: {
          question?: string;
          context?: string | null;
          subject?: string | null;
          solution?: any | null;
          status?: 'pending' | 'solved' | 'archived';
          updated_at?: string;
        };
      };
    };
  };
}