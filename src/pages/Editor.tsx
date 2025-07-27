import { PageHeader } from '../components/PageHeader';

const Editor = () => {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Editor de Visuais" 
        backgroundImage="/assets/editorvisuais.png"
        icon="/assets/Palette.png"
      />
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-habbo-text mb-4">Personalize seu Avatar</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-habbo-green mb-3">Aparência</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Cabelo</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div key={i} className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Roupas</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-habbo-green mb-3">Acessórios</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="bg-gradient-to-br from-pink-400 to-red-500 text-white p-3 rounded-lg hover:shadow-md transition-shadow">
                      👓 Óculos
                    </button>
                    <button className="bg-gradient-to-br from-green-400 to-teal-500 text-white p-3 rounded-lg hover:shadow-md transition-shadow">
                      🎩 Chapéus
                    </button>
                    <button className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white p-3 rounded-lg hover:shadow-md transition-shadow">
                      💎 Joias
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Pré-visualização</h3>
                <div className="bg-white rounded-lg p-8 mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                </div>
                <button className="bg-habbo-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Salvar Visual
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;