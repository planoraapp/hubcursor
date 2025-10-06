import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { EnhancedPhoto } from '@/types/habbo';

interface IndividualPhotoViewProps {
  photo: {
    id: string;
    imageUrl: string;
    date: string;
    likes: number;
  };
  userName: string;
  onBack: () => void;
  onUserClick?: (userName: string) => void;
}

export const IndividualPhotoView: React.FC<IndividualPhotoViewProps> = ({
  photo,
  userName,
  onBack,
  onUserClick = () => {}
}) => {
  const [commentText, setCommentText] = useState('');
  const [showLikesPopover, setShowLikesPopover] = useState(false);
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  
  const handleLikesClick = () => {
    setShowLikesPopover(!showLikesPopover);
    setShowCommentsPopover(false);
  };
  
  const handleCommentsClick = () => {
    setShowCommentsPopover(!showCommentsPopover);
    setShowLikesPopover(false);
  };
  
  // Converter para formato EnhancedPhoto
  const enhancedPhoto: EnhancedPhoto = {
    id: photo.id,
    photo_id: photo.id,
    userName: userName,
    imageUrl: photo.imageUrl,
    date: photo.date,
    likes: [],
    likesCount: typeof photo.likes === 'number' ? photo.likes : 0,
    userLiked: false,
    type: 'PHOTO',
    caption: '',
    roomName: ''
  };

  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-transparent border-b border-white/10 flex-shrink-0">
        <Button 
          onClick={onBack}
          size="sm"
          variant="ghost" 
          className="text-white/80 hover:text-white hover:bg-white/10 p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold text-white">Foto de {userName}</h2>
      </div>

      {/* Container principal com scroll */}
      <div className="flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Header da foto com avatar e info do usuário */}
            <div className="px-1 py-2 bg-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userName}&size=l&direction=2&head_direction=3&headonly=1`} 
                    alt={userName} 
                    className="w-full h-full cursor-pointer transition-opacity object-cover" 
                    style={{imageRendering: 'pixelated'}}
                    onClick={() => onUserClick(userName)}
                  />
                </div>
                <div className="flex-1">
                  <button 
                    className="font-semibold text-white hover:text-yellow-400 transition-colors"
                    onClick={() => onUserClick(userName)}
                  >
                    {userName}
                  </button>
                  <div className="text-xs text-white/60">{photo.date}</div>
                </div>
                <button className="text-white/60 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Imagem da foto */}
            <div className="relative">
              <img 
                src={photo.imageUrl} 
                alt={`Foto de ${userName}`} 
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-2 left-2">
                <img src="/hub.gif" alt="Hub" className="w-6 h-6 opacity-80" style={{display: 'none'}} />
              </div>
              
              {/* Popover de Likes */}
              {showLikesPopover && (
                <div className="absolute inset-0 z-50 flex items-end justify-center">
                  {/* Overlay escuro */}
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowLikesPopover(false)}
                  ></div>
                  
                  {/* Modal que desliza de baixo para cima */}
                  <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col transform transition-all duration-300 ease-out">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
                      <h3 className="text-sm font-bold text-white" style={{
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                      }}>
                        Curtidas
                      </h3>
                      <button 
                        onClick={() => setShowLikesPopover(false)}
                        className="text-white hover:bg-white/20 rounded-full p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="text-center text-white/60 text-sm">
                        Sistema de curtidas em desenvolvimento
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Popover de Comentários */}
              {showCommentsPopover && (
                <div className="absolute inset-0 z-50 flex items-end justify-center">
                  {/* Overlay escuro */}
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowCommentsPopover(false)}
                  ></div>
                  
                  {/* Modal que desliza de baixo para cima */}
                  <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col transform transition-all duration-300 ease-out">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
                      <h3 className="text-sm font-bold text-white" style={{
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                      }}>
                        Comentários
                      </h3>
                      <button 
                        onClick={() => setShowCommentsPopover(false)}
                        className="text-white hover:bg-white/20 rounded-full p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="text-center text-white/60 text-sm">
                        Sistema de comentários em desenvolvimento
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ações da foto (like e comentários) */}
            <div className="px-1 py-2 bg-transparent">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleLikesClick}
                    className="flex items-center gap-2 transition-colors text-white/60 hover:text-red-500"
                  >
                    <Heart className="w-6 h-6" />
                    <span className="text-sm font-medium">{typeof photo.likes === 'number' ? photo.likes : 0}</span>
                  </button>
                </div>
                <button 
                  onClick={handleCommentsClick}
                  className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">0</span>
                </button>
              </div>
            </div>

            {/* Campo de comentário */}
            <div className="px-1 py-2 bg-transparent">
              <form className="flex items-center gap-2">
                <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userName}&size=m&direction=4&head_direction=2&headonly=1`} 
                    alt={userName} 
                    className="w-full h-full object-cover" 
                    style={{imageRendering: 'pixelated'}}
                  />
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Adicione um comentário..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm"
                  />
                  {commentText.trim() && (
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="border-t border-white/10 pt-3"></div>
          </div>
        </div>
      </div>
      
      {/* Overlay para fechar popovers */}
      {(showLikesPopover || showCommentsPopover) && (
        <div 
          className="absolute inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowLikesPopover(false);
            setShowCommentsPopover(false);
          }}
        />
      )}
    </div>
  );
};
