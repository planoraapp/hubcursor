import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User, Image, ListChecks, MessageSquare } from 'lucide-react';
import { UserProfileInColumn } from '@/components/console2/UserProfileInColumn';
import { FeedPhotosTabbedColumn } from '@/components/console2/FeedPhotosTabbedColumn';
import { FeedActivityTabbedColumn } from '@/components/console2/FeedActivityTabbedColumn';
import { MyConsoleProfileTabbedColumn } from '@/components/console2/MyConsoleProfileTabbedColumn';
import { useChronologicalSystemInitializer } from '@/hooks/useChronologicalSystemInitializer';
import { useMessagingSystem } from '@/hooks/useMessagingSystem';

export const TabbedConsole = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('activity');
  const { startConversation } = useMessagingSystem();
  
  // Inicializar sistema cronológico automaticamente
  useChronologicalSystemInitializer();

  const handleSearch = useCallback(() => {
    if (searchQuery.trim() !== '') {
      setSelectedUser(searchQuery.trim());
    }
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStartConversation = async (targetHabboName: string) => {
    console.log(`[💬 CONSOLE] Iniciando conversa com ${targetHabboName}`);
    const conversationId = await startConversation(targetHabboName);
    
    if (conversationId) {
      // Aqui você pode adicionar lógica para navegar para a conversa
      // ou abrir um modal de chat, dependendo do design desejado
      console.log(`[💬 CONSOLE] Conversa criada: ${conversationId}`);
    }
  };

  return (
    <Tabs defaultValue="activity" className="w-full h-full flex flex-col">
      <div className="flex items-center space-x-4 p-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar usuário..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="bg-black/30 border-white/20 text-white shadow-none focus-visible:ring-white/50"
          />
        </div>
        <Button onClick={handleSearch} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </div>
      <TabsList className="bg-black/30 border-b border-white/20 p-4">
        <TabsTrigger value="activity" className="data-[state=active]:bg-white/10 data-[state=active]:text-white hover:bg-white/5 hover:text-white text-white/60">
          <ListChecks className="w-4 h-4 mr-2" />
          Atividades
        </TabsTrigger>
        <TabsTrigger value="photos" className="data-[state=active]:bg-white/10 data-[state=active]:text-white hover:bg-white/5 hover:text-white text-white/60">
          <Image className="w-4 h-4 mr-2" />
          Fotos
        </TabsTrigger>
        <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white hover:bg-white/5 hover:text-white text-white/60">
          <User className="w-4 h-4 mr-2" />
          Meu Perfil
        </TabsTrigger>
      </TabsList>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex">
          <TabsContent value="activity" className="flex-1 p-4 h-full">
            <FeedActivityTabbedColumn onUserClick={setSelectedUser} />
          </TabsContent>
          <TabsContent value="photos" className="flex-1 p-4 h-full">
            <FeedPhotosTabbedColumn onUserClick={setSelectedUser} />
          </TabsContent>
          <TabsContent value="profile" className="flex-1 p-4 h-full">
            <MyConsoleProfileTabbedColumn />
          </TabsContent>
          {selectedUser && (
            <UserProfileInColumn
              username={selectedUser}
              onBack={() => setSelectedUser(null)}
              onStartConversation={handleStartConversation}
            />
          )}
        </div>
      </div>
    </Tabs>
  );
};
