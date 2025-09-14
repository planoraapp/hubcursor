
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug, Zap, Database, Clock, RefreshCw } from 'lucide-react';
import { usePhotosScraped } from '@/hooks/usePhotosScraped';

interface PhotosDebugPanelProps {
  username?: string;
  hotel?: string;
}

export const PhotosDebugPanel: React.FC<PhotosDebugPanelProps> = ({ 
  username, 
  hotel = 'br' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugForceRefresh, setDebugForceRefresh] = useState(false);
  
  const { scrapedPhotos, isLoading, error, refreshPhotos, photoCount } = usePhotosScraped(
    username, 
    hotel, 
    debugForceRefresh
  );

  const handleDebugRefresh = async () => {
        setDebugForceRefresh(true);
    
    try {
      await refreshPhotos();
          } catch (err) {
          } finally {
      // Reset force refresh after a delay
      setTimeout(() => {
        setDebugForceRefresh(false);
      }, 2000);
    }
  };

  const handleClearConsole = () => {
    console.clear();
      };

  if (!username) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-purple-100/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-purple-600" />
                <span>Debug Panel - {username}</span>
                <Badge variant="outline" className="text-xs">
                  {photoCount} fotos
                </Badge>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span>{isLoading ? 'Carregando...' : 'Pronto'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Database className="w-3 h-3 text-blue-600" />
                <span>Hotel: {hotel.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-orange-600" />
                <span>Cache: {debugForceRefresh ? 'Bypass' : 'Ativo'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                {error ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-600">Erro</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-600">OK</span>
                  </>
                )}
              </div>
            </div>

            {/* Error Details */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-800">Erro Detectado</span>
                </div>
                <p className="text-xs text-red-700 font-mono">{error.message}</p>
              </div>
            )}

            {/* Photo Analysis */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Análise das Fotos</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Total: <span className="font-mono font-bold">{photoCount}</span></div>
                <div>Com Likes: <span className="font-mono font-bold">
                  {scrapedPhotos.filter(p => p.likes > 0).length}
                </span></div>
                <div>Com Sala: <span className="font-mono font-bold">
                  {scrapedPhotos.filter(p => p.roomName).length}
                </span></div>
                <div>Com Data: <span className="font-mono font-bold">
                  {scrapedPhotos.filter(p => p.date).length}
                </span></div>
              </div>
            </div>

            {/* Debug Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDebugRefresh}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Force Refresh</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearConsole}
                className="flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>Clear Console</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                                  }}
                className="flex items-center gap-1"
              >
                <Bug className="w-3 h-3" />
                <span>Log Photos</span>
              </Button>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-1">Como usar:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Abra o Console do navegador (F12)</li>
                <li>• Clique "Force Refresh" para novo scraping</li>
                <li>• Procure por logs com [🔍 PHOTOS DEBUG]</li>
                <li>• Use "Log Photos" para ver dados completos</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
