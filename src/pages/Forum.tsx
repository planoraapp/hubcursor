import { PageHeader } from '../components/PageHeader';

const Forum = () => {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Fórum" 
        backgroundImage="/assets/event_bg_owner.png"
        icon="/assets/MessageCircle.png"
      />
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-habbo-text mb-4">Discussões da Comunidade</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-habbo-green mb-2">💬 Dicas para Novatos</h3>
                <p className="text-gray-600 mb-2">Compartilhe suas melhores dicas para jogadores iniciantes</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>152 respostas</span>
                  <span>Último post: há 2 horas</span>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-habbo-green mb-2">🎮 Eventos e Competições</h3>
                <p className="text-gray-600 mb-2">Organize e participe de eventos criados pela comunidade</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>89 respostas</span>
                  <span>Último post: há 5 horas</span>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-habbo-green mb-2">🛠️ Suporte Técnico</h3>
                <p className="text-gray-600 mb-2">Relatar bugs e solicitar ajuda técnica</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>34 respostas</span>
                  <span>Último post: há 1 dia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;