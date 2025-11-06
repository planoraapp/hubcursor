
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const ForumPage = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1 bg-gray-50 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Fórum</h1>
              <p className="text-gray-600">Discussões da comunidade</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Fórum em Desenvolvimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  O sistema de fórum está sendo desenvolvido. Em breve você poderá participar das discussões da comunidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ForumPage;
