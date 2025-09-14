import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, RotateCcw, Trash2, Eye, Settings, Download, Share2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedAvatarRendering } from '@/hooks/useAdvancedCache';
import { useLookStringManager } from '@/utils/lookStringManager';

interface OptimizedAvatarRendererProps {
  initialLookString?: string;
  selectedGender?: 'M' | 'F' | 'U';
  selectedHotel?: string;
  onLookStringChange?: (lookString: string) => void;
}

const OptimizedAvatarRenderer: React.FC<OptimizedAvatarRendererProps> = ({
  initialLookString = '',
  selectedGender = 'M',
  selectedHotel = 'com',
  onLookStringChange
}) => {
  const [currentGender, setCurrentGender] = useState<'M' | 'F' | 'U'>(selectedGender);
  const [currentHotel, setCurrentHotel] = useState(selectedHotel);
  const [avatarOptions, setAvatarOptions] = useState({
    size: 'l' as 's' | 'l',
    direction: 2,
    headDirection: 2,
    action: 'std',
    gesture: 'std'
  });
  const [showDebug, setShowDebug] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const { renderAvatar, isLoading, error } = useOptimizedAvatarRendering();
  const { 
    lookString, 
    addPart, 
    removePart, 
    loadFromString, 
    clear, 
    getPart, 
    hasPart, 
    getAllParts,
    getStats 
  } = useLookStringManager();

  // Carregar look string inicial
  useEffect(() => {
    if (initialLookString) {
      loadFromString(initialLookString);
    }
  }, [initialLookString, loadFromString]);

  // Notificar mudanças na look string
  useEffect(() => {
    onLookStringChange?.(lookString);
  }, [lookString, onLookStringChange]);

  // Gerar URL do avatar otimizada
  const generateAvatarUrl = useCallback(async () => {
    if (!lookString) return;

    setIsGenerating(true);
    try {
      const url = await renderAvatar(lookString, {
        hotel: currentHotel,
        gender: currentGender,
        ...avatarOptions
      });
      setAvatarUrl(url);
    } catch (err) {
            toast({
        title: "❌ Erro ao gerar avatar",
        description: "Não foi possível gerar a imagem do avatar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [lookString, currentHotel, currentGender, avatarOptions, renderAvatar, toast]);

  // Gerar avatar quando parâmetros mudarem
  useEffect(() => {
    if (lookString) {
      generateAvatarUrl();
    }
  }, [lookString, currentHotel, currentGender, avatarOptions, generateAvatarUrl]);

  const handleCopyLookString = useCallback(() => {
    navigator.clipboard.writeText(lookString);
    toast({
      title: "📋 Look String copiada!",
      description: `Look string copiada para a área de transferência.`,
    });
  }, [lookString, toast]);

  const handleCopyAvatarUrl = useCallback(() => {
    if (avatarUrl) {
      navigator.clipboard.writeText(avatarUrl);
      toast({
        title: "🔗 URL copiada!",
        description: `URL da imagem copiada para a área de transferência.`,
      });
    }
  }, [avatarUrl, toast]);

  const handleDownloadAvatar = useCallback(async () => {
    if (!avatarUrl) return;

    try {
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habbo-avatar-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "�� Avatar baixado!",
        description: "Imagem do avatar baixada com sucesso.",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao baixar",
        description: "Não foi possível baixar a imagem do avatar.",
        variant: "destructive"
      });
    }
  }, [avatarUrl, toast]);

  const handleShareAvatar = useCallback(() => {
    if (navigator.share && lookString) {
      navigator.share({
        title: 'Meu Avatar Habbo',
        text: `Confira meu avatar Habbo criado no HabboHub!`,
        url: `${window.location.origin}/editor?look=${encodeURIComponent(lookString)}`
      });
    } else {
      handleCopyLookString();
    }
  }, [lookString, handleCopyLookString]);

  const stats = getStats();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Avatar Preview Otimizado
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAvatarUrl}
              disabled={isGenerating || isLoading}
              className="text-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controles de Hotel e Gênero */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Hotel</label>
            <Select value={currentHotel} onValueChange={setCurrentHotel}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="com">🇺🇸 Habbo.com</SelectItem>
                <SelectItem value="com.br">🇧🇷 Habbo.com.br</SelectItem>
                <SelectItem value="fr">🇫🇷 Habbo.fr</SelectItem>
                <SelectItem value="es">🇪🇸 Habbo.es</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Gênero</label>
            <Select value={currentGender} onValueChange={setCurrentGender}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">👨 Masculino</SelectItem>
                <SelectItem value="F">👩 Feminino</SelectItem>
                <SelectItem value="U">👤 Unissex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview do Avatar */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
          {isGenerating || isLoading ? (
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Gerando avatar...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p className="text-sm font-medium">Erro ao carregar avatar</p>
              <p className="text-xs text-gray-600 mt-1">{error}</p>
            </div>
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              className="max-w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
              onError={() => {
                                toast({
                  title: "❌ Erro na imagem",
                  description: "Não foi possível carregar a imagem do avatar.",
                  variant: "destructive"
                });
              }}
            />
          ) : (
            <div className="text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum avatar para exibir</p>
            </div>
          )}
        </div>

        {/* Controles de Pose e Animação */}
        {showDebug && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tamanho</label>
              <Select 
                value={avatarOptions.size} 
                onValueChange={(value: 's' | 'l') => setAvatarOptions(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">Pequeno</SelectItem>
                  <SelectItem value="l">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Direção</label>
              <Select 
                value={avatarOptions.direction.toString()} 
                onValueChange={(value) => setAvatarOptions(prev => ({ ...prev, direction: parseInt(value) }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0°</SelectItem>
                  <SelectItem value="2">90°</SelectItem>
                  <SelectItem value="4">180°</SelectItem>
                  <SelectItem value="6">270°</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Ação</label>
              <Select 
                value={avatarOptions.action} 
                onValueChange={(value) => setAvatarOptions(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="std">Parado</SelectItem>
                  <SelectItem value="wav">Acenando</SelectItem>
                  <SelectItem value="wlk">Caminhando</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Gesto</label>
              <Select 
                value={avatarOptions.gesture} 
                onValueChange={(value) => setAvatarOptions(prev => ({ ...prev, gesture: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="std">Normal</SelectItem>
                  <SelectItem value="sml">Sorriso</SelectItem>
                  <SelectItem value="sad">Triste</SelectItem>
                  <SelectItem value="agr">Bravo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Look String Display */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Look String</label>
            <Badge variant="outline" className="text-xs">
              {stats.totalParts} partes
            </Badge>
          </div>
          <div className="font-mono text-xs bg-white p-2 rounded border break-all">
            {lookString || 'Nenhuma look string definida'}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLookString}
            disabled={!lookString}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copiar Look
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAvatarUrl}
            disabled={!avatarUrl}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copiar URL
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAvatar}
            disabled={!avatarUrl}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Baixar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareAvatar}
            disabled={!lookString}
            className="text-xs"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Compartilhar
          </Button>
        </div>

        {/* Debug Info */}
        {showDebug && (
          <div className="bg-gray-100 rounded-lg p-3 text-xs">
            <h4 className="font-medium mb-2">Debug Info</h4>
            <div className="space-y-1">
              <p><strong>Look String:</strong> {lookString}</p>
              <p><strong>Total Parts:</strong> {stats.totalParts}</p>
              <p><strong>Categories:</strong> {stats.categories.join(', ')}</p>
              <p><strong>Hotel:</strong> {currentHotel}</p>
              <p><strong>Gender:</strong> {currentGender}</p>
              <p><strong>Options:</strong> {JSON.stringify(avatarOptions)}</p>
              {avatarUrl && <p><strong>Avatar URL:</strong> {avatarUrl}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizedAvatarRenderer;
