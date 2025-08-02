
import React from 'react';
import { ValidatedBadgesGrid } from '../components/ValidatedBadgesGrid';

const Emblemas = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Emblemas do Habbo
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sistema de emblemas 100% validado e verificado. Todos os badges são testados em tempo real
          através da nossa Edge Function de validação, garantindo que apenas emblemas reais sejam exibidos.
        </p>
      </div>
      
      <ValidatedBadgesGrid />
    </div>
  );
};

export default Emblemas;
