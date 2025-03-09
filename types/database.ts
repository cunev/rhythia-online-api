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
      invites: {
        Row: {
          code: string
          created_at: string
          id: number
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          type: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          type?: string
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
      get_collections_v1: {
        Args: {
          page_number?: number
          items_per_page?: number
        }
        Returns: {
          id: number
          title: string
          description: string
          created_at: string
          owner: number
          beatmap_count: number
          star1: number
          star2: number
          star3: number
          star4: number
          star5: number
          star6: number
          star7: number
          star8: number
          star9: number
          star10: number
          star11: number
          star12: number
          star13: number
          star14: number
          star15: number
          star16: number
          star17: number
          star18: number
          total_pages: number
        }[]
      }
      get_collections_v2:
        | {
            Args: {
              page_number?: number
              items_per_page?: number
            }
            Returns: {
              id: number
              title: string
              description: string
              created_at: string
              owner: number
              owner_username: string
              owner_avatar_url: string
              beatmap_count: number
              star1: number
              star2: number
              star3: number
              star4: number
              star5: number
              star6: number
              star7: number
              star8: number
              star9: number
              star10: number
              star11: number
              star12: number
              star13: number
              star14: number
              star15: number
              star16: number
              star17: number
              star18: number
              total_pages: number
            }[]
          }
        | {
            Args: {
              page_number?: number
              items_per_page?: number
              owner_filter?: number
            }
            Returns: {
              id: number
              title: string
              description: string
              created_at: string
              owner: number
              owner_username: string
              owner_avatar_url: string
              beatmap_count: number
              star1: number
              star2: number
              star3: number
              star4: number
              star5: number
              star6: number
              star7: number
              star8: number
              star9: number
              star10: number
              star11: number
              star12: number
              star13: number
              star14: number
              star15: number
              star16: number
              star17: number
              star18: number
              total_pages: number
            }[]
          }
      get_collections_v3: {
        Args: {
          page_number?: number
          items_per_page?: number
          owner_filter?: number
        }
        Returns: {
          id: number
          title: string
          description: string
          created_at: string
          owner: number
          owner_username: string
          owner_avatar_url: string
          beatmap_count: number
          star1: number
          star2: number
          star3: number
          star4: number
          star5: number
          star6: number
          star7: number
          star8: number
          star9: number
          star10: number
          star11: number
          star12: number
          star13: number
          star14: number
          star15: number
          star16: number
          star17: number
          star18: number
          total_pages: number
        }[]
      }
      get_collections_v4: {
        Args: {
          page_number?: number
          items_per_page?: number
          owner_filter?: number
          search_query?: string
          author_filter?: string
          min_beatmaps?: number
        }
        Returns: {
          id: number
          title: string
          description: string
          created_at: string
          owner: number
          owner_username: string
          owner_avatar_url: string
          beatmap_count: number
          star1: number
          star2: number
          star3: number
          star4: number
          star5: number
          star6: number
          star7: number
          star8: number
          star9: number
          star10: number
          star11: number
          star12: number
          star13: number
          star14: number
          star15: number
          star16: number
          star17: number
          star18: number
          total_pages: number
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
