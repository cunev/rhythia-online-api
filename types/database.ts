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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: number
          created_at: string | null
          details: Json | null
          id: number
          target_id: number | null
        }
        Insert: {
          action_type: string
          admin_id: number
          created_at?: string | null
          details?: Json | null
          id?: number
          target_id?: number | null
        }
        Update: {
          action_type?: string
          admin_id?: number
          created_at?: string | null
          details?: Json | null
          id?: number
          target_id?: number | null
        }
        Relationships: []
      }
      admin_operations: {
        Row: {
          action_type: string | null
          details: Json
          id: number
          target_id: string | null
        }
        Insert: {
          action_type?: string | null
          details: Json
          id?: number
          target_id?: string | null
        }
        Update: {
          action_type?: string | null
          details?: Json
          id?: number
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_operations_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beatmapCollections: {
        Row: {
          created_at: string
          description: string
          id: number
          is_list: boolean
          owner: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          is_list?: boolean
          owner: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          is_list?: boolean
          owner?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "beatmapCollections_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beatmapPageComments: {
        Row: {
          beatmapPage: number
          content: string | null
          created_at: string
          id: number
          owner: number
        }
        Insert: {
          beatmapPage: number
          content?: string | null
          created_at?: string
          id?: number
          owner: number
        }
        Update: {
          beatmapPage?: number
          content?: string | null
          created_at?: string
          id?: number
          owner?: number
        }
        Relationships: [
          {
            foreignKeyName: "beatmapPageComments_beatmapPage_fkey"
            columns: ["beatmapPage"]
            isOneToOne: false
            referencedRelation: "beatmapPages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beatmapPageComments_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beatmapPages: {
        Row: {
          created_at: string
          description: string
          genre: string | null
          id: number
          latestBeatmapHash: string | null
          nominations: Json | null
          owner: number | null
          ranked_at: number
          status: string | null
          tags: string
          title: string | null
          updated_at: number | null
        }
        Insert: {
          created_at?: string
          description?: string
          genre?: string | null
          id?: number
          latestBeatmapHash?: string | null
          nominations?: Json | null
          owner?: number | null
          ranked_at?: number
          status?: string | null
          tags?: string
          title?: string | null
          updated_at?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          genre?: string | null
          id?: number
          latestBeatmapHash?: string | null
          nominations?: Json | null
          owner?: number | null
          ranked_at?: number
          status?: string | null
          tags?: string
          title?: string | null
          updated_at?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beatmapPages_latestBeatmapHash_fkey"
            columns: ["latestBeatmapHash"]
            isOneToOne: false
            referencedRelation: "beatmaps"
            referencedColumns: ["beatmapHash"]
          },
          {
            foreignKeyName: "beatmapPages_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beatmaps: {
        Row: {
          beatmapFile: string | null
          beatmapHash: string
          created_at: string
          difficulty: number | null
          image: string | null
          imageLarge: string | null
          length: number | null
          noteCount: number | null
          playcount: number | null
          ranked: boolean | null
          starRating: number | null
          title: string | null
        }
        Insert: {
          beatmapFile?: string | null
          beatmapHash: string
          created_at?: string
          difficulty?: number | null
          image?: string | null
          imageLarge?: string | null
          length?: number | null
          noteCount?: number | null
          playcount?: number | null
          ranked?: boolean | null
          starRating?: number | null
          title?: string | null
        }
        Update: {
          beatmapFile?: string | null
          beatmapHash?: string
          created_at?: string
          difficulty?: number | null
          image?: string | null
          imageLarge?: string | null
          length?: number | null
          noteCount?: number | null
          playcount?: number | null
          ranked?: boolean | null
          starRating?: number | null
          title?: string | null
        }
        Relationships: []
      }
      chartedValues: {
        Row: {
          created_at: string
          id: number
          type: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          type?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          type?: string | null
          value?: number | null
        }
        Relationships: []
      }
      clans: {
        Row: {
          acronym: string | null
          allowed_users: Json
          avatar_url: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          owner: number | null
        }
        Insert: {
          acronym?: string | null
          allowed_users?: Json
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          owner?: number | null
        }
        Update: {
          acronym?: string | null
          allowed_users?: Json
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          owner?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clans_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collectionRelations: {
        Row: {
          beatmapPage: number | null
          collection: number
          created_at: string
          id: number
          sort: number
        }
        Insert: {
          beatmapPage?: number | null
          collection: number
          created_at?: string
          id?: number
          sort?: number
        }
        Update: {
          beatmapPage?: number | null
          collection?: number
          created_at?: string
          id?: number
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "collectionRelations_beatmapPage_fkey"
            columns: ["beatmapPage"]
            isOneToOne: false
            referencedRelation: "beatmapPages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectionRelations_collection_fkey"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "beatmapCollections"
            referencedColumns: ["id"]
          },
        ]
      }
      discordWebhooks: {
        Row: {
          id: number
          type: Database["public"]["Enums"]["discordWebhookType"] | null
          webhook_link: string
        }
        Insert: {
          id?: number
          type?: Database["public"]["Enums"]["discordWebhookType"] | null
          webhook_link?: string
        }
        Update: {
          id?: number
          type?: Database["public"]["Enums"]["discordWebhookType"] | null
          webhook_link?: string
        }
        Relationships: []
      }
      inventories: {
        Row: {
          contents: Json
          id: number
        }
        Insert: {
          contents?: Json
          id?: number
        }
        Update: {
          contents?: Json
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          code: string
          created_at: string
          id: number
          resourceId: string
          type: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          resourceId: string
          type: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          resourceId?: string
          type?: string
          used?: boolean
        }
        Relationships: []
      }
      levers: {
        Row: {
          disable_scores: boolean
          id: number
        }
        Insert: {
          disable_scores?: boolean
          id?: number
        }
        Update: {
          disable_scores?: boolean
          id?: number
        }
        Relationships: []
      }
      passkeys: {
        Row: {
          email: string
          id: number
          passkey: string
        }
        Insert: {
          email: string
          id: number
          passkey: string
        }
        Update: {
          email?: string
          id?: number
          passkey?: string
        }
        Relationships: [
          {
            foreignKeyName: "passkeys_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profileActivities: {
        Row: {
          last_activity: number | null
          uid: string
        }
        Insert: {
          last_activity?: number | null
          uid: string
        }
        Update: {
          last_activity?: number | null
          uid?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          badges: Json | null
          ban: Database["public"]["Enums"]["banTypes"] | null
          bannedAt: number | null
          clan: number | null
          computedUsername: string | null
          created_at: number | null
          flag: string | null
          id: number
          mu_rank: number
          play_count: number | null
          profile_image: string | null
          sigma_rank: number | null
          skill_points: number | null
          spin_skill_points: number
          squares_hit: number | null
          total_score: number | null
          uid: string | null
          username: string | null
          verificationDeadline: number
          verified: boolean | null
        }
        Insert: {
          about_me?: string | null
          avatar_url?: string | null
          badges?: Json | null
          ban?: Database["public"]["Enums"]["banTypes"] | null
          bannedAt?: number | null
          clan?: number | null
          computedUsername?: string | null
          created_at?: number | null
          flag?: string | null
          id?: number
          mu_rank?: number
          play_count?: number | null
          profile_image?: string | null
          sigma_rank?: number | null
          skill_points?: number | null
          spin_skill_points?: number
          squares_hit?: number | null
          total_score?: number | null
          uid?: string | null
          username?: string | null
          verificationDeadline?: number
          verified?: boolean | null
        }
        Update: {
          about_me?: string | null
          avatar_url?: string | null
          badges?: Json | null
          ban?: Database["public"]["Enums"]["banTypes"] | null
          bannedAt?: number | null
          clan?: number | null
          computedUsername?: string | null
          created_at?: number | null
          flag?: string | null
          id?: number
          mu_rank?: number
          play_count?: number | null
          profile_image?: string | null
          sigma_rank?: number | null
          skill_points?: number | null
          spin_skill_points?: number
          squares_hit?: number | null
          total_score?: number | null
          uid?: string | null
          username?: string | null
          verificationDeadline?: number
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clan_fkey"
            columns: ["clan"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          additional_data: Json
          awarded_sp: number | null
          beatmapHash: string | null
          created_at: string
          id: number
          misses: number | null
          mods: Json
          passed: boolean | null
          replayHwid: string | null
          songId: string | null
          speed: number | null
          spin: boolean
          userId: number | null
        }
        Insert: {
          additional_data?: Json
          awarded_sp?: number | null
          beatmapHash?: string | null
          created_at?: string
          id?: number
          misses?: number | null
          mods?: Json
          passed?: boolean | null
          replayHwid?: string | null
          songId?: string | null
          speed?: number | null
          spin?: boolean
          userId?: number | null
        }
        Update: {
          additional_data?: Json
          awarded_sp?: number | null
          beatmapHash?: string | null
          created_at?: string
          id?: number
          misses?: number | null
          mods?: Json
          passed?: boolean | null
          replayHwid?: string | null
          songId?: string | null
          speed?: number | null
          spin?: boolean
          userId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_beatmapHash_fkey"
            columns: ["beatmapHash"]
            isOneToOne: false
            referencedRelation: "beatmaps"
            referencedColumns: ["beatmapHash"]
          },
          {
            foreignKeyName: "scores_userId_fkey"
            columns: ["userId"]
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
      admin_delete_user: {
        Args: { user_id: number }
        Returns: boolean
      }
      admin_exclude_user: {
        Args: { user_id: number }
        Returns: boolean
      }
      admin_invalidate_ranked_scores: {
        Args: { user_id: number }
        Returns: number
      }
      admin_log_action: {
        Args:
          | {
              action_type: string
              admin_id: number
              details?: Json
              target_id: number
            }
          | {
              action_type: string
              admin_id: number
              details?: Json
              target_id: string
            }
        Returns: undefined
      }
      admin_profanity_clear: {
        Args: { user_id: number }
        Returns: boolean
      }
      admin_remove_all_scores: {
        Args: { user_id: number }
        Returns: number
      }
      admin_restrict_user: {
        Args: { user_id: number }
        Returns: boolean
      }
      admin_search_users: {
        Args: { search_text: string }
        Returns: {
          about_me: string | null
          avatar_url: string | null
          badges: Json | null
          ban: Database["public"]["Enums"]["banTypes"] | null
          bannedAt: number | null
          clan: number | null
          computedUsername: string | null
          created_at: number | null
          flag: string | null
          id: number
          mu_rank: number
          play_count: number | null
          profile_image: string | null
          sigma_rank: number | null
          skill_points: number | null
          spin_skill_points: number
          squares_hit: number | null
          total_score: number | null
          uid: string | null
          username: string | null
          verificationDeadline: number
          verified: boolean | null
        }[]
      }
      admin_silence_user: {
        Args: { user_id: number }
        Returns: boolean
      }
      admin_unban_user: {
        Args: { user_id: number }
        Returns: boolean
      }
      get_badge_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          all_badges: Json
          avatar_url: string
          display_name: string
          earned_badges: string[]
          id: number
          special_badge_count: number
        }[]
      }
      get_clan_leaderboard: {
        Args: { items_per_page?: number; page_number?: number }
        Returns: {
          acronym: string
          avatar_url: string
          description: string
          id: number
          member_count: number
          name: string
          total_pages: number
          total_skill_points: number
        }[]
      }
      get_collections_v1: {
        Args: { items_per_page?: number; page_number?: number }
        Returns: {
          beatmap_count: number
          created_at: string
          description: string
          id: number
          owner: number
          star1: number
          star10: number
          star11: number
          star12: number
          star13: number
          star14: number
          star15: number
          star16: number
          star17: number
          star18: number
          star2: number
          star3: number
          star4: number
          star5: number
          star6: number
          star7: number
          star8: number
          star9: number
          title: string
          total_pages: number
        }[]
      }
      get_collections_v2: {
        Args:
          | {
              items_per_page?: number
              owner_filter?: number
              page_number?: number
            }
          | { items_per_page?: number; page_number?: number }
        Returns: {
          beatmap_count: number
          created_at: string
          description: string
          id: number
          owner: number
          owner_avatar_url: string
          owner_username: string
          star1: number
          star10: number
          star11: number
          star12: number
          star13: number
          star14: number
          star15: number
          star16: number
          star17: number
          star18: number
          star2: number
          star3: number
          star4: number
          star5: number
          star6: number
          star7: number
          star8: number
          star9: number
          title: string
          total_pages: number
        }[]
      }
      get_collections_v3: {
        Args: {
          items_per_page?: number
          owner_filter?: number
          page_number?: number
        }
        Returns: {
          beatmap_count: number
          created_at: string
          description: string
          id: number
          owner: number
          owner_avatar_url: string
          owner_username: string
          star1: number
          star10: number
          star11: number
          star12: number
          star13: number
          star14: number
          star15: number
          star16: number
          star17: number
          star18: number
          star2: number
          star3: number
          star4: number
          star5: number
          star6: number
          star7: number
          star8: number
          star9: number
          title: string
          total_pages: number
        }[]
      }
      get_collections_v4: {
        Args: {
          author_filter?: string
          items_per_page?: number
          min_beatmaps?: number
          owner_filter?: number
          page_number?: number
          search_query?: string
        }
        Returns: {
          beatmap_count: number
          created_at: string
          description: string
          id: number
          owner: number
          owner_avatar_url: string
          owner_username: string
          star1: number
          star10: number
          star11: number
          star12: number
          star13: number
          star14: number
          star15: number
          star16: number
          star17: number
          star18: number
          star2: number
          star3: number
          star4: number
          star5: number
          star6: number
          star7: number
          star8: number
          star9: number
          title: string
          total_pages: number
        }[]
      }
      get_top_scores_for_beatmap: {
        Args: { beatmap_hash: string }
        Returns: {
          accuracy: number
          avatar_url: string
          awarded_sp: number
          created_at: string
          id: number
          misses: number
          mods: Json
          passed: boolean
          replayhwid: string
          songid: string
          speed: number
          spin: boolean
          userid: number
          username: string
        }[]
      }
      get_top_scores_for_beatmap2: {
        Args: { beatmap_hash: string }
        Returns: {
          accuracy: number
          avatar_url: string
          awarded_sp: number
          created_at: string
          id: number
          misses: number
          mods: Json
          passed: boolean
          replayhwid: string
          songid: string
          speed: number
          spin: boolean
          userid: number
          username: string
        }[]
      }
      get_user_activity: {
        Args: { score_limit?: number; user_id: number }
        Returns: Json
      }
      get_user_by_email: {
        Args: { email_address: string }
        Returns: Json
      }
      get_user_reigning_scores: {
        Args: { page_size: number; userid: number } | { userid: number }
        Returns: {
          awarded_sp: number
          beatmaphash: string
          beatmaptitle: string
          created_at: string
          difficulty: number
          id: number
          misses: number
          mods: Json
          notes: number
          passed: boolean
          replayhwid: string
          songid: string
          speed: number
          spin: boolean
        }[]
      }
      get_user_scores_summary: {
        Args: { limit_param?: number; userid: number }
        Returns: Json
      }
      grant_special_badges: {
        Args: {
          p_beatmap_id: number
          p_passed?: boolean
          p_spin?: boolean
          p_user_id: number
        }
        Returns: Json
      }
    }
    Enums: {
      banTypes: "cool" | "silenced" | "restricted" | "excluded"
      discordWebhookType: "maps" | "scores"
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
      banTypes: ["cool", "silenced", "restricted", "excluded"],
      discordWebhookType: ["maps", "scores"],
    },
  },
} as const
