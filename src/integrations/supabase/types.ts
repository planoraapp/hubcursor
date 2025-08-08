export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      forum_categories: {
        Row: {
          bg_color: string
          created_at: string
          description: string
          icon: string
          id: string
          last_post_time: string | null
          name: string
          posts_count: number
          topics_count: number
          updated_at: string
        }
        Insert: {
          bg_color?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          last_post_time?: string | null
          name: string
          posts_count?: number
          topics_count?: number
          updated_at?: string
        }
        Update: {
          bg_color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          last_post_time?: string | null
          name?: string
          posts_count?: number
          topics_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_habbo_name: string
          author_supabase_user_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_habbo_name: string
          author_supabase_user_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_habbo_name?: string
          author_supabase_user_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_habbo_name: string
          author_supabase_user_id: string
          category: string | null
          category_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes: number
          title: string
        }
        Insert: {
          author_habbo_name: string
          author_supabase_user_id: string
          category?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number
          title: string
        }
        Update: {
          author_habbo_name?: string
          author_supabase_user_id?: string
          category?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook_entries: {
        Row: {
          author_habbo_name: string
          author_user_id: string | null
          created_at: string
          home_owner_user_id: string
          id: string
          message: string
          moderation_status: string
        }
        Insert: {
          author_habbo_name: string
          author_user_id?: string | null
          created_at?: string
          home_owner_user_id: string
          id?: string
          message: string
          moderation_status?: string
        }
        Update: {
          author_habbo_name?: string
          author_user_id?: string | null
          created_at?: string
          home_owner_user_id?: string
          id?: string
          message?: string
          moderation_status?: string
        }
        Relationships: []
      }
      habbo_accounts: {
        Row: {
          created_at: string
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          is_admin: boolean
          supabase_user_id: string
        }
        Insert: {
          created_at?: string
          habbo_id: string
          habbo_name: string
          hotel: string
          id?: string
          is_admin?: boolean
          supabase_user_id: string
        }
        Update: {
          created_at?: string
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          is_admin?: boolean
          supabase_user_id?: string
        }
        Relationships: []
      }
      habbo_badges: {
        Row: {
          badge_code: string
          badge_name: string | null
          category: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          last_validated_at: string | null
          source: string | null
          validation_count: number | null
        }
        Insert: {
          badge_code: string
          badge_name?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_validated_at?: string | null
          source?: string | null
          validation_count?: number | null
        }
        Update: {
          badge_code?: string
          badge_name?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_validated_at?: string | null
          source?: string | null
          validation_count?: number | null
        }
        Relationships: []
      }
      habbo_clothing_cache: {
        Row: {
          api_synced_at: string
          club: string
          code: string
          colors: Json
          created_at: string
          gender: string
          id: string
          image_url: string | null
          is_active: boolean
          item_id: number
          part: string
          source: string
          updated_at: string
        }
        Insert: {
          api_synced_at?: string
          club?: string
          code: string
          colors?: Json
          created_at?: string
          gender?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_id: number
          part: string
          source?: string
          updated_at?: string
        }
        Update: {
          api_synced_at?: string
          club?: string
          code?: string
          colors?: Json
          created_at?: string
          gender?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_id?: number
          part?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      habbo_emotion_api_cache: {
        Row: {
          endpoint: string
          expires_at: string
          fetched_at: string
          id: string
          item_count: number
          response_data: Json
          status: string
        }
        Insert: {
          endpoint: string
          expires_at?: string
          fetched_at?: string
          id?: string
          item_count?: number
          response_data: Json
          status?: string
        }
        Update: {
          endpoint?: string
          expires_at?: string
          fetched_at?: string
          id?: string
          item_count?: number
          response_data?: Json
          status?: string
        }
        Relationships: []
      }
      habbo_emotion_clothing: {
        Row: {
          club: string
          code: string
          colors: Json
          created_at: string
          gender: string
          id: string
          image_url: string | null
          is_active: boolean
          item_id: number
          part: string
          source: string
          updated_at: string
        }
        Insert: {
          club?: string
          code: string
          colors?: Json
          created_at?: string
          gender?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_id: number
          part: string
          source?: string
          updated_at?: string
        }
        Update: {
          club?: string
          code?: string
          colors?: Json
          created_at?: string
          gender?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_id?: number
          part?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      habbo_emotion_colors: {
        Row: {
          color_id: string
          color_name: string | null
          created_at: string
          hex_code: string
          id: string
          is_hc: boolean
        }
        Insert: {
          color_id: string
          color_name?: string | null
          created_at?: string
          hex_code: string
          id?: string
          is_hc?: boolean
        }
        Update: {
          color_id?: string
          color_name?: string | null
          created_at?: string
          hex_code?: string
          id?: string
          is_hc?: boolean
        }
        Relationships: []
      }
      habbo_emotion_item_colors: {
        Row: {
          clothing_item_id: string
          color_id: string
          id: string
          is_default: boolean
        }
        Insert: {
          clothing_item_id: string
          color_id: string
          id?: string
          is_default?: boolean
        }
        Update: {
          clothing_item_id?: string
          color_id?: string
          id?: string
          is_default?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "habbo_emotion_item_colors_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "habbo_emotion_clothing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habbo_emotion_item_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "habbo_emotion_colors"
            referencedColumns: ["color_id"]
          },
        ]
      }
      habbo_figures_cache: {
        Row: {
          created_at: string
          data: Json
          expires_at: string
          id: string
        }
        Insert: {
          created_at?: string
          data: Json
          expires_at: string
          id?: string
        }
        Update: {
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      home_assets: {
        Row: {
          bucket_name: string
          category: string
          created_at: string | null
          file_path: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_name?: string
          category: string
          created_at?: string | null
          file_path: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_name?: string
          category?: string
          created_at?: string | null
          file_path?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      photo_comments: {
        Row: {
          comment_text: string
          created_at: string
          habbo_name: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          habbo_name: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          habbo_name?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_likes: {
        Row: {
          created_at: string
          habbo_name: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          habbo_name: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          habbo_name?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_followers: {
        Row: {
          created_at: string
          followed_habbo_id: string
          followed_habbo_name: string
          follower_habbo_name: string
          follower_user_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_habbo_id: string
          followed_habbo_name: string
          follower_habbo_name: string
          follower_user_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_habbo_id?: string
          followed_habbo_name?: string
          follower_habbo_name?: string
          follower_user_id?: string
          id?: string
        }
        Relationships: []
      }
      user_home_backgrounds: {
        Row: {
          background_type: string
          background_value: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_type?: string
          background_value?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_type?: string
          background_value?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_home_layouts: {
        Row: {
          created_at: string
          height: number | null
          id: string
          is_visible: boolean
          updated_at: string
          user_id: string
          widget_id: string
          width: number | null
          x: number
          y: number
          z_index: number
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          is_visible?: boolean
          updated_at?: string
          user_id: string
          widget_id: string
          width?: number | null
          x?: number
          y?: number
          z_index?: number
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          is_visible?: boolean
          updated_at?: string
          user_id?: string
          widget_id?: string
          width?: number | null
          x?: number
          y?: number
          z_index?: number
        }
        Relationships: []
      }
      user_home_ratings: {
        Row: {
          created_at: string
          home_owner_user_id: string
          id: string
          rating: number
          rating_user_id: string
        }
        Insert: {
          created_at?: string
          home_owner_user_id: string
          id?: string
          rating: number
          rating_user_id: string
        }
        Update: {
          created_at?: string
          home_owner_user_id?: string
          id?: string
          rating?: number
          rating_user_id?: string
        }
        Relationships: []
      }
      user_stickers: {
        Row: {
          category: string | null
          created_at: string
          id: string
          rotation: number | null
          scale: number | null
          sticker_id: string
          sticker_src: string
          updated_at: string | null
          user_id: string
          x: number
          y: number
          z_index: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          rotation?: number | null
          scale?: number | null
          sticker_id: string
          sticker_src: string
          updated_at?: string | null
          user_id: string
          x?: number
          y?: number
          z_index?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          rotation?: number | null
          scale?: number | null
          sticker_id?: string
          sticker_src?: string
          updated_at?: string | null
          user_id?: string
          x?: number
          y?: number
          z_index?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_home_exists: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      extract_hotel_from_habbo_id: {
        Args: { habbo_id_param: string }
        Returns: string
      }
      get_auth_email_for_habbo: {
        Args: { habbo_name_param: string }
        Returns: string
      }
      get_auth_email_for_habbo_with_hotel: {
        Args: { habbo_name_param: string; hotel_param?: string }
        Returns: string
      }
      get_habbo_account_public_by_name: {
        Args: { habbo_name_param: string }
        Returns: {
          supabase_user_id: string
          habbo_name: string
          habbo_id: string
          hotel: string
        }[]
      }
      get_habbo_account_public_by_name_and_hotel: {
        Args: { habbo_name_param: string; hotel_param: string }
        Returns: {
          supabase_user_id: string
          habbo_name: string
          habbo_id: string
          hotel: string
        }[]
      }
      initialize_user_home: {
        Args: { user_uuid: string }
        Returns: undefined
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
