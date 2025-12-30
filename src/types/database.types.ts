export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          timezone: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goal_categories: {
        Row: {
          id: string
          name_ru: string
          name_en: string
          icon: string | null
          color: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name_ru: string
          name_en: string
          icon?: string | null
          color?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name_ru?: string
          name_en?: string
          icon?: string | null
          color?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category_id: string | null
          custom_category: string | null
          progress: number
          start_date: string
          deadline: string
          priority: 'low' | 'medium' | 'high'
          completed: boolean
          is_expanded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category_id?: string | null
          custom_category?: string | null
          progress?: number
          start_date: string
          deadline: string
          priority?: 'low' | 'medium' | 'high'
          completed?: boolean
          is_expanded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category_id?: string | null
          custom_category?: string | null
          progress?: number
          start_date?: string
          deadline?: string
          priority?: 'low' | 'medium' | 'high'
          completed?: boolean
          is_expanded?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "goal_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_events: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          title: string
          description: string | null
          date: string
          color: string
          event_type: 'work' | 'personal' | 'health' | 'learning' | 'completion' | 'finance'
          completed: boolean
          amount: number | null
          currency: string
          is_completion_day: boolean
          completion_day_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          title: string
          description?: string | null
          date: string
          color: string
          event_type: 'work' | 'personal' | 'health' | 'learning' | 'completion' | 'finance'
          completed?: boolean
          amount?: number | null
          currency?: string
          is_completion_day?: boolean
          completion_day_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          title?: string
          description?: string | null
          date?: string
          color?: string
          event_type?: 'work' | 'personal' | 'health' | 'learning' | 'completion' | 'finance'
          completed?: boolean
          amount?: number | null
          currency?: string
          is_completion_day?: boolean
          completion_day_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_goal_id_fkey"
            columns: ["goal_id"]
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          theme: 'light' | 'dark' | 'auto'
          notifications_enabled: boolean
          week_starts_on_monday: boolean
          daily_reminder_time: string
          weekly_report: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          theme?: 'light' | 'dark' | 'auto'
          notifications_enabled?: boolean
          week_starts_on_monday?: boolean
          daily_reminder_time?: string
          weekly_report?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme?: 'light' | 'dark' | 'auto'
          notifications_enabled?: boolean
          week_starts_on_monday?: boolean
          daily_reminder_time?: string
          weekly_report?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_goal_progress: {
        Args: {
          p_goal_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Экспортируем типы для удобства
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']
export type GoalCategory = Database['public']['Tables']['goal_categories']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']