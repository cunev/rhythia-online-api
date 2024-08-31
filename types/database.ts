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
      beatmaps: {
        Row: {
          beatmapHash: string
          created_at: string
          difficulty: number | null
          length: number | null
          noteCount: number | null
          playcount: number | null
          ranked: boolean | null
          title: string | null
        }
        Insert: {
          beatmapHash: string
          created_at?: string
          difficulty?: number | null
          length?: number | null
          noteCount?: number | null
          playcount?: number | null
          ranked?: boolean | null
          title?: string | null
        }
        Update: {
          beatmapHash?: string
          created_at?: string
          difficulty?: number | null
          length?: number | null
          noteCount?: number | null
          playcount?: number | null
          ranked?: boolean | null
          title?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          badges: Json | null
          computedUsername: string | null
          created_at: number | null
          flag: string | null
          id: number
          play_count: number | null
          skill_points: number | null
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
          computedUsername?: string | null
          created_at?: number | null
          flag?: string | null
          id?: number
          play_count?: number | null
          skill_points?: number | null
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
          computedUsername?: string | null
          created_at?: number | null
          flag?: string | null
          id?: number
          play_count?: number | null
          skill_points?: number | null
          squares_hit?: number | null
          total_score?: number | null
          uid?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_uid_fkey"
            columns: ["uid"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          awarded_sp: number | null
          beatmapHash: string | null
          created_at: string
          id: number
          misses: number | null
          passed: boolean | null
          replayHwid: string | null
          songId: string | null
          userId: number | null
        }
        Insert: {
          awarded_sp?: number | null
          beatmapHash?: string | null
          created_at?: string
          id?: number
          misses?: number | null
          passed?: boolean | null
          replayHwid?: string | null
          songId?: string | null
          userId?: number | null
        }
        Update: {
          awarded_sp?: number | null
          beatmapHash?: string | null
          created_at?: string
          id?: number
          misses?: number | null
          passed?: boolean | null
          replayHwid?: string | null
          songId?: string | null
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
