import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Save, CheckCircle, Star, Gem, Calendar, Trophy } from 'lucide-react';
import { useHabboHome } from '@/hooks/useHabboHome';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
import { HubHomeAssets } from '@/components/HabboHome/HubHomeAssets';
import { MobileLayout } from '@/components/ui/mobile-layout';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { HotelTag } from '@/components/HotelTag';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { useQuickNotification } from '@/hooks/useNotification';

const BeebopHome: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { success } = useQuickNotification();
  const { habboAccount } = useAuth();

  // Usar o hook useHabboHome para buscar dados reais do Beebop
  const {
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    loading,
    isEditMode,
    isOwner,
    isSaving,
    lastSaved,
    currentUser,
    setIsEditMode,
    updateWidgetPosition,
    updateStickerPosition,
    addSticker,
    removeSticker,
    updateBackground,
    addWidget,
    removeWidget,
    onGuestbookSubmit,
    onGuestbookDelete,
    clearAllGuestbookEntries,
    reloadData,
    saveChanges
  } = useHabboHome('Beebop', 'br');

  // Estados para controlar os modais de edição
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [currentAssetType, setCurrentAssetType] = useState<'stickers' | 'widgets' | 'backgrounds'>('stickers');

  // Função para salvar mudanças
  const handleSave = async () => {
    try {
      await saveChanges();
      success('Alterações salvas!', 'Suas mudanças foram salvas com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Função para obter URL do avatar
  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&direction=3&head_direction=3&size=l`;
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Função para calcular anos de membro
  const getMemberYears = (memberSince: string) => {
    const startDate = new Date(memberSince);
    const now = new Date();
    return now.getFullYear() - startDate.getFullYear();
  };

  // Função para adicionar sticker
  const handleStickerAdd = async (stickerId: string, stickerSrc: string, category: string) => {
    await addSticker(stickerId, 0, 0, stickerSrc, category);
  };

  // Função para alterar background
  const handleBackgroundChange = async (type: 'color' | 'cover' | 'repeat', value: string) => {
    await updateBackground(type, value);
  };

  // Calcular anos de membro se habboData existir
  const memberYears = habboData?.member_since ? getMemberYears(habboData.member_since) : 0;

  // Mostrar loading se os dados ainda estão carregando
  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)', backgroundRepeat: 'repeat' }}>
        <Card className="bg-white/90 backdrop-blur-sm p-8">
          <div className="flex items-center space-x-4">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
            <span className="text-lg">Carregando dados do Beebop...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Se não há dados do habbo, mostrar erro
  if (!habboData) {
    return (
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)', backgroundRepeat: 'repeat' }}>
        <Card className="bg-white/90 backdrop-blur-sm p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600">Não foi possível carregar os dados do Beebop.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)', backgroundRepeat: 'repeat' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header com informações do usuário */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={getAvatarUrl(habboData.figure_string || '')}
                  alt={`Avatar de ${habboData.habbo_name}`}
                  className="w-16 h-16 rounded-lg border-2 border-yellow-400"
                />
                <div>
                  <CardTitle className="text-2xl font-bold text-yellow-600">
                    {habboData.habbo_name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <HotelTag hotel="br" />
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Nível {habboData.current_level || 0}
                    </Badge>
                    {habboData.is_online && (
                      <Badge variant="default" className="bg-green-500">
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsEditMode(!isEditMode)}
                  variant={isEditMode ? "default" : "outline"}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isEditMode ? 'Visualizar' : 'Editar'}
                </Button>
                {isEditMode && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800">Informações</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Membro desde {habboData.member_since ? formatDate(habboData.member_since) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {memberYears} anos no Habbo
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {habboData.total_experience || 0} pontos de experiência
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gem className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {habboData.star_gem_count || 0} Star Gems
                    </span>
                  </div>
                </div>
              </div>

              {/* Motto */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800">Motto</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 font-mono">
                    {habboData.motto || 'Nenhum motto definido'}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800">Badges Ativos</h3>
                <div className="flex flex-wrap gap-2">
                  {habboData.selected_badges && habboData.selected_badges.length > 0 ? (
                    habboData.selected_badges.map((badge: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {badge.name || badge.code || `Badge ${index + 1}`}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Nenhum badge ativo</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas da Home */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800">
                Home do {habboData.habbo_name}
              </CardTitle>
              {isEditMode && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setCurrentAssetType('stickers');
                      setShowAssetsModal(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Adicionar Stickers
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentAssetType('widgets');
                      setShowAssetsModal(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Adicionar Widgets
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentAssetType('backgrounds');
                      setShowAssetsModal(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Alterar Fundo
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <HomeCanvas
              widgets={widgets}
              stickers={stickers}
              background={background}
              isEditMode={isEditMode}
              onUpdateWidgetPosition={updateWidgetPosition}
              onUpdateStickerPosition={updateStickerPosition}
              onRemoveWidget={removeWidget}
              onRemoveSticker={removeSticker}
            />
          </CardContent>
        </Card>

        {/* Status de salvamento */}
        {lastSaved && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">
              Salvo em {lastSaved.toLocaleTimeString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Modal de Assets */}
      {showAssetsModal && (
        <HubHomeAssets
          isOpen={showAssetsModal}
          onClose={() => setShowAssetsModal(false)}
          assetType={currentAssetType}
          onAddAsset={currentAssetType === 'stickers' ? handleStickerAdd : 
                     currentAssetType === 'backgrounds' ? handleBackgroundChange : 
                     () => {}}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
        </div>
        {content}
      </MobileLayout>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex items-center justify-between p-4 border-b">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          </div>
          <EnhancedErrorBoundary>
            {content}
          </EnhancedErrorBoundary>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BeebopHome;
