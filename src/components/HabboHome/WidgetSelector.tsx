
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 volter-font">
            📱 Widgets da Home
          </DialogTitle>
          <DialogDescription className="text-gray-600 volter-font">
            Adicione widgets personalizáveis à sua Habbo Home
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-dashed border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-center volter-font flex items-center justify-center gap-2">
              🚧 Em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 volter-font">
              Os widgets personalizados estão sendo desenvolvidos! Em breve você poderá adicionar:
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-bold volter-font">🎵 Player de Música</div>
                <div className="text-gray-600">Reproduza suas músicas favoritas</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-bold volter-font">⭐ Sistema de Avaliação</div>
                <div className="text-gray-600">Visitantes podem avaliar sua home</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-bold volter-font">📊 Contador de Visitas</div>
                <div className="text-gray-600">Veja quantas pessoas visitaram</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-bold volter-font">📝 Widget de Texto</div>
                <div className="text-gray-600">Adicione informações personalizadas</div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 volter-font mb-3">
                Por enquanto, você pode usar os widgets fixos (Avatar e Guestbook) e personalizar com stickers e fundos!
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline" className="volter-font">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
