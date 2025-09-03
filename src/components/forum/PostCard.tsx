
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Heart, MessageSquare, Clock } from 'lucide-react';
import { ClickableUserName } from '../ClickableUserName';
import type { ForumPost } from '../../types/forum';

interface PostCardProps {
  post: ForumPost;
  onLike: (postId: string) => Promise<void>;
  currentUserId: string | null;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, currentUserId }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-gray-900 bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 border-2 border-gray-300">
            <AvatarImage 
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-61.ch-210-66.lg-280-110.sh-305-62&size=m&direction=2&head_direction=2&gesture=sml`}
              alt={post.author_habbo_name}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
              {post.author_habbo_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClickableUserName habboName={post.author_habbo_name} />
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(post.created_at)}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 volter-font">
              {post.title}
            </h3>

            <div className="text-gray-700 mb-4 whitespace-pre-wrap">
              {post.content}
            </div>

            {post.image_url && (
              <div className="mb-4">
                <img 
                  src={post.image_url} 
                  alt="Post" 
                  className="max-w-full h-auto rounded-lg border border-gray-300 max-h-96 object-contain"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                  disabled={!currentUserId}
                >
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                  disabled={!currentUserId}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Comentar</span>
                </Button>
              </div>

              {post.category && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {post.category}
                </div>
              )}
            </div>

            {!currentUserId && (
              <div className="mt-2 text-xs text-gray-500 italic">
                Faça login para curtir e comentar
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
