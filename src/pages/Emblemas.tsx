import { PageHeader } from '../components/PageHeader';

const Emblemas = () => {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Emblemas" 
        backgroundImage="/assets/event_bg_owner.png"
        icon="/assets/Award.png"
      />
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-habbo-text mb-4">Coleção de Emblemas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Emblema {i + 1}</h3>
                  <p className="text-xs text-gray-600">Conquista especial</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-habbo-text mb-4">Como Conseguir Emblemas</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-habbo-green">✓</span>
                <div>
                  <h3 className="font-semibold">Participar de Eventos</h3>
                  <p className="text-sm text-gray-600">Participe de eventos especiais do Habbo</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-habbo-green">✓</span>
                <div>
                  <h3 className="font-semibold">Completar Conquistas</h3>
                  <p className="text-sm text-gray-600">Complete desafios e missões diárias</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-habbo-green">✓</span>
                <div>
                  <h3 className="font-semibold">Ser Ativo na Comunidade</h3>
                  <p className="text-sm text-gray-600">Contribua com a comunidade Habbo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emblemas;