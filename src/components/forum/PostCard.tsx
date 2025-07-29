
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { ForumPost, ForumComment } from '../../types/forum';

interface PostCardProps {
  post: ForumPost;
  onLike: (postId: string) => Promise<void>;
  currentUserId: string | null;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, currentUserId }) => {
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [isCommenting, setIsCommenting] = useState<boolean>(false);
  const { toast } = useToast();
  const { habboAccount } = useAuth();

  const handleAddComment = async (): Promise<void> => {
    if (!newComment.trim() || !currentUserId || !habboAccount) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive"
      });
      return;
    }

    setIsCommenting(true);
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: post.id,
        content: newComment.trim(),
        author_supabase_user_id: currentUserId,
        author_habbo_name: habboAccount.habbo_name,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar comentário",
        variant: "destructive"
      });
    } else {
      setComments([...comments, data]);
      setNewComment('');
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso!"
      });
    }
    setIsCommenting(false);
  };

  useEffect(() => {
    if (showComments) {
      const fetchComments = async (): Promise<void> => {
        setLoadingComments(true);
        const { data, error } = await supabase
          .from('forum_comments')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching comments:', error);
        } else {
          setComments(data || []);
        }
        setLoadingComments(false);
      };
      fetchComments();
    }
  }, [showComments, post.id]);

  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
        {post.image_url && (
          <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-auto overflow-hidden rounded-lg">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800 volter-font">{post.title}</h3>
            {post.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {post.category}
              </span>
            )}
          </div>
          <p className="text-gray-700 text-sm mb-3">{post.content}</p>
          <div className="text-xs text-gray-500 mb-4">
            Por <span className="font-semibold">{post.author_habbo_name}</span> em{' '}
            {new Date(post.created_at).toLocaleDateString('pt-BR')}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              disabled={!currentUserId}
            >
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </Button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          <h4 className="font-semibold mb-3 volter-font">Comentários</h4>
          {loadingComments ? (
            <p className="text-gray-500">Carregando comentários...</p>
          ) : (
            <div className="space-y-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Por {comment.author_habbo_name} em{' '}
                    {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {currentUserId ? (
            <div className="flex space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1"
              />
              <Button 
                onClick={handleAddComment} 
                size="sm"
                disabled={isCommenting}
                className="bg-green-600 hover:bg-green-700 text-white volter-font"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Faça login para comentar</p>
          )}
        </div>
      )}
    </div>
  );
};
