
import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { AdminRoute } from '../components/AdminRoute';
import { Users, BarChart3, Settings, Shield, Activity } from 'lucide-react';

const AdminHub = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'logs', label: 'Logs', icon: Activity },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'security', label: 'Segurança', icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 volter-font">Usuários Online</h3>
                <p className="text-3xl font-bold text-green-600 volter-font">0</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 volter-font">Total de Usuários</h3>
                <p className="text-3xl font-bold text-blue-600 volter-font">1</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 volter-font">Logins Hoje</h3>
                <p className="text-3xl font-bold text-purple-600 volter-font">1</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 volter-font">Sistema</h3>
                <p className="text-lg font-bold text-green-600 volter-font">Online</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Atividade Recente</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="volter-font">Login do administrador</span>
                  <span className="text-sm text-gray-500 volter-font">Agora</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="volter-font">Sistema iniciado</span>
                  <span className="text-sm text-gray-500 volter-font">Hoje</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Usuários Registrados</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 volter-font">Nome</th>
                      <th className="text-left p-3 volter-font">Status</th>
                      <th className="text-left p-3 volter-font">Último Login</th>
                      <th className="text-left p-3 volter-font">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 volter-font">habbohub</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded volter-font">Online</span>
                      </td>
                      <td className="p-3 volter-font">Agora</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded volter-font">Admin</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'logs':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Logs do Sistema</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded border-l-4 border-green-500">
                  <span className="volter-font">Admin login successful - habbohub</span>
                  <span className="text-sm text-gray-500 volter-font">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <span className="volter-font">Sistema iniciado</span>
                  <span className="text-sm text-gray-500 volter-font">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Configurações do Sistema</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 volter-font">Nome do Admin</label>
                  <input 
                    type="text" 
                    value="habbohub" 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md volter-font"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 volter-font">Modo Manutenção</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md volter-font">
                    <option value="off">Desativado</option>
                    <option value="on">Ativado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Segurança</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 volter-font">Status de Segurança</h4>
                  <p className="text-green-700 volter-font">Sistema seguro - Apenas admin autorizado</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 volter-font">Tentativas de Login</h4>
                  <p className="text-blue-700 volter-font">Nenhuma tentativa não autorizada detectada</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="flex min-h-screen">
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <PageHeader 
              title="Painel Administrativo"
              icon="/assets/ferramentas.png"
              backgroundImage="/assets/1360__-3C7.png"
            />
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 volter-font mb-2">
                  Bem-vindo, {userData?.name}!
                </h2>
                <p className="text-gray-600 volter-font">
                  Painel de controle e administração do Habbo Hub
                </p>
              </div>

              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm volter-font ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminHub;
