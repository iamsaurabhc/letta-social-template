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
      agent_website_sources: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          letta_source_id: string | null
          updated_at: string | null
          website_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          letta_source_id?: string | null
          updated_at?: string | null
          website_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          letta_source_id?: string | null
          updated_at?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_website_sources_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_website_sources_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "website_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_sources: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          platform: Database["public"]["Enums"]["social_platform"]
          source_url: string
          source_username: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["social_platform"]
          source_url: string
          source_username?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          source_url?: string
          source_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_sources_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      post_approvals: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          post_id: string
          requested_by: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approval_notes?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          post_id: string
          requested_by: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_notes?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          post_id?: string
          requested_by?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string
          agent_id: string
          created_at: string | null
          id: string
          platform: Database["public"]["Enums"]["social_platform"]
          platform_settings: Json | null
          platform_user_id: string | null
          posting_mode: Database["public"]["Enums"]["posting_mode"] | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          access_token: string
          agent_id: string
          created_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["social_platform"]
          platform_settings?: Json | null
          platform_user_id?: string | null
          posting_mode?: Database["public"]["Enums"]["posting_mode"] | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          access_token?: string
          agent_id?: string
          created_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          platform_settings?: Json | null
          platform_user_id?: string | null
          posting_mode?: Database["public"]["Enums"]["posting_mode"] | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          agent_id: string
          connection_id: string
          content: string
          created_at: string | null
          engagement_metrics: Json | null
          error_message: string | null
          id: string
          media_urls: string[] | null
          metadata: Json | null
          platform: Database["public"]["Enums"]["social_platform"]
          platform_post_id: string | null
          posted_at: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          connection_id: string
          content: string
          created_at?: string | null
          engagement_metrics?: Json | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform: Database["public"]["Enums"]["social_platform"]
          platform_post_id?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          connection_id?: string
          content?: string
          created_at?: string | null
          engagement_metrics?: Json | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: Database["public"]["Enums"]["social_platform"]
          platform_post_id?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      twitter_timeline_entries: {
        Row: {
          agent_id: string | null
          analyzed_at: string | null
          content: string
          created_at: string
          created_at_platform: string
          engagement_metrics: Json | null
          id: string
          metadata: Json | null
          tweet_id: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          analyzed_at?: string | null
          content: string
          created_at: string
          created_at_platform: string
          engagement_metrics?: Json | null
          id?: string
          metadata?: Json | null
          tweet_id: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          analyzed_at?: string | null
          content?: string
          created_at?: string
          created_at_platform?: string
          engagement_metrics?: Json | null
          id?: string
          metadata?: Json | null
          tweet_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "twitter_timeline_entries_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_agents: {
        Row: {
          brand_personality: string[] | null
          content_preferences: Json | null
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          letta_agent_id: string
          name: string
          target_audience: string[] | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          brand_personality?: string[] | null
          content_preferences?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          letta_agent_id: string
          name: string
          target_audience?: string[] | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          brand_personality?: string[] | null
          content_preferences?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          letta_agent_id?: string
          name?: string
          target_audience?: string[] | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          website_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          website_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_content_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "website_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      website_sources: {
        Row: {
          created_at: string | null
          id: string
          last_scraped_at: string | null
          scrape_frequency: unknown | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_scraped_at?: string | null
          scrape_frequency?: unknown | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_scraped_at?: string | null
          scrape_frequency?: unknown | null
          updated_at?: string | null
          url?: string
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
      post_status:
        | "draft"
        | "pending_approval"
        | "scheduled"
        | "posted"
        | "failed"
      posting_mode: "automatic" | "manual_approval"
      social_platform:
        | "twitter"
        | "linkedin"
        | "instagram"
        | "facebook"
        | "threads"
        | "youtube"
        | "gbp"
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
