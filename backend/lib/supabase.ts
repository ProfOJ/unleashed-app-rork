import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || 
    supabaseUrl === 'your_supabase_project_url' || 
    supabaseServiceKey === 'your_supabase_service_role_key') {
  console.error('❌ Supabase is not properly configured!');
  console.error('Please update your .env file with valid Supabase credentials.');
  console.error('Get your credentials from: https://supabase.com/dashboard');
}

export const supabase = supabaseUrl && supabaseServiceKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseServiceKey !== 'your_supabase_service_role_key'
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export type Database = {
  public: {
    Tables: {
      witness_profiles: {
        Row: {
          id: string;
          name: string;
          contact: string;
          role: string;
          photo_uri: string | null;
          country: string | null;
          district: string | null;
          assembly: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact: string;
          role: string;
          photo_uri?: string | null;
          country?: string | null;
          district?: string | null;
          assembly?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact?: string;
          role?: string;
          photo_uri?: string | null;
          country?: string | null;
          district?: string | null;
          assembly?: string | null;
          updated_at?: string;
        };
      };
      testimonies: {
        Row: {
          id: string;
          witness_profile_id: string;
          tell_online: boolean;
          tell_in_person: boolean;
          go_workplace: boolean;
          go_school: boolean;
          go_neighborhood: boolean;
          heard: string[];
          seen: string[];
          experienced: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          witness_profile_id: string;
          tell_online?: boolean;
          tell_in_person?: boolean;
          go_workplace?: boolean;
          go_school?: boolean;
          go_neighborhood?: boolean;
          heard?: string[];
          seen?: string[];
          experienced?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          witness_profile_id?: string;
          tell_online?: boolean;
          tell_in_person?: boolean;
          go_workplace?: boolean;
          go_school?: boolean;
          go_neighborhood?: boolean;
          heard?: string[];
          seen?: string[];
          experienced?: string[];
          updated_at?: string;
        };
      };
      souls: {
        Row: {
          id: string;
          witness_profile_id: string;
          name: string;
          contact: string | null;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          notes: string | null;
          handed_to: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          witness_profile_id: string;
          name: string;
          contact?: string | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          handed_to?: string | null;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          witness_profile_id?: string;
          name?: string;
          contact?: string | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          handed_to?: string | null;
          date?: string;
          updated_at?: string;
        };
      };
      witness_cards: {
        Row: {
          id: string;
          witness_profile_id: string;
          card_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          witness_profile_id: string;
          card_data: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          witness_profile_id?: string;
          card_data?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      user_points: {
        Row: {
          id: string;
          witness_profile_id: string;
          total_points: number;
          testimonies_count: number;
          testimonies_seen_count: number;
          testimonies_heard_count: number;
          testimonies_experienced_count: number;
          souls_count: number;
          shares_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          witness_profile_id: string;
          total_points?: number;
          testimonies_count?: number;
          testimonies_seen_count?: number;
          testimonies_heard_count?: number;
          testimonies_experienced_count?: number;
          souls_count?: number;
          shares_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          witness_profile_id?: string;
          total_points?: number;
          testimonies_count?: number;
          testimonies_seen_count?: number;
          testimonies_heard_count?: number;
          testimonies_experienced_count?: number;
          souls_count?: number;
          shares_count?: number;
          updated_at?: string;
        };
      };
      point_transactions: {
        Row: {
          id: string;
          witness_profile_id: string;
          action_type: string;
          points: number;
          description: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          witness_profile_id: string;
          action_type: string;
          points: number;
          description?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          witness_profile_id?: string;
          action_type?: string;
          points?: number;
          description?: string | null;
          metadata?: Record<string, unknown> | null;
        };
      };
    };
  };
};
