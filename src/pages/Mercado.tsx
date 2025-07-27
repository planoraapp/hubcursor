import { PageHeader } from '../components/PageHeader';

const Mercado = () => {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Mercado" 
        backgroundImage="/assets/event_bg_visitor.png"
        icon="/assets/Banknote.png"
      />
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-habbo-text mb-4">Marketplace</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-4 mb-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center">
                      <span className="text-2xl">🪑</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Móvel Raro #{i + 1}</h3>
                  <p className="text-sm text-gray-600 mb-3">Item exclusivo da coleção limitada</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-habbo-green">{(i + 1) * 50} Moedas</span>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-habbo-text mb-4">Seus Itens à Venda</h2>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Você ainda não possui itens à venda</p>
              <button className="bg-habbo-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                Anunciar Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mercado;