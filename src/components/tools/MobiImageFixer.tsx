import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { useHabboFurniService } from '@/hooks/useHabboFurniService';
import { HabboFurniItem } from '@/services/HabboFurniService';

interface MobiImageFixerProps {
  onImagesUpdated?: (updatedImages: Map<string, { imageUrl: string; iconUrl: string }>) => void;
}

export const MobiImageFixer: React.FC<MobiImageFixerProps> = ({ onImagesUpdated }) => {
  const { loading, error, apiAccessible, testApiAccess, getMultipleFurniture } = useHabboFurniService();
  const [mobiData, setMobiData] = useState<Map<string, HabboFurniItem>>(new Map());
  const [tested, setTested] = useState(false);

  // Lista de classnames dos mobis que temos no HanditemTool
  const mobiClassnames = [
    'bar_polyfon',
    'ktchn_fridge', 
    'sink',
    'hween_c18_medicineshelf',
    'xmas14_tikibar',
    'hc17_11',
    'mall_r17_coffeem',
    'hblooza_icecream',
    'hblooza_bubblejuice',
    'hblooza_kiosk',
    'hblooza14_drinkstall',
    'hosp_c19_drinksvend',
    'hween11_punch',
    'hblooza_candyfloss',
    'hblooza_popcorn',
    'hblooza_chicken',
    'hblooza_hotdog',
    'hc21_11',
    'hosptl_bed',
    'hosptl_cab1'
  ];

  const handleTestApi = async () => {
    const accessible = await testApiAccess();
    setTested(true);
    
    if (accessible) {
      // Se a API estiver acessível, buscar dados dos mobis
      await handleFetchMobiData();
    }
  };

  const handleFetchMobiData = async () => {
    const results = await getMultipleFurniture(mobiClassnames);
    setMobiData(results);
    
    // Notificar o componente pai sobre as imagens atualizadas
    if (onImagesUpdated && results.size > 0) {
      const updatedImages = new Map<string, { imageUrl: string; iconUrl: string }>();
      
      results.forEach((mobi, classname) => {
        updatedImages.set(classname, {
          imageUrl: mobi.swf.url, // URL da imagem SWF
          iconUrl: mobi.icon.url  // URL do ícone
        });
      });
      
      onImagesUpdated(updatedImages);
    }
  };

  const getStatusIcon = (classname: string) => {
    if (mobiData.has(classname)) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (classname: string) => {
    if (mobiData.has(classname)) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Encontrado</Badge>;
    } else {
      return <Badge variant="destructive">Não encontrado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="volter-font text-2xl text-primary">
            🔧 Corretor de Imagens de Mobis
          </CardTitle>
          <p className="text-muted-foreground volter-font">
            Usando a HabboFurni API para obter URLs corretas das imagens dos mobis
          </p>
        </CardHeader>
      </Card>

      {/* Teste da API */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleTestApi}
                disabled={loading}
                className="volter-font"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Testando...' : 'Testar API e Buscar Imagens'}
              </Button>
              
              {tested && (
                <div className="flex items-center space-x-2">
                  {apiAccessible ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="volter-font text-sm">
                    API {apiAccessible ? 'Acessível' : 'Inacessível'}
                  </span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {tested && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="volter-font text-lg">
              📊 Resultados da Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mobiClassnames.map((classname) => {
                const mobi = mobiData.get(classname);
                
                return (
                  <Card key={classname} className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(classname)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="volter-font font-bold text-sm truncate" title={classname}>
                            {classname}
                          </h4>
                          
                          {mobi && (
                            <p className="text-xs text-muted-foreground truncate" title={mobi.name}>
                              {mobi.name}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-2">
                            {getStatusBadge(classname)}
                            
                            {mobi && (
                              <Badge variant="outline" className="text-xs">
                                {mobi.category}
                              </Badge>
                            )}
                          </div>
                          
                          {mobi && (
                            <div className="mt-2 space-y-1">
                              <div className="text-xs text-muted-foreground">
                                <strong>Imagem:</strong>
                                <div className="truncate" title={mobi.swf.url}>
                                  {mobi.swf.url}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <strong>Ícone:</strong>
                                <div className="truncate" title={mobi.icon.url}>
                                  {mobi.icon.url}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground volter-font">
                {mobiData.size} de {mobiClassnames.length} mobis encontrados
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h3 className="volter-font font-bold text-lg mb-2">📋 Como Funciona</h3>
          <ul className="text-sm text-muted-foreground space-y-1 volter-font">
            <li>• Testa o acesso à HabboFurni API</li>
            <li>• Busca dados dos mobis por classname</li>
            <li>• Obtém URLs corretas das imagens e ícones</li>
            <li>• Atualiza automaticamente o HanditemTool</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
