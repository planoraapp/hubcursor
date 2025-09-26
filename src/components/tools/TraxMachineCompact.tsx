import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TraxMachineModal from './TraxMachineModal';

const TraxMachineCompact: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card 
        className="p-6 bg-white/90 backdrop-blur-sm border-2 border-black hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => setModalOpen(true)}
      >
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="text-3xl">🎵</span>
          </div>
          <CardTitle className="volter-font text-xl text-gray-900">Sound Machine Editor</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 volter-font mb-4">
            Crie suas próprias músicas no estilo Habbo! Use o editor de som para compor melodias únicas.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded volter-font">Editor de Som</span>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded volter-font">Sound Sets</span>
            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded volter-font">Export Habbo</span>
            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded volter-font">Play/Pause</span>
          </div>
        </CardContent>
      </Card>

      <TraxMachineModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  );
};

export default TraxMachineCompact;
