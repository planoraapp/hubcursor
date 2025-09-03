
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Wrench } from 'lucide-react';

interface PlaceholderColumnProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const PlaceholderColumn: React.FC<PlaceholderColumnProps> = ({ 
  title, 
  description = "Este módulo está sendo reconstruído com nova arquitetura otimizada.",
  icon: Icon = Construction
}) => {
  return (
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
            <Wrench className="w-8 h-8 text-white/60" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Em Manutenção</h3>
            <p className="text-sm text-white/70 max-w-sm">
              {description}
            </p>
            <div className="mt-4 text-xs text-white/50">
              Nova versão em breve...
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
