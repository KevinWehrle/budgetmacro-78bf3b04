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
      day_history: {
        Row: {
          calories: number
          cost: number
          created_at: string
          date: string
          goal_budget: number
          goal_calories: number
          goal_protein: number
          id: string
          protein: number
          user_id: string
          waste_cost: number
        }
        Insert: {
          calories?: number
          cost?: number
          created_at?: string
          date: string
          goal_budget: number
          goal_calories: number
          goal_protein: number
          id?: string
          protein?: number
          user_id: string
          waste_cost?: number
        }
        Update: {
          calories?: number
          cost?: number
          created_at?: string
          date?: string
          goal_budget?: number
          goal_calories?: number
          goal_protein?: number
          id?: string
          protein?: number
          user_id?: string
          waste_cost?: number
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          amount_consumed: number | null
          calories: number
          cost: number
          created_at: string
          description: string
          id: string
          pantry_item_id: string | null
          protein: number
          user_id: string
        }
        Insert: {
          amount_consumed?: number | null
          calories?: number
          cost?: number
          created_at?: string
          description: string
          id?: string
          pantry_item_id?: string | null
          protein?: number
          user_id: string
        }
        Update: {
          amount_consumed?: number | null
          calories?: number
          cost?: number
          created_at?: string
          description?: string
          id?: string
          pantry_item_id?: string | null
          protein?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_pantry_item_id_fkey"
            columns: ["pantry_item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_items: {
        Row: {
          calories_per_100g: number | null
          calories_per_serving: number | null
          created_at: string
          current_servings: number | null
          current_weight: number | null
          expires_at: string | null
          id: string
          is_out_of_stock: boolean
          name: string
          protein_per_100g: number | null
          protein_per_serving: number | null
          serving_unit: string | null
          store_id: string | null
          total_cost: number
          total_servings: number | null
          total_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_per_100g?: number | null
          calories_per_serving?: number | null
          created_at?: string
          current_servings?: number | null
          current_weight?: number | null
          expires_at?: string | null
          id?: string
          is_out_of_stock?: boolean
          name: string
          protein_per_100g?: number | null
          protein_per_serving?: number | null
          serving_unit?: string | null
          store_id?: string | null
          total_cost?: number
          total_servings?: number | null
          total_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_per_100g?: number | null
          calories_per_serving?: number | null
          created_at?: string
          current_servings?: number | null
          current_weight?: number | null
          expires_at?: string | null
          id?: string
          is_out_of_stock?: boolean
          name?: string
          protein_per_100g?: number | null
          protein_per_serving?: number | null
          serving_unit?: string | null
          store_id?: string | null
          total_cost?: number
          total_servings?: number | null
          total_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          cost_at_time: number
          created_at: string
          date_recorded: string
          id: string
          pantry_item_id: string
          user_id: string
        }
        Insert: {
          cost_at_time: number
          created_at?: string
          date_recorded?: string
          id?: string
          pantry_item_id: string
          user_id: string
        }
        Update: {
          cost_at_time?: number
          created_at?: string
          date_recorded?: string
          id?: string
          pantry_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_pantry_item_id_fkey"
            columns: ["pantry_item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          location_tag: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_tag?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_tag?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          budget: number
          calories: number
          protein: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number
          calories?: number
          protein?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number
          calories?: number
          protein?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          dark_mode: boolean
          notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          dark_mode?: boolean
          notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          dark_mode?: boolean
          notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waste_logs: {
        Row: {
          amount_wasted: number
          cost_lost: number
          created_at: string
          id: string
          is_expired: boolean
          item_name: string
          pantry_item_id: string | null
          user_id: string
          waste_reason: string | null
        }
        Insert: {
          amount_wasted: number
          cost_lost?: number
          created_at?: string
          id?: string
          is_expired?: boolean
          item_name: string
          pantry_item_id?: string | null
          user_id: string
          waste_reason?: string | null
        }
        Update: {
          amount_wasted?: number
          cost_lost?: number
          created_at?: string
          id?: string
          is_expired?: boolean
          item_name?: string
          pantry_item_id?: string | null
          user_id?: string
          waste_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waste_logs_pantry_item_id_fkey"
            columns: ["pantry_item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
