
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  created_at: string;
  likes: number;
  category: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  created_at: string;
}

export interface ForumPostWithComments extends ForumPost {
  comments?: ForumComment[];
  comments_count?: number;
}
