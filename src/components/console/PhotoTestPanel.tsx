import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTestPhotos } from '@/hooks/useTestPhotos';
import { TestTube, Search, Image, CheckCircle, XCircle } from 'lucide-react';

export const PhotoTestPanel: React.FC = () => {
  const { testPhotos, isLoading, results } = useTestPhotos();
  const [username, setUsername] = React.useState('Beebop');
  const [hotel, setHotel] = React.useState('com.br');

  const handleTest = async () => {
    try {
      await testPhotos(username, hotel);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Teste de Descoberta de Fotos
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
        
        <Button 
          onClick={handleTest} 
          disabled={isLoading || !username.trim()}
          className="w-full"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Testando...' : 'Testar Descoberta de Fotos'}
        </Button>

        {results && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Resultados do Teste</h3>
              <Badge variant={results.photos.length > 0 ? 'default' : 'secondary'}>
                {results.photos.length} fotos encontradas
              </Badge>
            </div>

            {/* Strategies Summary */}
            <div className="space-y-2">
              <h4 className="font-medium">Estratégias Testadas:</h4>
              <div className="grid gap-2">
                {results.strategies.map((strategy: any, index: number) => (
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

            {/* Photos Found */}
            {results.photos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Fotos Encontradas:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {results.photos.map((photo: any, index: number) => (
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

            {/* Raw Data (for debugging) */}
            <details className="border rounded p-4">
              <summary className="cursor-pointer font-medium">Ver dados completos (debug)</summary>
              <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};