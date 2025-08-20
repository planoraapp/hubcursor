import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  onAddComment: (text: string) => void;
  isAddingComment: boolean;
}

export const PhotoCommentsModal: React.FC<PhotoCommentsModalProps> = ({
  open,
  onOpenChange,
  comments,
  isLoading,
  onAddComment,
  isAddingComment
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
    } catch (error) {
      return 'há alguns momentos';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] p-0">
        <div className="bg-[#4A5568] text-white rounded-lg overflow-hidden flex flex-col">
          <DialogHeader className="p-4 pb-2 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Comentários ({comments.length})
            </DialogTitle>
          </DialogHeader>
          
          {/* Comments List */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="w-6 h-6 animate-spin text-white/60" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
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
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white">{comment.habbo_name}</p>
                        <span className="text-xs text-white/60">{formatTime(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-white/90 break-words">{comment.comment_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-white/40" />
                <p>Nenhum comentário ainda</p>
                <p className="text-xs text-white/40 mt-1">Seja o primeiro a comentar!</p>
              </div>
            )}
          </div>

          {/* Add Comment */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                maxLength={500}
                disabled={isAddingComment}
              />
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim() || isAddingComment}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 px-3"
              >
                {isAddingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};