import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { usePhotoInteractions } from '@/hooks/usePhotoInteractions';
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
}

export const FriendsPhotoCard: React.FC<FriendsPhotoCardProps> = ({
  photo,
  currentUser,
  onNavigateToProfile,
  onLike,
  onComment
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const { getPhotoInteractions } = usePhotoInteractions();
  
  const interactions = getPhotoInteractions(photo.id);
  const isLiked = interactions.isLiked;
  const totalLikes = interactions.likes + photo.likes;
  const comments = interactions.comments || [];

  const handleLike = () => {
    onLike(photo.id);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && !isCommenting) {
      setIsCommenting(true);
      try {
        await onComment(photo.id, newComment.trim());
        setNewComment('');
      } finally {
        setIsCommenting(false);
      }
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
    <div className="bg-white/10 rounded-lg border border-black overflow-hidden mb-4">
      {/* Header com avatar e nome */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={photo.userAvatar}
            alt={photo.userName}
            className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigateToProfile(photo.userName)}
          />
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

      {/* Foto principal */}
      <div className="relative">
        <img
          src={photo.imageUrl}
          alt={`Foto de ${photo.userName}`}
          className="w-full max-h-96 object-contain bg-gray-900"
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

      {/* Ações (curtir, comentar, compartilhar) */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-white/60 hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{totalLikes}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-white/60 hover:text-blue-400 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">{comments.length}</span>
          </button>
          
          <button className="text-white/60 hover:text-green-400 transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Comentários */}
      {showComments && (
        <div className="p-3 bg-white/5">
          {/* Lista de comentários */}
          {comments.length > 0 && (
            <div className="space-y-2 mb-3">
              {comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <span className="font-semibold text-white text-sm">
                    {comment.author}:
                  </span>
                  <span className="text-white/80 text-sm">
                    {comment.message}
                  </span>
                </div>
              ))}
              {comments.length > 3 && (
                <button className="text-white/60 text-xs hover:text-white transition-colors">
                  Ver todos os {comments.length} comentários
                </button>
              )}
            </div>
          )}

          {/* Campo para novo comentário */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm"
              disabled={isCommenting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isCommenting}
              className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-semibold rounded transition-colors text-sm"
            >
              {isCommenting ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
