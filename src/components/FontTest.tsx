import React from 'react';

/**
 * Componente para testar e comparar a renderização de caracteres acentuados
 */
export const FontTest: React.FC = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg border-2 border-black">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: 'Volter' }}>
        Teste de Caracteres - Fonte Volter Goldfish
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fonte Volter Original */}
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Volter' }}>
            Volter Original
          </h3>
          <div className="space-y-2">
            <p className="text-4xl" style={{ fontFamily: 'Volter' }}>
              o õ O Õ
            </p>
            <p className="text-2xl" style={{ fontFamily: 'Volter' }}>
              conexões
            </p>
            <p className="text-2xl" style={{ fontFamily: 'Volter' }}>
              incríveis
            </p>
            <p className="text-2xl" style={{ fontFamily: 'Volter' }}>
              comunidade
            </p>
          </div>
        </div>

        {/* Fonte Press Start 2P */}
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Press Start 2P' }}>
            Press Start 2P
          </h3>
          <div className="space-y-2">
            <p className="text-2xl" style={{ fontFamily: 'Press Start 2P' }}>
              o õ O Õ
            </p>
            <p className="text-lg" style={{ fontFamily: 'Press Start 2P' }}>
              conexões
            </p>
            <p className="text-lg" style={{ fontFamily: 'Press Start 2P' }}>
              incríveis
            </p>
            <p className="text-lg" style={{ fontFamily: 'Press Start 2P' }}>
              comunidade
            </p>
          </div>
        </div>

        {/* Fonte VT323 */}
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'VT323' }}>
            VT323
          </h3>
          <div className="space-y-2">
            <p className="text-4xl" style={{ fontFamily: 'VT323' }}>
              o õ O Õ
            </p>
            <p className="text-2xl" style={{ fontFamily: 'VT323' }}>
              conexões
            </p>
            <p className="text-2xl" style={{ fontFamily: 'VT323' }}>
              incríveis
            </p>
            <p className="text-2xl" style={{ fontFamily: 'VT323' }}>
              comunidade
            </p>
          </div>
        </div>

        {/* Fonte Ubuntu Condensed */}
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Ubuntu Condensed' }}>
            Ubuntu Condensed
          </h3>
          <div className="space-y-2">
            <p className="text-4xl" style={{ fontFamily: 'Ubuntu Condensed' }}>
              o õ O Õ
            </p>
            <p className="text-2xl" style={{ fontFamily: 'Ubuntu Condensed' }}>
              conexões
            </p>
            <p className="text-2xl" style={{ fontFamily: 'Ubuntu Condensed' }}>
              incríveis
            </p>
            <p className="text-2xl" style={{ fontFamily: 'Ubuntu Condensed' }}>
              comunidade
            </p>
          </div>
        </div>
      </div>

      {/* Comparação lado a lado */}
      <div className="mt-8 p-4 bg-blue-50 rounded border">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Comparação Lado a Lado
        </h3>
        <div className="text-center space-y-4">
          <div>
            <span className="text-3xl" style={{ fontFamily: 'Volter' }}>o</span>
            <span className="mx-4 text-gray-400">vs</span>
            <span className="text-3xl" style={{ fontFamily: 'Ubuntu Condensed' }}>o</span>
            <p className="text-sm text-gray-600 mt-1">Letra 'o' normal</p>
          </div>
          <div>
            <span className="text-3xl" style={{ fontFamily: 'Volter' }}>õ</span>
            <span className="mx-4 text-gray-400">vs</span>
            <span className="text-3xl" style={{ fontFamily: 'Ubuntu Condensed' }}>õ</span>
            <p className="text-sm text-gray-600 mt-1">Letra 'õ' com til</p>
          </div>
        </div>
      </div>

      {/* Teste com diferentes tamanhos */}
      <div className="mt-8 p-4 bg-green-50 rounded border">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Teste com Diferentes Tamanhos
        </h3>
        <div className="text-center space-y-2">
          {[12, 14, 16, 18, 20, 24].map(size => (
            <div key={size} className="flex items-center justify-center gap-4">
              <span className="text-sm text-gray-600 w-8">{size}px</span>
              <span style={{ fontFamily: 'Volter', fontSize: `${size}px` }}>õ</span>
              <span style={{ fontFamily: 'Ubuntu Condensed', fontSize: `${size}px` }}>õ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
