import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, Send, Trash2, AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useI18n } from '@/contexts/I18nContext';

interface PhotoComment {
  id: string;
  habbo_name: string;
  comment_text: string;
  created_at: string;
}

interface PhotoCommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: PhotoComment[];
  isLoading: boolean;
  onAddComment?: (comment: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onReportComment?: (commentId: string) => void;
  canDeleteComment?: (comment: PhotoComment) => boolean;
  isAddingComment?: boolean;  
  isDeletingComment?: boolean;
}

export const PhotoCommentsModal: React.FC<PhotoCommentsModalProps> = ({
  open,
  onOpenChange,
  comments,
  isLoading,
  onAddComment,
  onDeleteComment,
  onReportComment,
  canDeleteComment,
  isAddingComment = false,
  isDeletingComment = false
}) => {
  const { t } = useI18n();
  const [newComment, setNewComment] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [open]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Modal que desliza de baixo para cima */}
      <div 
        className={`relative w-full max-w-md bg-[#4A5568] text-white rounded-t-lg shadow-2xl transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">Comentários ({comments.length})</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="max-h-80 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-16">
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage 
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${comment.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                      alt={comment.habbo_name}
                    />
                    <AvatarFallback className="bg-white/20 text-white text-xs">
                      {comment.habbo_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{comment.habbo_name}</p>
                        <span className="text-xs text-white/50">
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
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onReportComment?.(comment.id)}
                          className="h-6 w-6 p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20"
                        >
                          <AlertTriangle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 break-words">
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-white/40" />
              <p>Nenhum comentário ainda</p>
            </div>
          )}
        </div>

        {/* Footer com input para adicionar comentário */}
        {onAddComment && (
          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('pages.console.addComment')}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={isAddingComment}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || isAddingComment}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isAddingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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