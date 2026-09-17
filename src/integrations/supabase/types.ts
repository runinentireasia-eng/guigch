export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      organizer_directory: {
        Row: {
          org_name: string
          organizer_id: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          org_name: string
          organizer_id: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          org_name?: string
          organizer_id?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      organizer_profiles: {
        Row: {
          admin_notes: string
          contact_person: string
          created_at: string
          email: string
          id: string
          org_name: string
          phone: string
          previous_event_url: string
          proof: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["organizer_status"]
          updated_at: string
          user_id: string
          website: string
        }
        Insert: {
          admin_notes?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          org_name: string
          phone?: string
          previous_event_url?: string
          proof?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["organizer_status"]
          updated_at?: string
          user_id: string
          website?: string
        }
        Update: {
          admin_notes?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          org_name?: string
          phone?: string
          previous_event_url?: string
          proof?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["organizer_status"]
          updated_at?: string
          user_id?: string
          website?: string
        }
        Relationships: []
      }
      race_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          note: string
          race_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          note?: string
          race_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          note?: string
          race_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "race_audit_log_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      race_reports: {
        Row: {
          created_at: string
          id: string
          race_id: string | null
          reason: string
          reported_by: string | null
          reporter_email: string
          resolved: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          race_id?: string | null
          reason: string
          reported_by?: string | null
          reporter_email?: string
          resolved?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          race_id?: string | null
          reason?: string
          reported_by?: string | null
          reporter_email?: string
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "race_reports_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      race_suggestions: {
        Row: {
          admin_notes: string
          created_at: string
          id: string
          link: string
          location: string
          notes: string
          organizer_name: string
          race_date: string | null
          race_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["suggestion_status"]
          submitted_by: string | null
          submitter_email: string
          submitter_name: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string
          created_at?: string
          id?: string
          link?: string
          location?: string
          notes?: string
          organizer_name?: string
          race_date?: string | null
          race_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          submitted_by?: string | null
          submitter_email?: string
          submitter_name?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string
          created_at?: string
          id?: string
          link?: string
          location?: string
          notes?: string
          organizer_name?: string
          race_date?: string | null
          race_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          submitted_by?: string | null
          submitter_email?: string
          submitter_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      races: {
        Row: {
          admin_notes: string
          category: string
          course_info: string
          course_map_url: string
          created_at: string
          description_en: string
          description_mn: string
          distances: string[]
          elevation_gain_m: number | null
          id: string
          location_en: string
          location_mn: string
          name_en: string
          name_mn: string
          organizer_en: string
          organizer_mn: string
          owner_id: string | null
          price_info: string
          published_at: string | null
          published_by: string | null
          race_date: string
          reg_deadline: string | null
          register_url: string
          results_info: string
          review_status: Database["public"]["Enums"]["race_review_status"]
          schedule_info: string
          status: string
          updated_at: string
          view_count: number
        }
        Insert: {
          admin_notes?: string
          category: string
          course_info?: string
          course_map_url?: string
          created_at?: string
          description_en?: string
          description_mn?: string
          distances?: string[]
          elevation_gain_m?: number | null
          id?: string
          location_en?: string
          location_mn?: string
          name_en: string
          name_mn: string
          organizer_en?: string
          organizer_mn?: string
          owner_id?: string | null
          price_info?: string
          published_at?: string | null
          published_by?: string | null
          race_date: string
          reg_deadline?: string | null
          register_url?: string
          results_info?: string
          review_status?: Database["public"]["Enums"]["race_review_status"]
          schedule_info?: string
          status?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          admin_notes?: string
          category?: string
          course_info?: string
          course_map_url?: string
          created_at?: string
          description_en?: string
          description_mn?: string
          distances?: string[]
          elevation_gain_m?: number | null
          id?: string
          location_en?: string
          location_mn?: string
          name_en?: string
          name_mn?: string
          organizer_en?: string
          organizer_mn?: string
          owner_id?: string | null
          price_info?: string
          published_at?: string | null
          published_by?: string | null
          race_date?: string
          reg_deadline?: string | null
          register_url?: string
          results_info?: string
          review_status?: Database["public"]["Enums"]["race_review_status"]
          schedule_info?: string
          status?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "user"
      organizer_status: "pending" | "verified" | "rejected"
      race_review_status:
        | "draft"
        | "pending_verification"
        | "needs_changes"
        | "approved"
        | "published"
        | "postponed"
        | "cancelled"
        | "archived"
      suggestion_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      organizer_status: ["pending", "verified", "rejected"],
      race_review_status: [
        "draft",
        "pending_verification",
        "needs_changes",
        "approved",
        "published",
        "postponed",
        "cancelled",
        "archived",
      ],
      suggestion_status: ["pending", "approved", "rejected"],
    },
  },
} as const
