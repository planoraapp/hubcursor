import { PanelCard } from './PanelCard';
import { PageHeader } from './PageHeader';
import { useLanguage } from '../hooks/useLanguage';

export const Events = () => {
  const { t } = useLanguage();

  const currentEvents = [
    {
      id: 1,
      title: "Festival de Inverno 2024",
      description: "Participe do maior evento da temporada! Ganhe móveis exclusivos, roupas especiais e emblemas únicos.",
      status: "Ativo",
      endDate: "31 de Janeiro",
      image: "/assets/1360__-3C7.png",
      type: "Evento Oficial"
    },
    {
      id: 2,
      title: "Competição de Quartos Temáticos",
      description: "Mostre sua criatividade construindo o melhor quarto com tema 'Fantasia Medieval'.",
      status: "Inscrições Abertas",
      endDate: "15 de Janeiro",
      image: "/assets/1134__-3B0.png",
      type: "Competição"
    },
    {
      id: 3,
      title: "Caça ao Tesouro Semanal",
      description: "Encontre pistas espalhadas pelos quartos públicos e ganhe prêmios incríveis!",
      status: "Em Andamento",
      endDate: "7 de Janeiro",
      image: "/assets/1211__-3V6.png",
      type: "Atividade"
    }
  ];

  const upcomingEvents = [
    {
      id: 4,
      title: "Torneio de Jogos",
      description: "Competição de BattleBall, SnowStorm e outros jogos clássicos do Habbo.",
      startDate: "1 de Fevereiro",
      image: "/assets/595__-3CQ.png",
      type: "Torneio"
    },
    {
      id: 5,
      title: "Noite do Pijama Virtual",
      description: "Evento especial com atividades relaxantes e prêmios exclusivos.",
      startDate: "14 de Fevereiro",
      image: "/assets/1136__-4HX.png",
      type: "Evento Social"
    }
  ];

  const pendingResults = [
    {
      id: 1,
      title: "Concurso de Look Natalino",
      description: "Aguardando resultado da votação popular",
      participants: 156,
      image: "/assets/264__-HG.png"
    },
    {
      id: 2,
      title: "Melhor Quarto de Ano Novo",
      description: "Jurados analisando as submissões",
      participants: 89,
      image: "/assets/203__-100.png"
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Eventos Habbo"
        icon="/assets/eventos.png"
        backgroundImage="/assets/1360__-3C7.png"
      />

      {/* Current Events */}
      <PanelCard title="🔥 Eventos Atuais">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentEvents.map((event) => (
            <div key={event.id} className="bg-gradient-to-b from-white to-gray-50 rounded-lg border-2 border-gray-400 border-r-gray-600 border-b-gray-600 overflow-hidden hover:shadow-lg transition-all">
              <div 
                className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden"
                style={{ 
                  backgroundImage: `url(${event.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                    {event.status}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                    {event.type}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Termina: {event.endDate}</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Participar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <PanelCard title="📅 Próximos Eventos">
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-gray-300">
                <img src={event.image} alt={event.title} className="w-16 h-16 rounded-lg mr-4 border border-gray-400" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-600 font-bold">Inicia: {event.startDate}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Ver calendário completo
          </button>
        </PanelCard>

        {/* Pending Results */}
        <PanelCard title="⏳ Resultados Pendentes">
          <div className="space-y-4">
            {pendingResults.map((result) => (
              <div key={result.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-300">
                <div className="flex items-center mb-3">
                  <img src={result.image} alt={result.title} className="w-12 h-12 rounded mr-3 border border-gray-400" />
                  <div>
                    <h4 className="font-bold text-gray-800">{result.title}</h4>
                    <p className="text-sm text-gray-600">{result.description}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    👥 {result.participants} participantes
                  </span>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-xs text-gray-500">Aguardando resultado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-gray-300">
            <h5 className="font-bold text-gray-800 mb-1">📢 Quer ser notificado?</h5>
            <p className="text-sm text-gray-600 mb-2">
              Receba alertas quando os resultados dos eventos forem divulgados.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
              Ativar notificações
            </button>
          </div>
        </PanelCard>
      </div>

      {/* Event Rules */}
      <PanelCard title="📋 Regras e Informações">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-800 mb-3">Como Participar</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                Clique em "Participar" no evento desejado
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                Leia atentamente as regras específicas
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                Complete as tarefas dentro do prazo
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">4.</span>
                Aguarde a divulgação dos resultados
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-3">Premiação</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <img src="/assets/Diamante.png" alt="Diamantes" className="w-6 h-6 mr-2" />
                <span>Diamantes exclusivos para vencedores</span>
              </div>
              <div className="flex items-center">
                <img src="/assets/264__-HG.png" alt="Emblemas" className="w-6 h-6 mr-2" />
                <span>Emblemas únicos de participação</span>
              </div>
              <div className="flex items-center">
                <img src="/assets/gcreate_icon_credit.png" alt="Créditos" className="w-6 h-6 mr-2" />
                <span>Créditos e móveis raros</span>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};