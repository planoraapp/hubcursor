import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Camera, Image, Heart } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface FeedPhotosTabbedColumnProps {
  onUserClick?: (username: string) => void;
}

export const FeedPhotosTabbedColumn: React.FC<FeedPhotosTabbedColumnProps> = ({ onUserClick }) => {
  const { habboAccount } = useUnifiedAuth();

  const handleRefresh = () => {
    console.log('[📸 PHOTOS] Refresh requested');
  };

  return (
    <Card className="bg-black/40 text-white border-white/20 shadow-none h-full flex flex-col backdrop-blur-sm">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white volter-font">Feed de Fotos</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
        <div className="text-center py-8">
          <Camera className="w-8 h-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60 text-sm">Feed de fotos em desenvolvimento</p>
          <p className="text-white/40 text-xs mt-1">
            Em breve você verá as fotos mais recentes dos seus amigos
          </p>
        </div>
      </CardContent>
    </Card>
  );
};