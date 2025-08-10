
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HotelFeedColumn = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Feed do Hotel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Nenhuma atividade recente...</p>
        </CardContent>
      </Card>
    </div>
  );
};
