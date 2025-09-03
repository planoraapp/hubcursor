
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Clock } from 'lucide-react';

interface HistoryEntry {
  id: string;
  figureString: string;
  timestamp: Date;
  thumbnailUrl: string;
}

interface AvatarHistoryProps {
  currentFigureString: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onRestoreFigure: (figureString: string) => void;
  className?: string;
}

export const AvatarHistory = ({
  currentFigureString,
  selectedGender,
  selectedHotel,
  onRestoreFigure,
  className = ''
}: AvatarHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const generateThumbnailUrl = (figureString: string) => {
    const baseUrl = selectedHotel.includes('.') 
      ? `https://www.habbo.${selectedHotel}`
      : `https://www.habbo.com`;
    
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&size=s&direction=2&head_direction=3&action=std&gesture=std`;
  };

  // Adicionar nova entrada ao histórico quando a figure muda
  useEffect(() => {
    if (currentFigureString && currentFigureString.length > 0) {
      const newEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        figureString: currentFigureString,
        timestamp: new Date(),
        thumbnailUrl: generateThumbnailUrl(currentFigureString)
      };

      setHistory(prev => {
        // Evitar duplicatas (mesma figure string)
        if (prev.length > 0 && prev[0].figureString === currentFigureString) {
          return prev;
        }

        // Manter apenas os últimos 4 itens (FIFO)
        const updated = [newEntry, ...prev].slice(0, 4);
        return updated;
      });
    }
  }, [currentFigureString, selectedGender, selectedHotel]);

  const handleRestoreFigure = (figureString: string) => {
    onRestoreFigure(figureString);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (history.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Histórico</span>
        </div>
        <div className="text-xs text-gray-500 text-center py-2">
          Nenhuma alteração ainda
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Histórico</span>
        <span className="text-xs text-gray-500">({history.length}/4)</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {history.map((entry, index) => (
          <Button
            key={entry.id}
            variant="outline"
            size="sm"
            onClick={() => handleRestoreFigure(entry.figureString)}
            className={`h-16 p-1 flex flex-col items-center gap-1 transition-all duration-200 ${
              index === 0 
                ? 'border-blue-300 bg-blue-50' 
                : 'hover:border-gray-400 hover:bg-gray-50'
            }`}
            title={`Restaurar avatar de ${formatTime(entry.timestamp)}`}
          >
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded border overflow-hidden bg-gray-100">
              <img
                src={entry.thumbnailUrl}
                alt="Avatar histórico"
                className="w-full h-full object-cover pixelated"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            </div>

            {/* Time Label */}
            <span className="text-xs text-gray-600">
              {formatTime(entry.timestamp)}
            </span>

            {/* Current Indicator */}
            {index === 0 && (
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </Button>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center mt-2">
        Clique para restaurar uma versão anterior
      </div>
    </div>
  );
};

export default AvatarHistory;
