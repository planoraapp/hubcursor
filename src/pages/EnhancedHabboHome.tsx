
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';

interface UserHomeData {
  user_id: string;
  background_type: string;
  background_value: string;
  layouts: Array<{
    widget_id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    is_visible: boolean;
    z_index: number;
  }>;
  stickers: Array<{
    id: string;
    sticker_id: string;
    sticker_src: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    z_index: number;
  }>;
}

const EnhancedHabboHome: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { habboAccount } = useUnifiedAuth();
  
  const [homeData, setHomeData] = useState<UserHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userExists, setUserExists] = useState(false);

  const isOwnHome = habboAccount?.habbo_name?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    if (username) {
      loadUserHome();
    }
  }, [username]);

  const loadUserHome = async () => {
    if (!username) return;

    try {
      setLoading(true);
      
      // Primeiro, verificar se o usuário existe
      const { data: userData, error: userError } = await supabase
        .rpc('get_habbo_account_public_by_name', { habbo_name_param: username });

      if (userError || !userData || userData.length === 0) {
        setUserExists(false);
        setLoading(false);
        return;
      }

      setUserExists(true);
      const userUuid = userData[0].supabase_user_id;

      // Carregar dados da home
      const [backgroundData, layoutData, stickerData] = await Promise.all([
        supabase
          .from('user_home_backgrounds')
          .select('*')
          .eq('user_id', userUuid)
          .single(),
        supabase
          .from('user_home_layouts')
          .select('*')
          .eq('user_id', userUuid)
          .order('z_index'),
        supabase
          .from('user_stickers')
          .select('*')
          .eq('user_id', userUuid)
          .order('z_index')
      ]);

      const homeData: UserHomeData = {
        user_id: userUuid,
        background_type: backgroundData.data?.background_type || 'color',
        background_value: backgroundData.data?.background_value || '#c7d2dc',
        layouts: layoutData.data || [],
        stickers: stickerData.data || []
      };

      setHomeData(homeData);
    } catch (error) {
      console.error('Erro ao carregar home:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a home do usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!isOwnHome) {
      toast({
        title: "Acesso Negado",
        description: "Você só pode editar sua própria home",
        variant: "destructive"
      });
      return;
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div 
          className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <NewAppSidebar />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white volter-font">Carregando home...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!userExists) {
    return (
      <SidebarProvider>
        <div 
          className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <NewAppSidebar />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <Button 
                onClick={() => navigate('/homes')} 
                variant="outline" 
                className="mb-6 border-2 border-black bg-white/90 backdrop-blur-sm volter-font"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar às Homes
              </Button>

              <Card className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
                    Usuário não encontrado
                  </h2>
                  <p className="text-gray-600 volter-font">
                    O usuário "{username}" não foi encontrado ou não possui uma home configurada.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                onClick={() => navigate('/homes')} 
                variant="outline" 
                className="border-2 border-black bg-white/90 backdrop-blur-sm volter-font"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar às Homes
              </Button>

              {isOwnHome && (
                <Button
                  onClick={handleEditToggle}
                  className={`volter-font ${
                    isEditing 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Sair da Edição
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Home
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Home Content */}
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg min-h-[600px]">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 volter-font">
                    🏠 Home de {username}
                  </h1>
                  {isOwnHome && (
                    <p className="text-gray-600 volter-font mt-2">
                      {isEditing ? 'Modo de edição ativo' : 'Esta é sua home'}
                    </p>
                  )}
                </div>

                {/* Home Canvas */}
                <div 
                  className="relative w-full min-h-[500px] rounded-lg border-2 border-gray-300"
                  style={{ 
                    backgroundColor: homeData?.background_type === 'color' 
                      ? homeData.background_value 
                      : '#c7d2dc',
                    backgroundImage: homeData?.background_type === 'image' 
                      ? `url(${homeData.background_value})` 
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Widgets */}
                  {homeData?.layouts.map((widget) => (
                    widget.is_visible && (
                      <div
                        key={widget.widget_id}
                        className="absolute bg-white/90 backdrop-blur-sm rounded-lg border-2 border-gray-300 p-4"
                        style={{
                          left: `${widget.x}px`,
                          top: `${widget.y}px`,
                          width: `${widget.width}px`,
                          height: `${widget.height}px`,
                          zIndex: widget.z_index
                        }}
                      >
                        <div className="text-center volter-font">
                          <h3 className="font-bold text-gray-800 mb-2">
                            {widget.widget_id === 'avatar' && '👤 Avatar'}
                            {widget.widget_id === 'guestbook' && '📝 Livro de Visitas'}
                            {widget.widget_id === 'rating' && '⭐ Avaliações'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Widget {widget.widget_id}
                          </p>
                        </div>
                      </div>
                    )
                  ))}

                  {/* Stickers */}
                  {homeData?.stickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="absolute select-none"
                      style={{
                        left: `${sticker.x}px`,
                        top: `${sticker.y}px`,
                        transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                        zIndex: sticker.z_index
                      }}
                    >
                      <img
                        src={sticker.sticker_src}
                        alt="Sticker"
                        className="max-w-none pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  ))}

                  {/* Mensagem quando não há conteúdo */}
                  {(!homeData?.layouts.length && !homeData?.stickers.length) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white/80">
                        <div className="text-6xl mb-4">🏠</div>
                        <p className="volter-font text-lg">
                          {isOwnHome ? 'Sua home está vazia. Clique em "Editar Home" para começar!' : 'Esta home ainda não foi decorada'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Mode Tools */}
                {isEditing && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h3 className="font-bold text-blue-800 volter-font mb-2">
                      🛠️ Ferramentas de Edição
                    </h3>
                    <p className="text-blue-600 volter-font text-sm mb-4">
                      Funcionalidades de edição em desenvolvimento. Em breve você poderá arrastar widgets, adicionar stickers e personalizar o fundo.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="volter-font">
                        Adicionar Widget
                      </Button>
                      <Button size="sm" variant="outline" className="volter-font">
                        Adicionar Sticker
                      </Button>
                      <Button size="sm" variant="outline" className="volter-font">
                        Mudar Fundo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EnhancedHabboHome;
