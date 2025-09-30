import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Trash2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhotoComment {
  id: string;
  habbo_name: string;
  comment_text: string;
  created_at: string;
}

interface PhotoCommentsModalProps {
  comments: PhotoComment[];
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (comment: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onReportComment?: (commentId: string) => void;
  canDeleteComment?: (comment: PhotoComment) => boolean;
  isAddingComment?: boolean;
  isDeletingComment?: boolean;
}

export const PhotoCommentsModal: React.FC<PhotoCommentsModalProps> = ({
  comments,
  isOpen,
  onClose,
  onAddComment,
  onDeleteComment,
  onReportComment,
  canDeleteComment,
  isAddingComment = false,
  isDeletingComment = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'agora';
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`absolute bottom-16 left-4 right-4 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleBackdropClick}
    >
      <div className={`w-full bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-out max-h-[50vh] flex flex-col ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Header melhorado */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <MessageCircle className="w-5 h-5" />
            Comentários ({comments.length})
          </h3>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="sm" 
            className="text-gray-900 hover:bg-gray-900/20 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Área de comentários com scroll melhorado */}
        <div className="flex-1 overflow-y-auto comments-scroll">
          <div className="p-4">
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 flex-shrink-0">
                      <img
                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${comment.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                        alt={comment.habbo_name}
                        className="w-full h-full rounded-lg border border-yellow-400/30"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${comment.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{comment.habbo_name}</p>
                          <span className="text-xs text-yellow-400/70 bg-yellow-400/10 px-2 py-1 rounded-full">
                            {formatTime(comment.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canDeleteComment && canDeleteComment(comment) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteComment?.(comment.id)}
                              disabled={isDeletingComment}
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-full"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onReportComment?.(comment.id)}
                            className="h-7 w-7 p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 rounded-full"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-white/90 break-words leading-relaxed">
                        {comment.comment_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-yellow-400/60" />
                </div>
                <p className="text-lg font-medium">Nenhum comentário ainda</p>
                <p className="text-sm text-white/40 mt-1">Seja o primeiro a comentar!</p>
              </div>
            )}
          </div>
        </div>

        {/* Campo de adicionar comentário melhorado */}
        {onAddComment && (
          <div className="p-4 bg-gray-800/50 border-t border-yellow-400/30">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 px-4 py-3 bg-white/10 border border-yellow-400/30 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/15 text-sm transition-all"
                disabled={isAddingComment}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || isAddingComment}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isAddingComment ? (
                  <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos CSS personalizados para o modal
const styles = `
  .comments-scroll {
    scrollbar-width: thin;
    scrollbar-color: #fbbf24 #374151;
  }
  
  .comments-scroll::-webkit-scrollbar {
    width: 6px;
  }
  
  .comments-scroll::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 3px;
  }
  
  .comments-scroll::-webkit-scrollbar-thumb {
    background: #fbbf24;
    border-radius: 3px;
  }
  
  .comments-scroll::-webkit-scrollbar-thumb:hover {
    background: #f59e0b;
  }
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.head.querySelector('style[data-comments-modal]')) {
    styleSheet.setAttribute('data-comments-modal', 'true');
    document.head.appendChild(styleSheet);
  }
}
