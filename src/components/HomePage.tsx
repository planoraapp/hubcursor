import { PanelCard } from './PanelCard';
import { PageHeader } from './PageHeader';
import { AdSpace } from './AdSpace';
import { HabboIcon } from './HabboIcon';
import { BadgeIcon } from './BadgeIcon';

export const HomePage = () => {
  return (
    <div className="space-y-6">
      {/* Top Advertisement Banner */}
      <AdSpace type="horizontal" className="mb-8" />

      <PageHeader 
        title="Bem-vindo ao Habbo Hub!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <PanelCard title="Acesso Rápido">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.hash = 'catalogo'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <HabboIcon icon="cart" size="lg" className="mb-2" />
              <span className="font-bold text-gray-800">Catálogo</span>
            </button>
            
            <button 
              onClick={() => window.location.hash = 'emblemas'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-green-100 to-green-200 rounded-lg hover:from-green-200 hover:to-green-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <BadgeIcon badgeCode="GUIDE" size="lg" className="mb-2" />
              <span className="font-bold text-gray-800">Emblemas</span>
            </button>
            
            <button 
              onClick={() => window.location.hash = 'forum'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <HabboIcon icon="chat" size="lg" className="mb-2" />
              <span className="font-bold text-gray-800">Fórum</span>
            </button>
            
            <button 
              onClick={() => window.location.hash = 'mercado'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-lg hover:from-yellow-200 hover:to-yellow-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <img src="/assets/1876__-6Ie.png" alt="Mercado" className="w-12 h-12 mb-2" />
              <span className="font-bold text-gray-800">Mercado</span>
            </button>
          </div>
        </PanelCard>

        {/* Latest News Preview */}
        <PanelCard title="Últimas Notícias">
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-300">
              <h4 className="font-bold text-gray-800 mb-1">🎉 Novo evento disponível!</h4>
              <p className="text-sm text-gray-600">Participe do evento especial de inverno e ganhe móveis exclusivos.</p>
              <span className="text-xs text-gray-500">Há 2 horas</span>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-300">
              <h4 className="font-bold text-gray-800 mb-1">📦 Novos raros no catálogo</h4>
              <p className="text-sm text-gray-600">Confira os novos móveis raros disponíveis por tempo limitado.</p>
              <span className="text-xs text-gray-500">Há 5 horas</span>
            </div>
            
            <button 
              onClick={() => window.location.hash = 'noticias'}
              className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver todas as notícias
            </button>
          </div>
        </PanelCard>
      </div>

      {/* Ad Spaces Below Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        <AdSpace type="horizontal" className="flex-1" />
        <AdSpace type="square" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Badges */}
        <PanelCard title="Últimos Emblemas">
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-gray-300">
              <BadgeIcon badgeCode="BUILDER" size="md" className="mr-3" />
              <div>
                <h5 className="font-bold text-gray-800">Explorador</h5>
                <p className="text-xs text-gray-600">Visite 50 quartos diferentes</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border border-gray-300">
              <BadgeIcon badgeCode="COLLECTOR" size="md" className="mr-3" />
              <div>
                <h5 className="font-bold text-gray-800">Colecionador</h5>
                <p className="text-xs text-gray-600">Possua 100 móveis únicos</p>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.hash = 'emblemas'}
              className="w-full px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
            >
              Ver todos
            </button>
          </div>
        </PanelCard>

        {/* Currency Display */}
        <PanelCard title="Moedas & Recursos">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded border border-gray-400">
              <div className="flex items-center">
                <HabboIcon icon="credits" size="md" className="mr-2" />
                <span className="font-bold text-gray-800">Créditos</span>
              </div>
              <span className="font-bold text-gray-800">2,500</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-pink-100 to-pink-200 rounded border border-gray-400">
              <div className="flex items-center">
                <img src="/assets/898_HabboToolbarCom_icon_pixel_0_png.png" alt="Duckets" className="w-8 h-8 mr-2" />
                <span className="font-bold text-gray-800">Duckets</span>
              </div>
              <span className="font-bold text-gray-800">1,200</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded border border-gray-400">
              <div className="flex items-center">
                <HabboIcon icon="diamonds" size="md" className="mr-2" />
                <span className="font-bold text-gray-800">Diamantes</span>
              </div>
              <span className="font-bold text-gray-800">45</span>
            </div>

          </div>
        </PanelCard>

        {/* Forum Banner */}
        <PanelCard title="Comunidade">
          <div 
            className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-4 text-white overflow-hidden cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all"
            onClick={() => window.location.hash = 'forum'}
          >
            <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
            <div className="relative z-10">
              <h4 className="font-bold mb-2">💬 Acesse o Fórum</h4>
              <p className="text-sm opacity-90 mb-3">
                Conecte-se com outros Habbos, tire dúvidas e participe das discussões!
              </p>
              <div className="text-xs opacity-80">
                <span>👥 1,234 membros online</span>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Bottom Wide Ad */}
      <AdSpace type="wide" className="mt-8" />
    </div>
  );
};