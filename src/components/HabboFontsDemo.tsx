import React from 'react';

const HabboFontsDemo: React.FC = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl rounded-lg p-3 space-y-3 max-w-md">
      <h2 className="text-lg font-bold text-gray-800 mb-2" style={{fontFamily: 'Volter'}}>🎨 Fontes Volter Goldfish Oficiais</h2>

      {/* Seção 1: Volter (Goldfish) - Normal */}
      <div className="p-2 bg-gray-50 rounded border">
        <h3 className="text-sm text-gray-600 mb-1" style={{fontFamily: 'Volter'}}>Volter (Goldfish) - Normal</h3>
        <p className="text-sm" style={{fontFamily: 'Volter', fontWeight: 'normal', color: 'black'}}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      {/* Seção 2: Volter-Bold (Goldfish) - Bold */}
      <div className="p-2 bg-gray-50 rounded border">
        <h3 className="text-sm text-gray-600 mb-1" style={{fontFamily: 'Volter'}}>Volter-Bold (Goldfish) - Bold</h3>
        <p className="text-sm" style={{fontFamily: 'Volter', fontWeight: 'bold', color: 'black'}}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      {/* Seção 3: Volter-Bold (Goldfish) - Text Shadow */}
      <div className="p-2 bg-gray-50 rounded border">
        <h3 className="text-sm mb-1" style={{fontFamily: 'Volter', fontWeight: 'bold', color: 'white', textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black'}}>Volter-Bold (Goldfish) - Text Shadow</h3>
        <p className="text-sm" style={{fontFamily: 'Volter', fontWeight: 'bold', color: 'white', textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black'}}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
    </div>
  );
};

export default HabboFontsDemo;