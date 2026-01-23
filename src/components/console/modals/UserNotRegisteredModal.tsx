import React from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface UserNotRegisteredModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

export const UserNotRegisteredModal: React.FC<UserNotRegisteredModalProps> = ({
  isOpen,
  onClose,
  username
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-black rounded-lg w-full max-w-md overflow-hidden">
        {/* Header amarelo com estilo Habbo */}
        <div className="bg-yellow-400 border-b-2 border-black relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#2B2300]" />
              <h3 className="text-lg font-bold text-[#2B2300]" style={{
                textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
              }}>
                Usuário Não Registrado
              </h3>
            </div>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm" 
              className="hover:bg-black/20 text-[#2B2300]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 bg-gray-900" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px'
        }}>
          <div className="text-center">
            <div className="mb-4">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto" />
            </div>
            <p className="text-white text-lg mb-2">
              ⚠️ O usuário <span className="font-bold">{username || 'selecionado'}</span> ainda não se cadastrou no HabboHub
            </p>
            <p className="text-white/70 text-sm mb-6">
              Que tal convidá-lo? :)
            </p>
            <Button
              onClick={onClose}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2"
            >
              Entendi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
