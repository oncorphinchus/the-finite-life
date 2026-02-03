export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          minus_one_count: number | null
          parent_id: string | null
          sort_order: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          minus_one_count?: number | null
          parent_id?: string | null
          sort_order?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          minus_one_count?: number | null
          parent_id?: string | null
          sort_order?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          birth_date: string
          created_at: string | null
          id: string
          life_expectancy_weeks: number | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          id?: string
          life_expectancy_weeks?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          id?: string
          life_expectancy_weeks?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
export type UserSettingsInsert = Database["public"]["Tables"]["user_settings"]["Insert"];
export type UserSettingsUpdate = Database["public"]["Tables"]["user_settings"]["Update"];

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

// Status type for type-safe status checks
export type TaskStatus = "pending" | "in_progress" | "completed" | "archived";