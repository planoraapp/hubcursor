
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FriendsFeedColumnProps {
  onSearchUser: (uniqueId: string) => void;
  activeTab: 'recent' | 'list';
  onTabChange: (tab: 'recent' | 'list') => void;
}

export const FriendsFeedColumn: React.FC<FriendsFeedColumnProps> = ({
  onSearchUser,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Amigos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'recent' | 'list')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
              <p className="text-gray-600">Nenhuma atividade recente de amigos...</p>
            </TabsContent>
            <TabsContent value="list">
              <p className="text-gray-600">Lista de amigos vazia...</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
