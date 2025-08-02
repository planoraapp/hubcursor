
import React from 'react';
import { HybridUnifiedBadgesGrid } from '../components/HybridUnifiedBadgesGrid';

const Emblemas = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Emblemas Híbrido
          </h1>
          <p className="text-gray-600 text-lg">
            Base de dados unificada com descoberta automática e categorização inteligente
          </p>
        </div>
        
        <HybridUnifiedBadgesGrid />
      </div>
    </div>
  );
};

export default Emblemas;
