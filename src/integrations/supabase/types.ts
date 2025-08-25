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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message_text: string
          message_type: string
          sender_habbo_name: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message_text: string
          message_type?: string
          sender_habbo_name: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message_text?: string
          message_type?: string
          sender_habbo_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      console_profile_comments: {
        Row: {
          author_habbo_name: string
          comment_text: string
          created_at: string | null
          id: string
          target_habbo_id: string | null
          target_habbo_name: string
          user_id: string | null
        }
        Insert: {
          author_habbo_name: string
          comment_text: string
          created_at?: string | null
          id?: string
          target_habbo_id?: string | null
          target_habbo_name: string
          user_id?: string | null
        }
        Update: {
          author_habbo_name?: string
          comment_text?: string
          created_at?: string | null
          id?: string
          target_habbo_id?: string | null
          target_habbo_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      console_profile_follows: {
        Row: {
          created_at: string | null
          follower_habbo_name: string
          follower_user_id: string | null
          id: string
          target_habbo_id: string | null
          target_habbo_name: string
        }
        Insert: {
          created_at?: string | null
          follower_habbo_name: string
          follower_user_id?: string | null
          id?: string
          target_habbo_id?: string | null
          target_habbo_name: string
        }
        Update: {
          created_at?: string | null
          follower_habbo_name?: string
          follower_user_id?: string | null
          id?: string
          target_habbo_id?: string | null
          target_habbo_name?: string
        }
        Relationships: []
      }
      console_profile_likes: {
        Row: {
          created_at: string | null
          id: string
          target_habbo_id: string | null
          target_habbo_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_habbo_id?: string | null
          target_habbo_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          target_habbo_id?: string | null
          target_habbo_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          date: string
          id: number
          last_tracked_timestamp: string | null
          metadata: Json | null
          total_tracked_items: number | null
        }
        Insert: {
          date?: string
          id?: never
          last_tracked_timestamp?: string | null
          metadata?: Json | null
          total_tracked_items?: number | null
        }
        Update: {
          date?: string
          id?: never
          last_tracked_timestamp?: string | null
          metadata?: Json | null
          total_tracked_items?: number | null
        }
        Relationships: []
      }
      daily_friend_activities: {
        Row: {
          activities_summary: Json | null
          activity_date: string
          badges_gained: string[] | null
          created_at: string | null
          figure_changes: Json | null
          groups_joined: Json | null
          hotel: string
          id: string
          last_updated: string | null
          motto_changed: string | null
          photos_posted: Json | null
          rooms_created: Json | null
          session_start: string | null
          total_changes: number | null
          user_habbo_id: string
          user_habbo_name: string
        }
        Insert: {
          activities_summary?: Json | null
          activity_date?: string
          badges_gained?: string[] | null
          created_at?: string | null
          figure_changes?: Json | null
          groups_joined?: Json | null
          hotel?: string
          id?: string
          last_updated?: string | null
          motto_changed?: string | null
          photos_posted?: Json | null
          rooms_created?: Json | null
          session_start?: string | null
          total_changes?: number | null
          user_habbo_id: string
          user_habbo_name: string
        }
        Update: {
          activities_summary?: Json | null
          activity_date?: string
          badges_gained?: string[] | null
          created_at?: string | null
          figure_changes?: Json | null
          groups_joined?: Json | null
          hotel?: string
          id?: string
          last_updated?: string | null
          motto_changed?: string | null
          photos_posted?: Json | null
          rooms_created?: Json | null
          session_start?: string | null
          total_changes?: number | null
          user_habbo_id?: string
          user_habbo_name?: string
        }
        Relationships: []
      }
      daily_tracking: {
        Row: {
          date: string
          id: number
          last_tracked_timestamp: string | null
          metadata: Json | null
          total_activities: number | null
        }
        Insert: {
          date?: string
          id?: never
          last_tracked_timestamp?: string | null
          metadata?: Json | null
          total_activities?: number | null
        }
        Update: {
          date?: string
          id?: never
          last_tracked_timestamp?: string | null
          metadata?: Json | null
          total_activities?: number | null
        }
        Relationships: []
      }
      detected_changes: {
        Row: {
          change_description: string
          change_details: Json | null
          change_type: string
          created_at: string
          detected_at: string
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          new_snapshot_id: string
          old_snapshot_id: string | null
        }
        Insert: {
          change_description: string
          change_details?: Json | null
          change_type: string
          created_at?: string
          detected_at?: string
          habbo_id: string
          habbo_name: string
          hotel?: string
          id?: string
          new_snapshot_id: string
          old_snapshot_id?: string | null
        }
        Update: {
          change_description?: string
          change_details?: Json | null
          change_type?: string
          created_at?: string
          detected_at?: string
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          new_snapshot_id?: string
          old_snapshot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_new_snapshot"
            columns: ["new_snapshot_id"]
            isOneToOne: false
            referencedRelation: "user_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_old_snapshot"
            columns: ["old_snapshot_id"]
            isOneToOne: false
            referencedRelation: "user_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      discovered_users: {
        Row: {
          created_at: string | null
          discovery_source: string | null
          figure_string: string | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          is_online: boolean | null
          last_seen_at: string | null
          motto: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discovery_source?: string | null
          figure_string?: string | null
          habbo_id: string
          habbo_name: string
          hotel?: string
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          motto?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discovery_source?: string | null
          figure_string?: string | null
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          motto?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      friends_activities: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string
          detected_at: string
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          new_data: Json
          old_data: Json | null
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string
          detected_at?: string
          habbo_id: string
          habbo_name: string
          hotel?: string
          id?: string
          new_data: Json
          old_data?: Json | null
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string
          detected_at?: string
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          new_data?: Json
          old_data?: Json | null
        }
        Relationships: []
      }
      friends_processing_queue: {
        Row: {
          created_at: string
          error_message: string | null
          friend_habbo_id: string | null
          friend_habbo_name: string
          hotel: string
          id: string
          last_processed_at: string | null
          max_retries: number
          priority: number
          retry_count: number
          status: string
          updated_at: string
          user_habbo_id: string
          user_habbo_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          friend_habbo_id?: string | null
          friend_habbo_name: string
          hotel?: string
          id?: string
          last_processed_at?: string | null
          max_retries?: number
          priority?: number
          retry_count?: number
          status?: string
          updated_at?: string
          user_habbo_id: string
          user_habbo_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          friend_habbo_id?: string | null
          friend_habbo_name?: string
          hotel?: string
          id?: string
          last_processed_at?: string | null
          max_retries?: number
          priority?: number
          retry_count?: number
          status?: string
          updated_at?: string
          user_habbo_id?: string
          user_habbo_name?: string
        }
        Relationships: []
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
          figure_string: string | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          is_admin: boolean
          is_online: boolean | null
          motto: string | null
          supabase_user_id: string
        }
        Insert: {
          created_at?: string
          figure_string?: string | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id?: string
          is_admin?: boolean
          is_online?: boolean | null
          motto?: string | null
          supabase_user_id: string
        }
        Update: {
          created_at?: string
          figure_string?: string | null
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          is_admin?: boolean
          is_online?: boolean | null
          motto?: string | null
          supabase_user_id?: string
        }
        Relationships: []
      }
      habbo_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          details: Json | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          photo_id: string | null
          photo_url: string | null
          snapshot_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          details?: Json | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id?: string
          photo_id?: string | null
          photo_url?: string | null
          snapshot_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          details?: Json | null
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          photo_id?: string | null
          photo_url?: string | null
          snapshot_id?: string | null
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
      habbo_photos: {
        Row: {
          caption: string | null
          created_at: string
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          internal_user_id: string | null
          likes_count: number | null
          photo_id: string
          photo_type: string | null
          preview_url: string | null
          room_name: string | null
          s3_url: string
          source: string | null
          taken_date: string | null
          timestamp_taken: number | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          habbo_id: string
          habbo_name: string
          hotel?: string
          id?: string
          internal_user_id?: string | null
          likes_count?: number | null
          photo_id: string
          photo_type?: string | null
          preview_url?: string | null
          room_name?: string | null
          s3_url: string
          source?: string | null
          taken_date?: string | null
          timestamp_taken?: number | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          internal_user_id?: string | null
          likes_count?: number | null
          photo_id?: string
          photo_type?: string | null
          preview_url?: string | null
          room_name?: string | null
          s3_url?: string
          source?: string | null
          taken_date?: string | null
          timestamp_taken?: number | null
          updated_at?: string
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
      market_listings: {
        Row: {
          asking_item_name: string | null
          asking_item_type: string | null
          asking_price: number | null
          created_at: string
          description: string | null
          id: string
          item_id: string
          item_image_url: string | null
          item_name: string
          item_type: string
          seller_habbo_name: string
          seller_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          asking_item_name?: string | null
          asking_item_type?: string | null
          asking_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          item_id: string
          item_image_url?: string | null
          item_name: string
          item_type: string
          seller_habbo_name: string
          seller_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          asking_item_name?: string | null
          asking_item_type?: string | null
          asking_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          item_id?: string
          item_image_url?: string | null
          item_name?: string
          item_type?: string
          seller_habbo_name?: string
          seller_user_id?: string
          status?: string
          updated_at?: string
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
      profile_snapshots: {
        Row: {
          badges: Json | null
          created_at: string | null
          figure_string: string | null
          friends_count: number | null
          groups_count: number | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          motto: string | null
          photos: Json | null
          raw_profile_data: Json | null
          snapshot_date: string | null
        }
        Insert: {
          badges?: Json | null
          created_at?: string | null
          figure_string?: string | null
          friends_count?: number | null
          groups_count?: number | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id?: string
          motto?: string | null
          photos?: Json | null
          raw_profile_data?: Json | null
          snapshot_date?: string | null
        }
        Update: {
          badges?: Json | null
          created_at?: string | null
          figure_string?: string | null
          friends_count?: number | null
          groups_count?: number | null
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          motto?: string | null
          photos?: Json | null
          raw_profile_data?: Json | null
          snapshot_date?: string | null
        }
        Relationships: []
      }
      tracked_habbo_users: {
        Row: {
          created_at: string
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          habbo_id: string
          habbo_name: string
          hotel?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      trade_offers: {
        Row: {
          buyer_habbo_name: string
          buyer_user_id: string
          created_at: string
          id: string
          listing_id: string
          message: string | null
          offered_credits: number | null
          offered_item_id: string | null
          offered_item_name: string | null
          offered_item_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          buyer_habbo_name: string
          buyer_user_id: string
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          offered_credits?: number | null
          offered_item_id?: string | null
          offered_item_name?: string | null
          offered_item_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_habbo_name?: string
          buyer_user_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          offered_credits?: number | null
          offered_item_id?: string | null
          offered_item_name?: string | null
          offered_item_type?: string | null
          status?: string
          updated_at?: string
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
      user_home_widgets: {
        Row: {
          config: Json | null
          created_at: string
          height: number
          id: string
          is_visible: boolean
          updated_at: string
          user_id: string
          widget_type: string
          width: number
          x: number
          y: number
          z_index: number
        }
        Insert: {
          config?: Json | null
          created_at?: string
          height?: number
          id?: string
          is_visible?: boolean
          updated_at?: string
          user_id: string
          widget_type: string
          width?: number
          x?: number
          y?: number
          z_index?: number
        }
        Update: {
          config?: Json | null
          created_at?: string
          height?: number
          id?: string
          is_visible?: boolean
          updated_at?: string
          user_id?: string
          widget_type?: string
          width?: number
          x?: number
          y?: number
          z_index?: number
        }
        Relationships: []
      }
      user_profile_changes: {
        Row: {
          change_description: string | null
          change_type: string
          created_at: string | null
          detected_at: string | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          change_description?: string | null
          change_type: string
          created_at?: string | null
          detected_at?: string | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          change_description?: string | null
          change_type?: string
          created_at?: string | null
          detected_at?: string | null
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      user_snapshots: {
        Row: {
          badges: Json | null
          created_at: string
          figure_string: string | null
          friends: Json | null
          groups: Json | null
          habbo_id: string
          habbo_name: string
          hotel: string
          id: string
          motto: string | null
          online: boolean | null
          raw_profile_data: Json | null
          rooms: Json | null
          snapshot_timestamp: string
        }
        Insert: {
          badges?: Json | null
          created_at?: string
          figure_string?: string | null
          friends?: Json | null
          groups?: Json | null
          habbo_id: string
          habbo_name: string
          hotel?: string
          id?: string
          motto?: string | null
          online?: boolean | null
          raw_profile_data?: Json | null
          rooms?: Json | null
          snapshot_timestamp?: string
        }
        Update: {
          badges?: Json | null
          created_at?: string
          figure_string?: string | null
          friends?: Json | null
          groups?: Json | null
          habbo_id?: string
          habbo_name?: string
          hotel?: string
          id?: string
          motto?: string | null
          online?: boolean | null
          raw_profile_data?: Json | null
          rooms?: Json | null
          snapshot_timestamp?: string
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
      cleanup_old_daily_activities: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_friends_activities: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_snapshots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_processed_queue_items: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
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
          habbo_id: string
          habbo_name: string
          hotel: string
          supabase_user_id: string
        }[]
      }
      get_habbo_account_public_by_name_and_hotel: {
        Args: { habbo_name_param: string; hotel_param: string }
        Returns: {
          habbo_id: string
          habbo_name: string
          hotel: string
          supabase_user_id: string
        }[]
      }
      get_habbo_activity_feed: {
        Args: {
          p_days_back?: number
          p_limit?: number
          p_user_habbo_name?: string
        }
        Returns: {
          activity_description: string
          activity_type: string
          details: Json
          detected_at: string
          habbo_name: string
        }[]
      }
      get_next_queue_batch: {
        Args: { p_batch_size?: number }
        Returns: {
          friend_habbo_id: string
          friend_habbo_name: string
          hotel: string
          id: string
          priority: number
          retry_count: number
          user_habbo_id: string
          user_habbo_name: string
        }[]
      }
      initialize_daily_activities_tracker: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: string
        }[]
      }
      initialize_daily_tracker: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: string
        }[]
      }
      initialize_user_home: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      initialize_user_home_complete: {
        Args: { user_habbo_name: string; user_uuid: string }
        Returns: undefined
      }
      mark_queue_item_completed: {
        Args: { p_id: string }
        Returns: undefined
      }
      mark_queue_item_failed: {
        Args: { p_error_message?: string; p_id: string }
        Returns: undefined
      }
      populate_friends_queue: {
        Args: {
          p_hotel?: string
          p_user_habbo_id: string
          p_user_habbo_name: string
        }
        Returns: number
      }
      restart_stalled_queue_processing: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      summarize_habbo_activities: {
        Args: { p_days_back?: number; p_habbo_name?: string }
        Returns: {
          activity_category: string
          first_occurrence: string
          last_occurrence: string
          total_activities: number
        }[]
      }
      trigger_emergency_processing: {
        Args: {
          p_hotel?: string
          p_user_habbo_id: string
          p_user_habbo_name: string
        }
        Returns: string
      }
      update_daily_activities: {
        Args: {
          activity_name: string
          extra_metadata?: Json
          increment_value?: number
        }
        Returns: {
          activity: string
          current_total: number
          tracked_at: string
        }[]
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
