
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Globe, Users, Clock } from 'lucide-react';

interface InfoWidgetProps {
  habboData?: {
    name?: string;
    hotel?: string;
    online?: boolean;
    lastOnline?: string;
    friends?: number;
  };
}

export const InfoWidget = ({ habboData }: InfoWidgetProps) => {
  return (
    <Card className="w-full h-full p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-lg volter-font">Informações</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 volter-font">Hotel:</span>
          <Badge variant="secondary" className="volter-font">
            <Globe className="w-3 h-3 mr-1" />
            {habboData?.hotel?.toUpperCase() || 'BR'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 volter-font">Status:</span>
          <Badge 
            variant={habboData?.online ? 'default' : 'secondary'} 
            className="volter-font"
          >
            {habboData?.online ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 volter-font">Amigos:</span>
          <div className="flex items-center text-sm volter-font">
            <Users className="w-3 h-3 mr-1" />
            {habboData?.friends || 128}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 volter-font">Último acesso:</span>
          <div className="flex items-center text-xs text-gray-500 volter-font">
            <Clock className="w-3 h-3 mr-1" />
            {habboData?.lastOnline || 'Hoje'}
          </div>
        </div>
      </div>
    </Card>
  );
};
