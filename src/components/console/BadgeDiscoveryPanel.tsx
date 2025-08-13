
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Users, Award, Activity, Zap } from 'lucide-react';
import { useBadgeDiscovery } from '@/hooks/useBadgeDiscovery';

export const BadgeDiscoveryPanel: React.FC = () => {
  const [selectedBadge, setSelectedBadge] = useState('ACH_Tutorial1');
  const [discoveryLimit, setDiscoveryLimit] = useState(100);
  
  const { 
    startDiscovery, 
    isDiscovering, 
    discoveryResult, 
    discoveryStats, 
    statsLoading 
  } = useBadgeDiscovery();

  const commonBadges = [
    { code: 'ACH_Tutorial1', name: 'Dando um Rolê!', description: 'Usuários que andaram pelo hotel' },
    { code: 'ACH_Login1', name: 'Primeiro Login', description: 'Usuários que fizeram login' },
    { code: 'ACH_Avatar1', name: 'Visual Personalizado', description: 'Usuários que personalizaram avatar' },
    { code: 'ACH_BasicClub1', name: 'Clube Básico', description: 'Membros HC básicos' },
  ];

  const handleStartDiscovery = () => {
    startDiscovery({
      hotel: 'com.br',
      badgeCode: selectedBadge,
      limit: discoveryLimit
    });
  };

  return (
    <Card className="bg-[#2C3E50] text-white border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-400" />
          Descoberta Massiva de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {statsLoading ? '...' : discoveryStats?.totalTrackedUsers || 0}
            </div>
            <div className="text-xs text-white/60">Usuários Rastreados</div>
          </div>
          
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {statsLoading ? '...' : discoveryStats?.totalBadges || 0}
            </div>
            <div className="text-xs text-white/60">Emblemas Catalogados</div>
          </div>
          
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {statsLoading ? '...' : discoveryStats?.totalActivities || 0}
            </div>
            <div className="text-xs text-white/60">Atividades Detectadas</div>
          </div>
        </div>

        {/* Badge Selection */}
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Emblema Alvo:</h4>
          <div className="grid grid-cols-1 gap-2">
            {commonBadges.map((badge) => (
              <div
                key={badge.code}
                onClick={() => setSelectedBadge(badge.code)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedBadge === badge.code
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{badge.name}</div>
                    <div className="text-xs text-white/60">{badge.description}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {badge.code}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Limit Selection */}
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Limite de Descoberta:</h4>
          <div className="flex gap-2">
            {[50, 100, 200, 500].map((limit) => (
              <button
                key={limit}
                onClick={() => setDiscoveryLimit(limit)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  discoveryLimit === limit
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>

        {/* Discovery Button */}
        <Button
          onClick={handleStartDiscovery}
          disabled={isDiscovering}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isDiscovering ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Descobrindo usuários...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Iniciar Descoberta Massiva
            </>
          )}
        </Button>

        {/* Results */}
        {discoveryResult && (
          <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">Resultado da Descoberta</h4>
            <div className="space-y-1 text-sm text-white/80">
              <div>✅ {discoveryResult.result.usersFound} usuários encontrados</div>
              <div>🏆 {discoveryResult.result.badgesFound} emblemas catalogados</div>
              <div>⏱️ Processado em {discoveryResult.result.processingTime}ms</div>
              {discoveryResult.result.errors.length > 0 && (
                <div className="text-yellow-400">
                  ⚠️ {discoveryResult.result.errors.length} avisos registrados
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strategy Info */}
        <div className="p-3 bg-white/5 rounded-lg">
          <h4 className="text-xs font-medium text-white/80 mb-2">ESTRATÉGIA DE DESCOBERTA:</h4>
          <div className="text-xs text-white/60 space-y-1">
            <div>• Análise do ticker oficial do hotel</div>
            <div>• Verificação de grupos ativos</div>
            <div>• Mapeamento de amigos dos usuários rastreados</div>
            <div>• Validação automática de emblemas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
