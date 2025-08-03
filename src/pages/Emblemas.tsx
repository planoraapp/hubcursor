
import React from 'react';
import { CleanBadgesGrid } from '../components/CleanBadgesGrid';

const Emblemas = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Emblemas do Habbo
          </h1>
          <p className="text-gray-600 text-lg">
            Coleção completa de emblemas do HabboAssets com busca e categorização
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
          <CleanBadgesGrid />
        </div>
      </div>
    </div>
  );
};

export default Emblemas;
