import { PanelCard } from './PanelCard';
import { PageHeader } from './PageHeader';
import { useLanguage } from '../hooks/useLanguage';

export const HomePage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Advertisement Banner */}
      <div className="habbo-ad-placeholder habbo-ad-panel-style mb-8" style={{
        width: '100%', 
        maxWidth: '728px', 
        height: '90px', 
        marginLeft: 'auto', 
        marginRight: 'auto',
        backgroundImage: 'url(/assets/adswhitelarge.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}>
        <div className="ad-header-bar" style={{backgroundColor: 'transparent', borderBottom: 'none', textShadow: 'none'}}>
          Advertisement
        </div>
        <div className="ad-content-wrapper" style={{backgroundColor: 'transparent'}}>
          Espaço para Anúncio de Topo
        </div>
      </div>

      <PageHeader 
        title="Bem-vindo ao Habbo Hub!"
        icon="/assets/habbohub.png"
        backgroundImage="/assets/203__-100.png"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <PanelCard title="Acesso Rápido">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.hash = 'catalogo'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <img src="/assets/Image 2422.png" alt="Catálogo" className="w-12 h-12 mb-2" />
              <span className="font-bold text-gray-800">Catálogo</span>
            </button>
            
            <button 
              onClick={() => window.location.hash = 'emblemas'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-green-100 to-green-200 rounded-lg hover:from-green-200 hover:to-green-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <img src="/assets/264__-HG.png" alt="Emblemas" className="w-12 h-12 mb-2" />
              <span className="font-bold text-gray-800">Emblemas</span>
            </button>
            
            <button 
              onClick={() => window.location.hash = 'forum'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <img src="/assets/BatePapo1.png" alt="Fórum" className="w-12 h-12 mb-2" />
              <span className="font-bold text-gray-800">Fórum</span>
            </button>
            
            <button 
              onClick={() => window.location.hash = 'mercado'}
              className="flex flex-col items-center p-4 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-lg hover:from-yellow-200 hover:to-yellow-300 transition-all border-2 border-gray-400 border-r-gray-600 border-b-gray-600"
            >
              <img src="/assets/Image 1574.png" alt="Mercado" className="w-12 h-12 mb-2" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Badges */}
        <PanelCard title="Últimos Emblemas">
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-gray-300">
              <img src="/assets/595__-3CQ.png" alt="Emblema" className="w-10 h-10 mr-3" />
              <div>
                <h5 className="font-bold text-gray-800">Explorador</h5>
                <p className="text-xs text-gray-600">Visite 50 quartos diferentes</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border border-gray-300">
              <img src="/assets/1136__-4HX.png" alt="Emblema" className="w-10 h-10 mr-3" />
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
                <img src="/assets/gcreate_icon_credit.png" alt="Créditos" className="w-8 h-8 mr-2" />
                <span className="font-bold text-gray-800">Créditos</span>
              </div>
              <span className="font-bold text-gray-800">2,500</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-pink-100 to-pink-200 rounded border border-gray-400">
              <div className="flex items-center">
                <img src="/assets/619__-O-.png" alt="Duckets" className="w-8 h-8 mr-2" />
                <span className="font-bold text-gray-800">Duckets</span>
              </div>
              <span className="font-bold text-gray-800">1,200</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded border border-gray-400">
              <div className="flex items-center">
                <img src="/assets/Diamante.png" alt="Diamantes" className="w-8 h-8 mr-2" />
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
            style={{ 
              backgroundImage: 'url(/assets/1211__-3V6.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
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
    </div>
  );
};