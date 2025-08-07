
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EnhancedHomeHeaderProps {
  username: string;
  isOwner: boolean;
  hotel: string;
  onEditModeToggle: () => void;
  onOpenStickers: () => void;
  onOpenBackgrounds: () => void;
  onOpenWidgets: () => void;
  isEditMode: boolean;
}

export const EnhancedHomeHeader: React.FC<EnhancedHomeHeaderProps> = ({
  username,
  isOwner,
  hotel,
  onEditModeToggle,
  onOpenStickers,
  onOpenBackgrounds,
  onOpenWidgets,
  isEditMode
}) => {
  return (
    <div className="relative mb-6">
      {/* Curved Header Background */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 rounded-2xl shadow-lg border-2 border-black overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
          borderRadius: '20px 20px 40px 40px',
        }}
      >
        {/* Decorative pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
          }}
        />
        
        <div className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - User info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white volter-font drop-shadow-lg">
                  {username}'s Habbo Home
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {isOwner && (
                    <Badge className="bg-green-500 text-white volter-font border-none shadow-md">
                      Sua Home
                    </Badge>
                  )}
                  <Badge className="bg-white/20 text-white volter-font border-white/30 backdrop-blur-sm">
                    Hotel {hotel.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right side - Control buttons (only for owners) */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEditModeToggle}
                  className={`px-4 py-2 rounded-lg font-bold volter-font transition-all duration-200 ${
                    isEditMode 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  {isEditMode ? '✅ Finalizar' : '✏️ Editar'}
                </button>
                
                <button
                  onClick={onOpenStickers}
                  disabled={!isEditMode}
                  className="px-4 py-2 rounded-lg font-bold volter-font bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  ✨ Stickers
                </button>
                
                <button
                  onClick={onOpenBackgrounds}
                  disabled={!isEditMode}
                  className="px-4 py-2 rounded-lg font-bold volter-font bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  🎨 Fundos
                </button>
                
                <button
                  onClick={onOpenWidgets}
                  disabled={!isEditMode}
                  className="px-4 py-2 rounded-lg font-bold volter-font bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  📱 Widgets
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom decorative curve */}
        <div className="absolute -bottom-1 left-0 right-0 h-4">
          <svg
            viewBox="0 0 400 20"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 Q200,0 400,20 L400,20 L0,20 Z"
              fill="url(#headerGradient)"
            />
            <defs>
              <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-yellow-500 text-black volter-font animate-pulse shadow-lg">
            🔧 Modo de Edição Ativo
          </Badge>
        </div>
      )}
    </div>
  );
};
