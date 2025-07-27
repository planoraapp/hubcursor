
import { PanelCard } from './PanelCard';
import { mockData } from '../data/mockData';

export const HomePage = () => {
  return (
    <div className="space-y-8">
      <PanelCard title="Bem-vindo ao Habbo Hub" className="mb-8">
        <p className="text-lg text-gray-600">
          Sua central de ferramentas e informações para o Habbo Hotel. Explore os dados públicos mais recentes e otimize sua experiência no jogo.
        </p>
      </PanelCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PanelCard title="Últimas Notícias">
          <div className="space-y-4">
            {mockData.news.map((item, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-4 py-2">
                <h4 className="font-bold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-500 mb-1">{item.date}</p>
                <p className="text-sm text-gray-600">{item.snippet}</p>
              </div>
            ))}
          </div>
        </PanelCard>
        
        <PanelCard title="Quartos em Destaque">
          <div className="space-y-4">
            {mockData.rooms.slice(0, 3).map((room, index) => (
              <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                <h4 className="font-bold text-gray-800">{room.name}</h4>
                <p className="text-sm text-gray-500">por {room.owner}</p>
                <p className="text-sm text-gray-600">{room.visitors} visitantes</p>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
      
      <PanelCard title="Estatísticas do Hub">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#008800]">1,250</div>
            <div className="text-sm text-gray-600">Quartos Ativos</div>
          </div>
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#dd0000]">340</div>
            <div className="text-sm text-gray-600">Emblemas Únicos</div>
          </div>
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#0066cc]">89</div>
            <div className="text-sm text-gray-600">Mobis Raros</div>
          </div>
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#ff6600]">50k+</div>
            <div className="text-sm text-gray-600">Usuários Ativos</div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
