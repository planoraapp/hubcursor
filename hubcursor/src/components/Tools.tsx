
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelCard } from './PanelCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Calendar, Trophy, Settings, Monitor, AlertTriangle } from 'lucide-react';
import { getUserByName } from '../services/habboApi';

export const Tools = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setLoading(true);
    try {
      const result = await getUserByName(searchInput.trim());
      setSearchResult(result);
    } catch (error) {
      console.error('Error searching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    {
      id: 'console',
      title: 'HabboHub Console',
      description: 'Centro de informações completo do Habbo',
      icon: Monitor,
      path: '/console',
      status: 'development',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'profile-checker',
      title: 'Verificador de Perfil',
      description: 'Verifique informações detalhadas de qualquer usuário Habbo',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'event-tracker',
      title: 'Rastreador de Eventos',
      description: 'Acompanhe eventos e atividades do hotel',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'ranking-viewer',
      title: 'Visualizador de Rankings',
      description: 'Veja os rankings mais atualizados do Habbo',
      icon: Trophy,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'room-analyzer',
      title: 'Analisador de Quartos',
      description: 'Analise estatísticas e informações de quartos',
      icon: Settings,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  const handleToolClick = (tool: any) => {
    if (tool.path) {
      navigate(tool.path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Ferramentas do Habbo</h1>
        <p className="text-muted-foreground">Conjunto de ferramentas úteis para usuários do Habbo</p>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${tool.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {tool.title}
                      {tool.status === 'development' && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                          <AlertTriangle size={12} className="mr-1" />
                          Em Desenvolvimento
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleToolClick(tool)}
                  variant={tool.status === 'development' ? 'outline' : 'default'}
                >
                  {tool.path ? 'Acessar' : 'Em Breve'}
                </Button>
                {tool.status === 'development' && (
                  <p className="text-xs text-orange-600 mt-2 text-center">
                    Esta ferramenta está em desenvolvimento ativo
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seção de Busca Rápida */}
      <PanelCard title="Busca Rápida de Usuário">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Digite o nome do usuário Habbo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : <><Search className="w-4 h-4 mr-2" />Buscar</>}
            </Button>
          </div>
          
          {searchResult && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${searchResult.figureString}&direction=2&head_direction=2&gesture=sml&size=s`}
                    alt={searchResult.name}
                    className="w-16 h-16 rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{searchResult.name}</h3>
                    <p className="text-muted-foreground">{searchResult.motto}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <Badge variant={searchResult.online ? 'default' : 'secondary'}>
                        {searchResult.online ? 'Online' : 'Offline'}
                      </Badge>
                      <span>Membro desde: {new Date(searchResult.memberSince).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PanelCard>
    </div>
  );
};
