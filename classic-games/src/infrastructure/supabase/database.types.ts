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
  classic_games: {
    Tables: {
      mighty_actions: {
        Row: {
          action_data: Json
          action_index: number
          action_type: string
          created_at: string | null
          id: string
          player_id: string | null
          room_id: string | null
        }
        Insert: {
          action_data: Json
          action_index?: number
          action_type: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          room_id?: string | null
        }
        Update: {
          action_data?: Json
          action_index?: number
          action_type?: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mighty_actions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "mighty_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mighty_actions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mighty_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      mighty_matchmaking: {
        Row: {
          created_at: string | null
          id: string
          matched_room_id: string | null
          player_count: number | null
          player_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          matched_room_id?: string | null
          player_count?: number | null
          player_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          matched_room_id?: string | null
          player_count?: number | null
          player_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mighty_matchmaking_matched_room_id_fkey"
            columns: ["matched_room_id"]
            isOneToOne: false
            referencedRelation: "mighty_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mighty_matchmaking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "mighty_players"
            referencedColumns: ["id"]
          },
        ]
      }
      mighty_players: {
        Row: {
          avatar: string | null
          created_at: string | null
          device_id: string
          games_played: number | null
          id: string
          losses: number | null
          nickname: string
          rating: number | null
          total_declarer_wins: number | null
          total_defender_wins: number | null
          total_runs: number | null
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          device_id: string
          games_played?: number | null
          id?: string
          losses?: number | null
          nickname: string
          rating?: number | null
          total_declarer_wins?: number | null
          total_defender_wins?: number | null
          total_runs?: number | null
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          device_id?: string
          games_played?: number | null
          id?: string
          losses?: number | null
          nickname?: string
          rating?: number | null
          total_declarer_wins?: number | null
          total_defender_wins?: number | null
          total_runs?: number | null
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: []
      }
      mighty_rankings: {
        Row: {
          id: string
          losses: number | null
          player_id: string | null
          rank_position: number | null
          rating: number | null
          season: string
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          id?: string
          losses?: number | null
          player_id?: string | null
          rank_position?: number | null
          rating?: number | null
          season: string
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          id?: string
          losses?: number | null
          player_id?: string | null
          rank_position?: number | null
          rating?: number | null
          season?: string
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mighty_rankings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "mighty_players"
            referencedColumns: ["id"]
          },
        ]
      }
      mighty_rooms: {
        Row: {
          ai_difficulty: string | null
          auto_start_seconds: number | null
          created_at: string | null
          current_turn: number | null
          game_state: Json | null
          host_id: string | null
          id: string
          player_count: number | null
          players: Json | null
          room_code: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_difficulty?: string | null
          auto_start_seconds?: number | null
          created_at?: string | null
          current_turn?: number | null
          game_state?: Json | null
          host_id?: string | null
          id?: string
          player_count?: number | null
          players?: Json | null
          room_code: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_difficulty?: string | null
          auto_start_seconds?: number | null
          created_at?: string | null
          current_turn?: number | null
          game_state?: Json | null
          host_id?: string | null
          id?: string
          player_count?: number | null
          players?: Json | null
          room_code?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mighty_rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "mighty_players"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          created_at: string | null
          difficulty: string | null
          game_id: string
          id: string
          moves: number
          player_name: string
          score: number
          time: number
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          game_id: string
          id?: string
          moves: number
          player_name: string
          score: number
          time: number
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          game_id?: string
          id?: string
          moves?: number
          player_name?: string
          score?: number
          time?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_elo_change: {
        Args: { k_factor?: number; loser_rating: number; winner_rating: number }
        Returns: number
      }
      generate_room_code: { Args: never; Returns: string }
      get_current_season: { Args: never; Returns: string }
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
  classic_games: {
    Enums: {},
  },
} as const
