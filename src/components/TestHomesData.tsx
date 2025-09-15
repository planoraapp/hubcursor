import React from 'react';
import { useLatestHomes } from '@/hooks/useLatestHomes';
import { useTopRatedHomes } from '@/hooks/useTopRatedHomes';
import { useMostVisitedHomes } from '@/hooks/useMostVisitedHomes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TestHomesData: React.FC = () => {
  const { data: latestHomes, isLoading: loadingLatest } = useLatestHomes();
  const { data: topRatedHomes, isLoading: loadingTopRated } = useTopRatedHomes();
  const { data: mostVisitedHomes, isLoading: loadingMostVisited } = useMostVisitedHomes();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">🔍 Debug - Dados das Homes</h2>
      
      {/* Últimas Modificadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📅 Últimas Modificadas</span>
            <Badge variant="outline">{latestHomes?.length || 0} homes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLatest ? (
            <p>Carregando...</p>
          ) : latestHomes && latestHomes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestHomes.map((home, index) => (
                <div key={home.user_id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{home.habbo_name || 'Nome não encontrado'}</h3>
                  <p className="text-sm text-gray-600">ID: {home.user_id}</p>
                  <p className="text-sm text-gray-600">
                    Atualizado: {new Date(home.updated_at).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fundo: {home.background_type} - {home.background_value}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="secondary">⭐ {home.average_rating || 0}</Badge>
                    <Badge variant="outline">📊 {home.ratings_count || 0} avaliações</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma home encontrada</p>
          )}
        </CardContent>
      </Card>

      {/* Maiores Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⭐ Maiores Avaliações</span>
            <Badge variant="outline">{topRatedHomes?.length || 0} homes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTopRated ? (
            <p>Carregando...</p>
          ) : topRatedHomes && topRatedHomes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topRatedHomes.map((home, index) => (
                <div key={home.user_id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{home.habbo_name || 'Nome não encontrado'}</h3>
                  <p className="text-sm text-gray-600">ID: {home.user_id}</p>
                  <p className="text-sm text-gray-600">
                    Atualizado: {new Date(home.updated_at).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fundo: {home.background_type} - {home.background_value}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="secondary">⭐ {home.average_rating || 0}</Badge>
                    <Badge variant="outline">📊 {home.ratings_count || 0} avaliações</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma home encontrada</p>
          )}
        </CardContent>
      </Card>

      {/* Mais Visitadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>👥 Mais Visitadas</span>
            <Badge variant="outline">{mostVisitedHomes?.length || 0} homes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMostVisited ? (
            <p>Carregando...</p>
          ) : mostVisitedHomes && mostVisitedHomes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mostVisitedHomes.map((home, index) => (
                <div key={home.user_id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{home.habbo_name || 'Nome não encontrado'}</h3>
                  <p className="text-sm text-gray-600">ID: {home.user_id}</p>
                  <p className="text-sm text-gray-600">
                    Atualizado: {new Date(home.updated_at).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fundo: {home.background_type} - {home.background_value}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="secondary">👥 {home.visit_count || 0} visitas</Badge>
                    <Badge variant="outline">⭐ {home.average_rating || 0}</Badge>
                    <Badge variant="outline">📊 {home.ratings_count || 0} avaliações</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma home encontrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
