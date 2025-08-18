
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Star, Calendar } from 'lucide-react';

interface UserCardWidgetProps {
  habboData?: {
    name?: string;
    motto?: string;
    figureString?: string;
    memberSince?: string;
    profileVisible?: boolean;
  };
}

export const UserCardWidget = ({ habboData }: UserCardWidgetProps) => {
  return (
    <Card className="w-full h-full p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg volter-font">{habboData?.name || 'Habbo'}</h3>
          <p className="text-sm text-gray-600 volter-font">{habboData?.motto || 'Bem-vindo!'}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Badge variant="secondary" className="volter-font">
          <Star className="w-3 h-3 mr-1" />
          Membro VIP
        </Badge>
        <div className="flex items-center text-xs text-gray-500 volter-font">
          <Calendar className="w-3 h-3 mr-1" />
          Membro desde {habboData?.memberSince || '2024'}
        </div>
      </div>
    </Card>
  );
};
