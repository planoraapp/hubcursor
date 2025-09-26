import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useUnifiedHabboClothing } from '@/hooks/useUnifiedHabboClothing';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

const DiagnosticPanel = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { data: clothingData, isLoading, error } = useUnifiedHabboClothing();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Teste 1: Verificar se os dados estão carregando
    if (isLoading) {
      results.push({
        test: 'Carregamento de Dados',
        status: 'info',
        message: 'Ainda carregando dados...'
      });
    } else if (error) {
      results.push({
        test: 'Carregamento de Dados',
        status: 'error',
        message: `Erro ao carregar: ${error.message}`,
        details: error
      });
    } else if (clothingData) {
      results.push({
        test: 'Carregamento de Dados',
        status: 'success',
        message: `Dados carregados com sucesso! ${Object.keys(clothingData).length} categorias encontradas`,
        details: Object.keys(clothingData)
      });
    }

    // Teste 2: Verificar categorias disponíveis
    if (clothingData) {
      const expectedCategories = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'ca', 'cp', 'wa'];
      const availableCategories = Object.keys(clothingData);
      const missingCategories = expectedCategories.filter(cat => !availableCategories.includes(cat));
      
      if (missingCategories.length === 0) {
        results.push({
          test: 'Categorias Completas',
          status: 'success',
          message: 'Todas as categorias esperadas estão disponíveis',
          details: availableCategories
        });
      } else {
        results.push({
          test: 'Categorias Completas',
          status: 'warning',
          message: `Categorias faltando: ${missingCategories.join(', ')}`,
          details: { available: availableCategories, missing: missingCategories }
        });
      }
    }

    // Teste 3: Verificar quantidade de itens por categoria
    if (clothingData) {
      const categoryStats = Object.entries(clothingData).map(([category, items]) => ({
        category,
        count: items.length,
        sources: [...new Set(items.map(item => item.source))],
        sampleIds: items.slice(0, 3).map(item => item.figureId)
      }));

      const lowCountCategories = categoryStats.filter(stat => stat.count < 10);
      
      if (lowCountCategories.length === 0) {
        results.push({
          test: 'Quantidade de Itens',
          status: 'success',
          message: 'Todas as categorias têm quantidade adequada de itens',
          details: categoryStats
        });
      } else {
        results.push({
          test: 'Quantidade de Itens',
          status: 'warning',
          message: `Categorias com poucos itens: ${lowCountCategories.map(c => `${c.category}(${c.count})`).join(', ')}`,
          details: categoryStats
        });
      }
    }

    // Teste 4: Verificar URLs de imagem
    if (clothingData) {
      const testUrls: string[] = [];
      Object.values(clothingData).forEach(items => {
        if (items.length > 0) {
          testUrls.push(items[0].thumbnailUrl);
        }
      });

      const urlTests = await Promise.all(
        testUrls.map(async (url, index) => {
          try {
            const response = await fetch(url, { method: 'HEAD' });
            return {
              url,
              status: response.ok ? 'success' : 'error',
              statusCode: response.status
            };
          } catch (error) {
            return {
              url,
              status: 'error',
              error: error.message
            };
          }
        })
      );

      const failedUrls = urlTests.filter(test => test.status === 'error');
      
      if (failedUrls.length === 0) {
        results.push({
          test: 'URLs de Imagem',
          status: 'success',
          message: 'Todas as URLs de imagem estão funcionando',
          details: urlTests
        });
      } else {
        results.push({
          test: 'URLs de Imagem',
          status: 'error',
          message: `${failedUrls.length} URLs falharam`,
          details: failedUrls
        });
      }
    }

    // Teste 5: Verificar Look String
    const testLookString = 'hd-180-1.hr-1001-45.ch-1001-61.lg-280-82.sh-300-80';
    const testUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${testLookString}&gender=M&direction=2&head_direction=2&size=s`;
    
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        results.push({
          test: 'Look String e Habbo-Imaging',
          status: 'success',
          message: 'Look String e habbo-imaging funcionando corretamente',
          details: { lookString: testLookString, url: testUrl }
        });
      } else {
        results.push({
          test: 'Look String e Habbo-Imaging',
          status: 'error',
          message: `Habbo-imaging retornou status ${response.status}`,
          details: { lookString: testLookString, url: testUrl, status: response.status }
        });
      }
    } catch (error) {
      results.push({
        test: 'Look String e Habbo-Imaging',
        status: 'error',
        message: `Erro ao testar habbo-imaging: ${error.message}`,
        details: { lookString: testLookString, url: testUrl, error }
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Painel de Diagnóstico do Editor
          <Badge variant="outline">Sistema Habbo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Executando Diagnósticos...' : 'Executar Diagnósticos'}
        </Button>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <Alert key={index} className={getStatusColor(diagnostic.status)}>
                <div className="flex items-start gap-2">
                  {getStatusIcon(diagnostic.status)}
                  <div className="flex-1">
                    <AlertDescription className="font-medium">
                      {diagnostic.test}
                    </AlertDescription>
                    <p className="text-sm mt-1">{diagnostic.message}</p>
                    {diagnostic.details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-gray-600">
                          Ver detalhes
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(diagnostic.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
