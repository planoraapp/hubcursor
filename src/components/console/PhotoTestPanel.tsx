import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTestPhotos } from '@/hooks/useTestPhotos';
import { usePhotoDiscovery } from '@/hooks/usePhotoDiscovery';
import { TestTube, Search, Image, CheckCircle, XCircle, Zap, Target } from 'lucide-react';

export const PhotoTestPanel: React.FC = () => {
  const { testPhotos, isLoading: testLoading, results: testResults } = useTestPhotos();
  const { discoverPhotos, isLoading: discoveryLoading, results: discoveryResults } = usePhotoDiscovery();
  const [username, setUsername] = React.useState('Beebop');
  const [hotel, setHotel] = React.useState('com.br');

  const handleBasicTest = async () => {
    try {
      await testPhotos(username, hotel);
    } catch (error) {
      console.error('Basic test failed:', error);
    }
  };

  const handleAdvancedDiscovery = async () => {
    try {
      await discoverPhotos(username, hotel);
    } catch (error) {
      console.error('Advanced discovery failed:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Sistema de Descoberta de Fotos do Habbo
          <Badge variant="secondary">Inspirado no habbo-downloader</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o username do Habbo"
            />
          </div>
          <div>
            <Label htmlFor="hotel">Hotel</Label>
            <select
              id="hotel"
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="com.br">Habbo.com.br</option>
              <option value="com">Habbo.com</option>
              <option value="es">Habbo.es</option>
              <option value="de">Habbo.de</option>
              <option value="fr">Habbo.fr</option>
              <option value="it">Habbo.it</option>
            </select>
          </div>
        </div>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Teste Básico</TabsTrigger>
            <TabsTrigger value="advanced">Descoberta Avançada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TestTube className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Testa endpoints da API oficial e padrões S3 básicos</span>
            </div>
            
            <Button 
              onClick={handleBasicTest} 
              disabled={testLoading || !username.trim()}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {testLoading ? 'Testando...' : 'Executar Teste Básico'}
            </Button>

            {testResults && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resultados do Teste Básico</h3>
                  <Badge variant={testResults.photos.length > 0 ? 'default' : 'secondary'}>
                    {testResults.photos.length} fotos encontradas
                  </Badge>
                </div>

                {/* Basic test results display */}
                <div className="space-y-2">
                  <h4 className="font-medium">Estratégias Testadas:</h4>
                  <div className="grid gap-2">
                    {testResults.strategies.map((strategy: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          {strategy.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">{strategy.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {strategy.status && `Status: ${strategy.status}`}
                          {strategy.error && `Error: ${strategy.error}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {testResults.photos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Fotos Encontradas:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {testResults.photos.map((photo: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <img
                            src={photo.url}
                            alt={`Foto ${index + 1}`}
                            className="w-full aspect-square object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="text-xs space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {photo.source}
                            </Badge>
                            <div className="text-muted-foreground">
                              {photo.timestamp && new Date(photo.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                Sistema avançado inspirado no habbo-downloader com 5 estratégias de descoberta
              </span>
            </div>
            
            <Button 
              onClick={handleAdvancedDiscovery} 
              disabled={discoveryLoading || !username.trim()}
              className="w-full"
              variant="default"
            >
              <Target className="w-4 h-4 mr-2" />
              {discoveryLoading ? 'Descobrindo...' : 'Executar Descoberta Avançada'}
            </Button>

            {discoveryResults && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resultados da Descoberta Avançada</h3>
                  <Badge variant={discoveryResults.photos.length > 0 ? 'default' : 'secondary'}>
                    {discoveryResults.photos.length} fotos descobertas
                  </Badge>
                </div>

                {/* Discovery methods used */}
                <div className="space-y-2">
                  <h4 className="font-medium">Métodos de Descoberta Utilizados:</h4>
                  <div className="grid gap-2">
                    {discoveryResults.discoveryMethods?.map((method: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced discovery results */}
                <div className="space-y-2">
                  <h4 className="font-medium">Estratégias Executadas:</h4>
                  <div className="grid gap-2">
                    {discoveryResults.strategies.map((strategy: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          {strategy.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">{strategy.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {strategy.error && `Error: ${strategy.error}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {discoveryResults.photos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Fotos Descobertas:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {discoveryResults.photos.map((photo: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <img
                            src={photo.url}
                            alt={`Foto descoberta ${index + 1}`}
                            className="w-full aspect-square object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="text-xs space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {photo.method || photo.source}
                            </Badge>
                            <div className="text-muted-foreground">
                              {photo.timestamp && new Date(photo.timestamp).toLocaleDateString()}
                            </div>
                            {photo.internalId && (
                              <div className="text-muted-foreground">
                                ID: {photo.internalId}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Raw Data for debugging */}
        {(testResults || discoveryResults) && (
          <details className="border rounded p-4 mt-6">
            <summary className="cursor-pointer font-medium">Ver dados completos (debug)</summary>
            <div className="mt-2 space-y-4">
              {testResults && (
                <div>
                  <h5 className="font-medium mb-2">Teste Básico:</h5>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </div>
              )}
              {discoveryResults && (
                <div>
                  <h5 className="font-medium mb-2">Descoberta Avançada:</h5>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(discoveryResults, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};