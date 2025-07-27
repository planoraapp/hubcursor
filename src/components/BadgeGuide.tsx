
import { useState, useEffect } from 'react';
import { Search, Award } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { getAchievements, getBadgeUrl, type HabboBadge } from '../services/habboApi';

export const BadgeGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [badges, setBadges] = useState<HabboBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      console.log('Carregando emblemas...');
      
      const achievements = await getAchievements();
      
      if (achievements) {
        setBadges(achievements);
        console.log('Emblemas carregados:', achievements.length);
      } else {
        // Fallback para dados mock se a API falhar
        setBadges([
          { code: 'ACH_BasicClub1', name: 'HC Básico 1 mês', description: 'Membro do Habbo Club por 1 mês' },
          { code: 'ACH_EmailVerification1', name: 'Email Verificado', description: 'Verificou seu endereço de email' },
          { code: 'ACH_Login1', name: 'Primeiro Login', description: 'Fez seu primeiro login no Habbo' },
          { code: 'ACH_RoomEntry1', name: 'Explorador', description: 'Visitou 10 quartos diferentes' },
          { code: 'ACH_FriendListSize1', name: 'Sociável', description: 'Adicionou 5 amigos' },
          { code: 'ACH_GuideRecommendation1', name: 'Recomendação', description: 'Recebeu recomendação como guia' },
          { code: 'ACH_VipClub1', name: 'VIP', description: 'Membro VIP' },
          { code: 'ACH_Motto1', name: 'Personalidade', description: 'Definiu sua primeira missão' },
          { code: 'ACH_AllTimeHotelPresence1', name: 'Veterano', description: 'Tempo total online no hotel' },
          { code: 'ACH_RoomDecorating1', name: 'Decorador', description: 'Decorou seu primeiro quarto' }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar emblemas:', error);
      setError('Erro ao carregar emblemas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'social', label: 'Social' },
    { id: 'games', label: 'Jogos' },
    { id: 'explore', label: 'Exploração' },
    { id: 'identity', label: 'Identidade' },
    { id: 'other', label: 'Outros' }
  ];

  const categorizeBadge = (badge: HabboBadge): string => {
    const code = badge.code.toLowerCase();
    const name = badge.name.toLowerCase();
    const description = badge.description.toLowerCase();
    
    if (code.includes('friend') || name.includes('amigo') || description.includes('amigo')) {
      return 'social';
    }
    if (code.includes('game') || name.includes('jogo') || description.includes('jogo')) {
      return 'games';
    }
    if (code.includes('room') || code.includes('entry') || name.includes('quarto') || description.includes('quarto')) {
      return 'explore';
    }
    if (code.includes('motto') || code.includes('appearance') || name.includes('personalidade') || description.includes('missão')) {
      return 'identity';
    }
    return 'other';
  };

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || categorizeBadge(badge) === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <PanelCard title="Guia de Emblemas">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando emblemas...</p>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PanelCard title="Guia de Emblemas">
          <div className="text-center py-8">
            <Award className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="font-bold text-gray-800 mb-2">Erro ao Carregar Emblemas</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadBadges}
              className="bg-[#008800] text-white px-6 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
            >
              Tentar Novamente
            </button>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PanelCard title="Guia de Emblemas">
        <p className="text-lg text-gray-600 mb-4">
          Explore a vasta coleção de emblemas do Habbo. Descubra como obtê-los!
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome do emblema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 font-bold border-2 border-[#5a5a5a] rounded-t-lg transition-all duration-100 ${
                activeCategory === category.id
                  ? 'bg-white border-b-white text-[#38332c]'
                  : 'bg-[#d1d1d1] text-[#38332c] hover:bg-[#e1e1e1]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Mostrando {filteredBadges.length} de {badges.length} emblemas
          </p>
        </div>
      </PanelCard>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBadges.map((badge, index) => (
          <PanelCard key={index}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center bg-gray-100">
                <img
                  src={getBadgeUrl(badge.code)}
                  alt={badge.name}
                  className="w-12 h-12"
                  onError={(e) => {
                    // Fallback para quando a imagem não carrega
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="text-yellow-600 text-2xl">🏅</div>';
                  }}
                />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{badge.name}</h3>
              <p className="text-xs text-gray-500">{badge.description}</p>
              <div className="flex flex-col space-y-1 text-xs">
                <span className={`px-2 py-1 rounded text-white font-medium ${
                  categorizeBadge(badge) === 'social' ? 'bg-blue-500' :
                  categorizeBadge(badge) === 'games' ? 'bg-purple-500' :
                  categorizeBadge(badge) === 'explore' ? 'bg-green-500' :
                  categorizeBadge(badge) === 'identity' ? 'bg-pink-500' :
                  'bg-gray-500'
                }`}>
                  {categories.find(cat => cat.id === categorizeBadge(badge))?.label || 'Outros'}
                </span>
              </div>
            </div>
          </PanelCard>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <PanelCard>
          <div className="text-center py-8">
            <Award className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-bold text-gray-800 mb-2">Nenhum emblema encontrado</h3>
            <p className="text-gray-600">Tente ajustar sua pesquisa ou filtro.</p>
          </div>
        </PanelCard>
      )}
    </div>
  );
};
