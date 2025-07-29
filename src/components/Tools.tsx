import { useState } from 'react';
import { Calculator, TrendingUp, Coins, AlertCircle } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { getMarketplaceStatsRoomItem, getMarketplaceStatsWallItem, type MarketplaceStats } from '../services/habboApi';
export const Tools = () => {
  const [mobiName, setMobiName] = useState('');
  const [loading, setLoading] = useState(false);
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleCalculateValue = async () => {
    if (!mobiName.trim()) return;
    setLoading(true);
    setError(null);
    setMarketplaceStats(null);
    try {
      console.log('Buscando valor do mobi:', mobiName);

      // Tenta buscar como room item primeiro
      let stats = await getMarketplaceStatsRoomItem(mobiName.trim());

      // Se não encontrar como room item, tenta como wall item
      if (!stats) {
        stats = await getMarketplaceStatsWallItem(mobiName.trim());
      }
      if (!stats) {
        setError('Mobi não encontrado no marketplace. Verifique o nome e tente novamente.');
      } else {
        setMarketplaceStats(stats);
        console.log('Estatísticas do marketplace:', stats);
      }
    } catch (error) {
      console.error('Erro ao buscar valor do mobi:', error);
      setError('Erro ao buscar informações do marketplace. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR').format(price);
  };
  return <div className="space-y-8">
      <PanelCard title="Ferramentas Habbo">
        <p className="text-lg text-gray-600">
          Utilitários para otimizar sua experiência e estratégia no Habbo.
        </p>
      </PanelCard>

      <PanelCard title="Calculadora de Valor de Mobis">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calculator size={20} />
            <p>Insira o nome de um mobi para ver seu valor de mercado atual.</p>
          </div>
          
          <div className="flex space-x-4">
            <input type="text" placeholder="Nome do Mobi..." value={mobiName} onChange={e => setMobiName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCalculateValue()} className="flex-1 px-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]" />
            <button onClick={handleCalculateValue} disabled={loading || !mobiName.trim()} className="bg-[#008800] text-white px-6 py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Calculando...' : 'Calcular Valor'}
            </button>
          </div>

          {error && <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700">{error}</span>
            </div>}

          {marketplaceStats && <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Coins className="text-[#008800]" size={20} />
                <div>
                  <span className="text-gray-700">Preço Médio: </span>
                  <span className="font-bold text-[#008800]">{formatPrice(marketplaceStats.averagePrice)} Moedas</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-1">Ofertas Disponíveis</h4>
                  <p className="text-lg font-bold text-blue-600">{marketplaceStats.offerCount}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-1">Tipo de Item</h4>
                  <p className="text-lg font-bold text-purple-600">{marketplaceStats.furniTypeName}</p>
                </div>
              </div>

              {marketplaceStats.historicalPrices && marketplaceStats.historicalPrices.length > 0 && <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-3">Histórico de Preços</h4>
                  <div className="space-y-2">
                    {marketplaceStats.historicalPrices.slice(0, 5).map((price, index) => <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{new Date(price.date).toLocaleDateString('pt-BR')}</span>
                        <span className="font-medium text-gray-800">{formatPrice(price.averagePrice)} Moedas</span>
                      </div>)}
                  </div>
                </div>}
            </div>}

          {!marketplaceStats && !error && !loading && <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Coins className="text-[#008800]" size={20} />
              <span className="text-gray-700">Valor Estimado: </span>
              <span className="font-bold text-[#008800]">-- Moedas</span>
            </div>}
        </div>
      </PanelCard>

      <PanelCard title="Rastreador de Tendências">
        <div className="flex items-center space-x-2 text-gray-600">
          <TrendingUp size={20} />
          <p>Monitore as tendências do mercado de mobis em tempo real.</p>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-500">Em desenvolvimento</span>
        </div>
      </PanelCard>

      <PanelCard title="Outras Ferramentas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">Organizador de Quartos</h4>
            <p className="text-sm text-gray-600 mb-3">Planeje a decoração do seu quarto antes de comprar os mobis.</p>
            <span className="text-xs text-gray-500">Em desenvolvimento</span>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">Comparador de Preços</h4>
            <p className="text-sm text-gray-600 mb-3">Compare preços de mobis raros entre diferentes servidores.</p>
            <span className="text-xs text-gray-500">Em desenvolvimento</span>
          </div>
        </div>
      </PanelCard>

      {/* Vertical Advertisement Banner */}
      
    </div>;
};