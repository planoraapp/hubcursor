import React from 'react';

const AltCodesInstructions = () => {
  return (
    <div className="p-4 bg-blue-50/90 backdrop-blur-sm border-2 border-blue-300 rounded-lg">
      <div className="text-center mb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-xl">📋</span>
        </div>
        <h3 className="volter-font text-lg text-blue-900">Como Usar Alt Codes</h3>
      </div>
      
      <div className="space-y-2 text-blue-800 volter-font text-xs">
        <div><strong>Num Lock ativado + Alt + números</strong></div>
        <div>• Segure Alt + digite números no teclado numérico</div>
        <div>• Para laptops: use teclas 7-8-9, u-i-o, j-k-l, m</div>
        <div>• Ou copie e cole diretamente</div>
      </div>
      
      <div className="mt-3 text-center">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded volter-font">
          {16} caracteres especiais disponíveis
        </span>
      </div>
    </div>
  );
};

export default AltCodesInstructions;
