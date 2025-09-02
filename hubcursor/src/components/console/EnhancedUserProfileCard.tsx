
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, UserPlus, UserMinus, Send, Trash2, Calendar, MapPin } from 'lucide-react';
import { HabboUser } from '@/services/habboProxyService';
import { ConsoleComment } from '@/services/consoleInteractionsService';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';

interface EnhancedUserProfileCardProps {
  user: HabboUser;
  likes: any[];
  comments: ConsoleComment[];
  hasLiked: boolean;
  isFollowing: boolean;
  getAvatarUrl: (figureString: string, size?: string) => string;
  getBadgeUrl: (badgeCode: string) => string;
  onToggleLike: () => Promise<boolean>;
  onAddComment: (comment: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  onToggleFollow: () => Promise<boolean>;
}

export const EnhancedUserProfileCard: React.FC<EnhancedUserProfileCardProps> = ({
  user,
  likes,
  comments,
  hasLiked,
  isFollowing,
  getAvatarUrl,
  getBadgeUrl,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onToggleFollow
}) => {
  const { habboAccount } = useUnifiedAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    if (!habboAccount) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para curtir perfis.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onToggleLike();
      if (success) {
        toast({
          title: hasLiked ? "Curtida removida!" : "Perfil curtido!",
          description: hasLiked ? "Você removeu sua curtida deste perfil." : "Você curtiu este perfil!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar a ação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollow = async () => {
    if (!habboAccount) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para seguir usuários.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onToggleFollow();
      if (success) {
        toast({
          title: isFollowing ? "Deixou de seguir!" : "Agora seguindo!",
          description: isFollowing ? `Você deixou de seguir ${user.name}.` : `Você agora está seguindo ${user.name}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar a ação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboAccount) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive"
      });
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onAddComment(commentText);
      if (success) {
        setCommentText('');
        toast({
          title: "Comentário adicionado!",
          description: "Seu comentário foi publicado com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setIsSubmitting(true);
    try {
      const success = await onDeleteComment(commentId);
      if (success) {
        toast({
          title: "Comentário removido!",
          description: "O comentário foi removido com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20 border-2 border-gray-200">
            <AvatarImage src={getAvatarUrl(user.figureString, 'l')} alt={user.name} />
            <AvatarFallback className="text-lg font-bold">
              {user.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {user.name}
                <div className={`w-3 h-3 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </h2>
              
              <div className="flex gap-2">
                <Button
                  variant={hasLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {likes.length}
                </Button>
                
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 italic mb-3">"{user.motto}"</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Desde {user.memberSince}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Badges Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🏆</span>
            Emblemas Destacados
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.selectedBadges?.slice(0, 8).map((badge, index) => (
              <div key={index} className="flex flex-col items-center">
                <img 
                  src={getBadgeUrl(badge.code)} 
                  alt={badge.name}
                  className="w-8 h-8"
                  title={badge.name}
                />
              </div>
            )) || <p className="text-gray-500 text-sm">Nenhum emblema destacado</p>}
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentários ({comments.length})
          </h3>
          
          {/* Add Comment Form */}
          {habboAccount && (
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Escreva um comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <Button 
                  type="submit" 
                  disabled={!commentText.trim() || isSubmitting}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
          
          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-blue-600">
                      {comment.author_habbo_name}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{comment.comment_text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  {habboAccount && comment.author_habbo_name === habboAccount.habbo_name && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
