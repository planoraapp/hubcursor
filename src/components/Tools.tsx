
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
import { PageBanner } from '@/components/ui/PageBanner';
import { AltCodesCompact } from './tools/AltCodesCompact';
import { TamagotchiCompact } from './tools/TamagotchiCompact';
import { Room7x7Modal } from './tools/Room7x7Modal';
import { BadgeModal } from './tools/BadgeModal';

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
      <PageBanner 
        title="Ferramentas"
        subtitle="Ferramentas úteis para a comunidade Habbo"
      />

      {/* Grid de Ferramentas Compactas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AltCodesCompact />
        <TamagotchiCompact />
        <Room7x7Modal />
        <BadgeModal />
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
