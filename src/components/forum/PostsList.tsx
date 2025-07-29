
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PostCard } from './PostCard';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  created_at: string;
  likes: number;
  category?: string;
}

interface PostsListProps {
  posts: ForumPost[];
  loading: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onLikePost: (postId: string) => void;
  currentUserId: string | null;
}

export const PostsList: React.FC<PostsListProps> = ({
  posts,
  loading,
  selectedCategory,
  setSelectedCategory,
  onLikePost,
  currentUserId
}) => {
  const categories = ['Todos', 'Geral', 'Suporte', 'Eventos'];

  return (
    <Card className="bg-white border-gray-900">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="volter-font">Tópicos Recentes</CardTitle>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded text-sm volter-font transition-colors ${
                  selectedCategory === category 
                    ? 'bg-white text-purple-600' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum post encontrado. Seja o primeiro a criar um!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={onLikePost}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
