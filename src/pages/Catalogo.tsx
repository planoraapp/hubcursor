import { PageHeader } from '../components/PageHeader';

const Catalogo = () => {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Catálogo" 
        backgroundImage="/assets/event_bg_visitor.png"
        icon="/assets/Package.png"
      />
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-habbo-text mb-4">Loja do Habbo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">💎 Mobílias Raras</h3>
                <p className="mb-4">Itens exclusivos e limitados</p>
                <button className="bg-white text-purple-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
                  Ver Móveis
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">🎨 Decoração</h3>
                <p className="mb-4">Decore seu quarto com estilo</p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
                  Explorar
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">🎁 Pacotes</h3>
                <p className="mb-4">Ofertas especiais e bundles</p>
                <button className="bg-white text-green-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
                  Ver Ofertas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogo;