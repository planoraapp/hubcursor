import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
}

interface PhotoData {
  id: string;
  url: string;
  likes: number;
  comments: Comment[];
}

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: PhotoData | null;
  userName: string;
  onLike?: (photoId: string) => void;
  onComment?: (photoId: string, comment: string) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ 
  isOpen, 
  onClose, 
  photo,
  userName,
  onLike,
  onComment
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(photo?.likes || 0);

  const handleLike = () => {
    if (!photo) return;
    
    setIsLiked(!isLiked);
    setLocalLikes(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(photo.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !newComment.trim() || !user) return;
    
    onComment?.(photo.id, newComment.trim());
    setNewComment('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-transparent border-0 p-0 overflow-hidden rounded-lg" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
        backgroundSize: '100% 2px'
      }}>
        {/* Borda superior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <DialogHeader className="p-4 relative z-10">
            <DialogTitle className="flex items-center gap-2 text-black font-bold volter-font" style={{
              textShadow: '1px 1px 0px rgba(0,0,0,0.3)'
            }}>
              <MessageCircle className="w-5 h-5 text-black" />
              Foto de {userName}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        {/* Conteúdo principal */}
        <div className="bg-gray-900 relative overflow-hidden" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px'
        }}>
          <div className="flex flex-col lg:flex-row h-[70vh]">
            {/* Imagem */}
            <div className="flex-1 flex items-center justify-center bg-black/20">
              <img
                src={photo.url}
                alt={`Foto de ${userName}`}
                className="max-w-full max-h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            {/* Sidebar com interações */}
            <div className="w-full lg:w-80 border-l border-white/20 bg-white/5">
              {/* Contadores */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{localLikes}</span>
                  </button>
                  
                  <div className="flex items-center gap-2 text-white/70">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{photo.comments.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Comentários */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-3">
                    {photo.comments.length === 0 ? (
                      <div className="text-center text-white/50 py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum comentário ainda</p>
                        <p className="text-xs">Seja o primeiro a comentar!</p>
                      </div>
                    ) : (
                      photo.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{comment.author}</span>
                              <span className="text-xs text-white/50">{formatDate(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm text-white/80">{comment.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Campo de comentário */}
              {user && (
                <div className="p-4 border-t border-white/10">
                  <form onSubmit={handleComment} className="flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicionar comentário..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-3"
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Borda inferior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-t-0 rounded-b-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <div className="p-2 relative z-10"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
