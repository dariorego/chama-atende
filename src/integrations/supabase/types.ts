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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customer_reviews: {
        Row: {
          admin_response: string | null
          ambiente_rating: number | null
          atendimento_rating: number | null
          comida_rating: number | null
          created_at: string | null
          customer_name: string
          id: string
          is_featured: boolean | null
          observations: string | null
          overall_rating: number | null
          phone: string | null
          responded_at: string | null
          responded_by: string | null
          restaurant_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          ambiente_rating?: number | null
          atendimento_rating?: number | null
          comida_rating?: number | null
          created_at?: string | null
          customer_name: string
          id?: string
          is_featured?: boolean | null
          observations?: string | null
          overall_rating?: number | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          restaurant_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          ambiente_rating?: number | null
          atendimento_rating?: number | null
          comida_rating?: number | null
          created_at?: string | null
          customer_name?: string
          id?: string
          is_featured?: boolean | null
          observations?: string | null
          overall_rating?: number | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          restaurant_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_products: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_highlight: boolean | null
          name: string
          price: number
          promotional_price: number | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_highlight?: boolean | null
          name: string
          price: number
          promotional_price?: number | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_highlight?: boolean | null
          name?: string
          price?: number
          promotional_price?: number | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_entries: {
        Row: {
          called_at: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_name: string
          estimated_wait_minutes: number | null
          id: string
          joined_at: string | null
          notes: string | null
          notifications_enabled: boolean | null
          party_size: number
          phone: string | null
          position: number | null
          queue_code: string
          seated_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          called_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_name: string
          estimated_wait_minutes?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          notifications_enabled?: boolean | null
          party_size?: number
          phone?: string | null
          position?: number | null
          queue_code: string
          seated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          called_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_name?: string
          estimated_wait_minutes?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          notifications_enabled?: boolean | null
          party_size?: number
          phone?: string | null
          position?: number | null
          queue_code?: string
          seated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_name: string
          id: string
          notes: string | null
          party_size: number
          phone: string
          reservation_code: string
          reservation_date: string
          reservation_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name: string
          id?: string
          notes?: string | null
          party_size?: number
          phone: string
          reservation_code: string
          reservation_date: string
          reservation_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_name?: string
          id?: string
          notes?: string | null
          party_size?: number
          phone?: string
          reservation_code?: string
          reservation_date?: string
          reservation_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_modules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          module_name: string
          restaurant_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          module_name: string
          restaurant_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          module_name?: string
          restaurant_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_modules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          closing_time: string | null
          cover_image_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          opening_time: string | null
          phone: string | null
          slug: string
          social_links: Json | null
          status: string | null
          subtitle: string | null
          updated_at: string | null
          wifi_info: Json | null
        }
        Insert: {
          address?: string | null
          closing_time?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          opening_time?: string | null
          phone?: string | null
          slug: string
          social_links?: Json | null
          status?: string | null
          subtitle?: string | null
          updated_at?: string | null
          wifi_info?: Json | null
        }
        Update: {
          address?: string | null
          closing_time?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          opening_time?: string | null
          phone?: string | null
          slug?: string
          social_links?: Json | null
          status?: string | null
          subtitle?: string | null
          updated_at?: string | null
          wifi_info?: Json | null
        }
        Relationships: []
      }
      service_calls: {
        Row: {
          acknowledged_at: string | null
          call_type: string
          called_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          response_time_seconds: number | null
          status: string | null
          table_id: string
          table_session_id: string | null
          updated_at: string | null
          waiter_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          call_type: string
          called_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          response_time_seconds?: number | null
          status?: string | null
          table_id: string
          table_session_id?: string | null
          updated_at?: string | null
          waiter_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          call_type?: string
          called_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          response_time_seconds?: number | null
          status?: string | null
          table_id?: string
          table_session_id?: string | null
          updated_at?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_calls_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_table_session_id_fkey"
            columns: ["table_session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sessions: {
        Row: {
          bill_requested_at: string | null
          closed_at: string | null
          created_at: string | null
          customer_count: number | null
          id: string
          notes: string | null
          opened_at: string | null
          status: string | null
          table_id: string
          updated_at: string | null
          waiter_id: string | null
        }
        Insert: {
          bill_requested_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_count?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          status?: string | null
          table_id: string
          updated_at?: string | null
          waiter_id?: string | null
        }
        Update: {
          bill_requested_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_count?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          status?: string | null
          table_id?: string
          updated_at?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          number: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          number: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          number?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiters: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "manager", "staff"],
    },
  },
} as const
