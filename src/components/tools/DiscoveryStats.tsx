import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Package, 
  Coffee, 
  Zap, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DiscoveryStatsProps {
  totalHanditems: number;
  useItems: number;
  carryItems: number;
  lastUpdate: Date | null;
  buildInfo?: {
    buildId: string;
    flashClientUrl: string;
    discoveredAt: string;
    lastChecked: string;
  };
  isExtracting?: boolean;
  newHanditems?: number;
}

export const DiscoveryStats: React.FC<DiscoveryStatsProps> = ({
  totalHanditems,
  useItems,
  carryItems,
  lastUpdate,
  buildInfo,
  isExtracting = false,
  newHanditems = 0
}) => {
  const useItemPercentage = totalHanditems > 0 ? (useItems / totalHanditems) * 100 : 0;
  const carryItemPercentage = totalHanditems > 0 ? (carryItems / totalHanditems) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Informações da Build */}
      {buildInfo && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Build Atual do Habbo</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {buildInfo.buildId}
                </Badge>
                {newHanditems > 0 && (
                  <Badge variant="secondary">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{newHanditems} novos
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Descoberta em: {new Date(buildInfo.discoveredAt).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Última verificação: {new Date(buildInfo.lastChecked).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas dos Handitems */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Handitems */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Handitems</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHanditems}</div>
          <p className="text-xs text-muted-foreground">
            Descobertos do servidor oficial
          </p>
        </CardContent>
      </Card>

      {/* UseItems (Para Beber) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Para Beber</CardTitle>
          <Coffee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{useItems}</div>
          <div className="mt-2">
            <Progress value={useItemPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {useItemPercentage.toFixed(1)}% do total
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CarryItems (Para Carregar) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Para Carregar</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{carryItems}</div>
          <div className="mt-2">
            <Progress value={carryItemPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {carryItemPercentage.toFixed(1)}% do total
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status da Build */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status da Build</CardTitle>
          {isExtracting ? (
            <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
          ) : (
            <Database className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {isExtracting ? (
              <Badge variant="secondary" className="animate-pulse">
                Extraindo...
              </Badge>
            ) : buildInfo ? (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativa
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Indisponível
              </Badge>
            )}
          </div>
          {buildInfo && (
            <p className="text-xs text-muted-foreground mt-1">
              Build: {buildInfo.buildId}
            </p>
          )}
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {lastUpdate.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
