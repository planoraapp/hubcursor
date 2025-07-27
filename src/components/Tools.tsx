
import { useState } from 'react';
import { Calculator, TrendingUp, Coins } from 'lucide-react';
import { PanelCard } from './PanelCard';

export const Tools = () => {
  const [mobiName, setMobiName] = useState('');
  const [calculatedValue, setCalculatedValue] = useState<string>('');

  const handleCalculateValue = () => {
    if (!mobiName.trim()) return;

    // Simulate calculation
    const randomValue = Math.floor(Math.random() * 1000) + 50;
    setCalculatedValue(`${randomValue} Moedas`);
  };

  return (
    <div className="space-y-8">
      <PanelCard title="Ferramentas Habbo">
        <p className="text-lg text-gray-600">
          Utilitários para otimizar sua experiência e estratégia no Habbo.
        </p>
      </PanelCard>

      <PanelCard title="Calculadora de Valor de Mobis">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calculator size={20} />
            <p>Insira um mobi para ver seu valor de mercado estimado (dados simulados).</p>
          </div>
          
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Nome do Mobi..."
              value={mobiName}
              onChange={(e) => setMobiName(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
            />
            <button
              onClick={handleCalculateValue}
              className="bg-[#008800] text-white px-6 py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
            >
              Calcular Valor
            </button>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Coins className="text-[#008800]" size={20} />
            <span className="text-gray-700">Valor Estimado: </span>
            <span className="font-bold text-[#008800]">{calculatedValue || '-- Moedas'}</span>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Rastreador de Tendências">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <TrendingUp size={20} />
            <p>Monitore a popularidade de mobis e emblemas ao longo do tempo.</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-3 text-orange-500" size={40} />
              <h3 className="font-bold text-lg text-gray-800">Recurso Premium</h3>
              <p className="text-gray-600 mt-2">Esta ferramenta estará disponível na versão Premium.</p>
              <button className="mt-4 bg-[#dd0000] text-white px-6 py-2 rounded-lg font-medium border-2 border-[#8b0000] border-r-[#ff3333] border-b-[#ff3333] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#ff3333] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
                Saber Mais
              </button>
            </div>
          </div>
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
    </div>
  );
};
