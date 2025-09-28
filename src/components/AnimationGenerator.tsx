import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import HabboWindow from './HabboWindow';

export const AnimationGenerator: React.FC = () => {
  const [showHabboWindow, setShowHabboWindow] = useState(false);

  return (
    <div className="space-y-4">
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 volter-font">
            <Zap className="w-5 h-5" />
            Ferramentas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-2">
            <Button
            onClick={() => setShowHabboWindow(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full volter-font"
          >
            🎬 Gerador de Animações
            </Button>
        </CardContent>
      </Card>

      {/* Modal do Gerador */}
      {showHabboWindow && (
        <HabboWindow
          title="Habbo Imager"
          onClose={() => setShowHabboWindow(false)}
          onMinimize={() => setShowHabboWindow(false)}
          onMaximize={() => setShowHabboWindow(true)}
          initialPosition={{ x: 100, y: 100 }}
          initialSize={{ width: '800px', height: '600px' }}
        />
      )}
    </div>
  );
};

export default AnimationGenerator;