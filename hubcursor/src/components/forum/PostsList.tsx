
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ForumPost } from '../../types/forum';

interface PostsListProps {
  posts: ForumPost[];
  loading?: boolean;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  onLikePost?: (postId: string) => void;
  currentUserId?: string | null;
  categories?: string[];
}

export const PostsList: React.FC<PostsListProps> = ({ 
  posts, 
  loading = false, 
  selectedCategory = 'Todos',
  setSelectedCategory,
  onLikePost,
  currentUserId,
  categories = []
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-2 border-black animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      {categories.length > 0 && setSelectedCategory && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg volter-font transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <Card className="border-2 border-black">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl volter-font mb-2">Nenhum post encontrado</h3>
            <p className="text-gray-600 volter-font">
              Seja o primeiro a compartilhar algo interessante!
            </p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="forum-post hover:shadow-lg transition-shadow border-2 border-black">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white volter-font habbo-outline-sm px-3 py-1">
                      {post.category || 'Geral'}
                    </Badge>
                    <span className="text-sm text-gray-500 volter-font">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg volter-font font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-700 volter-font text-sm mb-3">
                    {post.content.length > 200 
                      ? `${post.content.substring(0, 200)}...` 
                      : post.content
                    }
                  </p>

                  {post.image_url && (
                    <div className="mb-3">
                      <img 
                        src={post.image_url} 
                        alt="Post" 
                        className="max-w-full h-auto rounded-lg border border-gray-300 max-h-64 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="volter-font">Por: {post.author_habbo_name}</span>
                    <button
                      onClick={() => onLikePost?.(post.id)}
                      disabled={!currentUserId}
                      className="volter-font flex items-center gap-1 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
                    >
                      👍 {post.likes || 0}
                    </button>
                    <span className="volter-font">💬 0 respostas</span>
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {post.author_habbo_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
