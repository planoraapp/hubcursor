
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { Sofa } from 'lucide-react';

const FurniPuhekupla = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <NewAppSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Furni Puhekupla</h1>
            <p className="text-gray-600">Explorador de móveis do Habbo</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sofa className="w-5 h-5" />
                Catálogo de Móveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Esta ferramenta permitirá explorar e visualizar móveis do Habbo. Em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FurniPuhekupla;
