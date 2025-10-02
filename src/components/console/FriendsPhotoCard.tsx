import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
  timestamp?: number;
}

interface FriendsPhotoCardProps {
  photo: FriendPhoto;
  currentUser: string;
  onNavigateToProfile: (username: string) => void;
  onLike: (photoId: string) => void;
  onComment: (photoId: string, comment: string) => void;
  showLikesModal: boolean;
  setShowLikesModal: (show: boolean) => void;
  showCommentsModal: boolean;
  setShowCommentsModal: (show: boolean) => void;
}

export const FriendsPhotoCard: React.FC<FriendsPhotoCardProps> = ({
  photo,
  currentUser,
  onNavigateToProfile,
  onLike,
  onComment,
  showLikesModal,
  setShowLikesModal,
  showCommentsModal,
  setShowCommentsModal
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Hooks Supabase para curtidas e comentários
  const { 
    likes, 
    likesCount, 
    userLiked, 
    toggleLike, 
    isToggling: isTogglingLike 
  } = usePhotoLikes(photo.id);
  
  const { 
    comments, 
    commentsCount, 
    addComment, 
    deleteComment, 
    canDeleteComment, 
    isAddingComment, 
    isDeletingComment 
  } = usePhotoComments(photo.id);

  const handleLike = () => {
    toggleLike();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment.trim());
      setNewComment('');
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'agora';
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'agora';
    }
  };

  return (
    <div className="overflow-hidden mb-4 relative">
          {/* Header com avatar e nome - acima da foto */}
          <div className="px-1 py-2 bg-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
                <img
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${photo.userName}&size=l&direction=2&head_direction=3&headonly=1`}
                  alt={photo.userName}
                  className="w-full h-full cursor-pointer transition-opacity object-cover"
                  style={{ imageRendering: 'pixelated' }}
                  onClick={() => onNavigateToProfile(photo.userName)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${photo.userName}&size=l&direction=2&head_direction=3&headonly=1`;
                  }}
                />
              </div>
              <div className="flex-1">
                <button
                  onClick={() => onNavigateToProfile(photo.userName)}
                  className="font-semibold text-white hover:text-yellow-400 transition-colors"
                >
                  {photo.userName}
                </button>
                <div className="text-xs text-white/60">
                  {formatTime(photo.timestamp)}
                </div>
              </div>
              <button className="text-white/60 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Foto principal - ocupando toda a largura disponível */}
          <div className="relative">
            <img
              src={photo.imageUrl}
              alt={`Foto de ${photo.userName}`}
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            
            {/* Hub.gif logo - canto inferior esquerdo */}
            <div className="absolute bottom-2 left-2">
              <img
                src="/hub.gif"
                alt="Hub"
                className="w-6 h-6 opacity-80"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Ações (curtir, comentar, compartilhar) - posicionadas abaixo da foto */}
          <div className="px-1 py-2 bg-transparent">
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={isTogglingLike}
                className={`flex items-center gap-2 transition-colors ${
                  userLiked ? 'text-red-500' : 'text-white/60 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${userLiked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLikesModal(true);
                }}
                className="text-sm font-medium hover:underline text-white/60 hover:text-white"
              >
                {likesCount}
              </button>
            </div>
              
            <button
              onClick={() => setShowCommentsModal(true)}
              className="flex items-center gap-2 text-white/60 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>
            </div>
          </div>

          {/* Campo para novo comentário - sempre visível */}
          <div className="px-1 py-2 bg-transparent">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              {/* Avatar do usuário logado */}
              <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                <img
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${currentUser}&size=m&direction=4&head_direction=2&headonly=1`}
                  alt={currentUser}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${currentUser}&size=m&direction=4&head_direction=2&headonly=1`;
                  }}
                />
              </div>
              
              {/* Campo de texto com seta interna */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm"
                disabled={isAddingComment}
                />
                {/* Seta de enviar - só aparece quando há texto */}
                {newComment.trim() && (
                  <button
                    type="submit"
                    disabled={isAddingComment}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
        </div>

      </div>
    );
  };
