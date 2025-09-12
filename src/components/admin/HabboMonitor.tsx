import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Zap,
  TrendingUp,
  Globe,
  Server
} from 'lucide-react';
import { habboApiService, HabboBuildInfo, HabboDiscoveryReport } from '@/services/habboApiService';
import { useToast } from '@/hooks/use-toast';

interface HabboMonitorProps {
  className?: string;
}

export const HabboMonitor: React.FC<HabboMonitorProps> = ({ className }) => {
  const [buildInfo, setBuildInfo] = useState<HabboBuildInfo | null>(null);
  const [lastReport, setLastReport] = useState<HabboDiscoveryReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar build atual
  const checkCurrentBuild = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('🔍 Verificando build atual do Habbo...');
      const build = await habboApiService.getCurrentBuild();
      setBuildInfo(build);
      setLastCheck(new Date());
      
      toast({
        title: "Build verificada com sucesso!",
        description: `Build atual: ${build.buildId}`,
      });
      
      console.log('✅ Build verificada:', build);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao verificar build:', error);
      
      toast({
        title: "Erro ao verificar build",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Executar descoberta completa
  const runFullDiscovery = async () => {
    setIsMonitoring(true);
    setError(null);
    
    try {
      console.log('🚀 Executando descoberta completa...');
      const report = await habboApiService.discoverHanditemsWithImages();
      setLastReport(report);
      setLastCheck(new Date());
      
      toast({
        title: "Descoberta completa finalizada!",
        description: `Encontrados ${report.totalHanditems} handitems e ${report.totalFurni} mobílias`,
      });
      
      console.log('✅ Descoberta completa:', report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro na descoberta:', error);
      
      toast({
        title: "Erro na descoberta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  // Verificação inicial
  useEffect(() => {
    checkCurrentBuild();
  }, []);

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (isMonitoring || isChecking) return 'secondary';
    if (buildInfo) return 'default';
    return 'outline';
  };

  const getStatusText = () => {
    if (error) return 'Erro';
    if (isMonitoring) return 'Monitorando...';
    if (isChecking) return 'Verificando...';
    if (buildInfo) return 'Ativo';
    return 'Inativo';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor do Habbo Hotel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={getStatusColor()}>
                {getStatusText()}
              </Badge>
              {lastCheck && (
                <span className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Última verificação: {lastCheck.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkCurrentBuild}
                disabled={isChecking || isMonitoring}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Verificar Build
              </Button>
              <Button 
                size="sm" 
                onClick={runFullDiscovery}
                disabled={isChecking || isMonitoring}
              >
                <Zap className="h-4 w-4 mr-2" />
                Descoberta Completa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Build */}
      {buildInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Build Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Identificação</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{buildInfo.buildId}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Descoberta em: {new Date(buildInfo.discoveredAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Última verificação: {new Date(buildInfo.lastChecked).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">URLs</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {buildInfo.flashClientUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {buildInfo.avatarActionsUrl}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Descoberta */}
      {lastReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Último Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lastReport.totalHanditems}
                </div>
                <p className="text-sm text-muted-foreground">Handitems</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {lastReport.totalFurni}
                </div>
                <p className="text-sm text-muted-foreground">Mobílias</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {lastReport.newHanditems}
                </div>
                <p className="text-sm text-muted-foreground">Novos</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Status da Descoberta</span>
                <Badge variant={lastReport.status === 'success' ? 'default' : 'destructive'}>
                  {lastReport.status === 'success' ? 'Sucesso' : 'Erro'}
                </Badge>
              </div>
              
              {lastReport.errors && lastReport.errors.length > 0 && (
                <div className="mt-2 p-3 bg-destructive/10 rounded-lg">
                  <h5 className="text-sm font-medium text-destructive mb-2">Erros:</h5>
                  <ul className="text-xs text-destructive space-y-1">
                    {lastReport.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                Atualizado em: {new Date(lastReport.lastUpdate).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={checkCurrentBuild}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
