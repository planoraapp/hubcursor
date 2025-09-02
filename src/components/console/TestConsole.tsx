import React from 'react';

export const TestConsole: React.FC = () => {
  return (
    <div className="bg-white/10 p-8 rounded-lg text-white text-center">
      <h2 className="text-2xl font-bold mb-4">🎮 Console de Teste</h2>
      <p className="mb-4">Se você está vendo esta mensagem, o console está funcionando!</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500/20 p-4 rounded">
          <h3 className="font-semibold">Status</h3>
          <p>✅ Funcionando</p>
        </div>
        <div className="bg-green-500/20 p-4 rounded">
          <h3 className="font-semibold">Componente</h3>
          <p>🎯 TestConsole</p>
        </div>
      </div>
    </div>
  );
};
