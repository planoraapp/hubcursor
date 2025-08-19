
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WIDGET_TYPES = [
  { id: 'avatar', name: 'Perfil do Usuário', description: 'Mostra avatar e informações', icon: '👤' },
  { id: 'guestbook', name: 'Livro de Visitas', description: 'Permite visitantes deixarem mensagens', icon: '📝' },
  { id: 'rating', name: 'Avaliação', description: 'Sistema de like/dislike', icon: '⭐' },
];

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onWidgetAdd?: (widgetType: string) => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  isOpen,
  onClose,
  onWidgetAdd
}) => {
  
  const handleWidgetAdd = (widgetType: string) => {
    onWidgetAdd?.(widgetType);
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-volter text-xl">
            📦 Adicionar Widget
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-volter">
            Escolha um widget para adicionar à sua Habbo Home
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0 py-4">
          {WIDGET_TYPES.map((widget) => (
            <Card key={widget.id} className="group cursor-pointer hover:bg-accent transition-colors" onClick={() => handleWidgetAdd(widget.id)}>
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{widget.icon}</div>
                <CardTitle className="text-lg font-volter">{widget.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground font-volter mb-4">
                  {widget.description}
                </p>
                <Button size="sm" className="w-full font-volter">
                  Adicionar Widget
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Future Widgets Preview */}
        <Card className="border-dashed border-2 mt-4">
          <CardHeader>
            <CardTitle className="text-center font-volter flex items-center justify-center gap-2 text-lg">
              🚧 Widgets em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="font-bold font-volter">🎵 Player de Música</div>
                <div className="text-muted-foreground text-xs">Em breve</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="font-bold font-volter">📊 Contador de Visitas</div>
                <div className="text-muted-foreground text-xs">Em breve</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="font-bold font-volter">📝 Widget de Texto</div>
                <div className="text-muted-foreground text-xs">Em breve</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="font-bold font-volter">🎮 Mini Games</div>
                <div className="text-muted-foreground text-xs">Em breve</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="font-volter">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
