
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityCount: number;
  userName: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  activityCount, 
  userName 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividade de {userName} ({activityCount})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4">
            {activityCount === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Atividades recentes no Habbo Ticker: {activityCount}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
