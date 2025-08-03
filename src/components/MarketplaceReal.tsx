
import { MarketplaceLayout } from './marketplace/MarketplaceLayout';
import { PanelCard } from './PanelCard';

export const MarketplaceReal = () => {
  return (
    <div className="space-y-6">
      <PanelCard title="Mercado Real do Habbo - Dados Oficiais">
        <div className="text-sm text-gray-600 mb-4">
          <p>📊 Dados em tempo real da feira livre do Habbo</p>
          <p>🔄 Atualização automática a cada 30 segundos</p>
          <p>🏪 Escolha o hotel para ver os itens disponíveis no marketplace</p>
        </div>
        
        <MarketplaceLayout />
      </PanelCard>
    </div>
  );
};
