
import { useState } from 'react';
import { Search, User, Shield, AlertCircle } from 'lucide-react';
import { PanelCard } from './PanelCard';

export const ProfileChecker = () => {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerUsername = username.toLowerCase();
    
    if (lowerUsername === 'privado') {
      setResult({
        type: 'private',
        message: 'Este usuário configurou seu perfil como privado. De acordo com a política de privacidade do Habbo, nenhuma informação detalhada pode ser exibida.'
      });
    } else if (lowerUsername === 'naoexiste') {
      setResult({
        type: 'notfound',
        message: 'Não foi possível encontrar um usuário com este nome. Verifique a ortografia e tente novamente.'
      });
    } else {
      setResult({
        type: 'success',
        data: {
          name: username,
          motto: 'Construindo o quarto dos meus sonhos, um pixel de cada vez!',
          badges: [
            { name: 'Veterano 1 Ano', icon: '🏅' },
            { name: 'Construtor Mestre', icon: '🏗️' },
            { name: 'Colecionador', icon: '💎' }
          ],
          online: Math.random() > 0.5,
          lastSeen: '2 horas atrás'
        }
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <PanelCard title="Verificador de Perfil">
        <p className="text-lg text-gray-600 mb-4">
          Busque informações públicas sobre usuários do Habbo Hotel.
        </p>
        
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Digite o nome do usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !username.trim()}
            className="bg-[#008800] text-white px-6 py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search size={18} />
            <span>{loading ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-700">
            <Shield size={16} />
            <span className="text-sm font-medium">Privacidade Garantida</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Respeitamos a privacidade dos usuários. Apenas informações públicas são exibidas.
          </p>
        </div>
      </PanelCard>

      {result && (
        <PanelCard>
          {result.type === 'private' && (
            <div className="border-l-4 border-red-400 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <Shield size={20} />
                <h3 className="font-bold">Perfil Privado</h3>
              </div>
              <p className="text-red-600 mt-2">{result.message}</p>
            </div>
          )}

          {result.type === 'notfound' && (
            <div className="border-l-4 border-yellow-400 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-700">
                <AlertCircle size={20} />
                <h3 className="font-bold">Usuário Não Encontrado</h3>
              </div>
              <p className="text-yellow-600 mt-2">{result.message}</p>
            </div>
          )}

          {result.type === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {result.data.name.substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-2xl text-gray-800">{result.data.name}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      result.data.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {result.data.online ? 'Online' : `Offline - ${result.data.lastSeen}`}
                    </span>
                  </div>
                  <p className="text-gray-600 italic mt-1">"{result.data.motto}"</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-3">Emblemas Públicos:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {result.data.badges.map((badge: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </PanelCard>
      )}
    </div>
  );
};
