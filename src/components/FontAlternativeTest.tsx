import React, { useState } from 'react';

type FontOption = 'volter-original' | 'press-start-2p' | 'vt323' | 'ubuntu-condensed' | 'century-gothic';

const fontOptions = [
  { id: 'volter-original', name: 'Volter Original', class: 'volter-body-text' },
  { id: 'press-start-2p', name: 'Press Start 2P', class: 'volter-press-start' },
  { id: 'vt323', name: 'VT323', class: 'volter-vt323' },
  { id: 'ubuntu-condensed', name: 'Ubuntu Condensed', class: 'ubuntu-habbo-font' },
  { id: 'century-gothic', name: 'Century Gothic', class: 'volter-century-gothic' },
];

const testTexts = [
  'Acesse o console social para ver fotos de amigos, buscar usuários e interagir com a comunidade.',
  'Explore as homes dos usuários, crie conexões e descubra conteúdos incríveis da comunidade.',
  'Descubra e colecione emblemas exclusivos, veja rankings e conquiste seu lugar na comunidade.',
  'Explore todas as funcionalidades do HabboHub e conecte-se com a maior comunidade Habbo do Brasil.',
];

export const FontAlternativeTest: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState<FontOption>('volter-original');

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg border-2 border-black">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: 'Volter' }}>
        Teste de Fontes Alternativas
      </h2>
      
      {/* Seletor de Fontes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Escolha uma fonte para testar:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {fontOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedFont(option.id as FontOption)}
              className={`p-3 rounded border-2 transition-all ${
                selectedFont === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Teste com textos da página inicial */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Textos da Página Inicial:</h3>
        <div className="space-y-4">
          {testTexts.map((text, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded border">
              <p className={`${fontOptions.find(f => f.id === selectedFont)?.class} text-gray-600`}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparação de caracteres problemáticos */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Caracteres Problemáticos:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded border border-red-200">
            <h4 className="font-semibold mb-2">Palavras com acentuação:</h4>
            <p className={`${fontOptions.find(f => f.id === selectedFont)?.class} text-gray-700`}>
              conexões, incríveis, comunidade, comunicação, ação, coração
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <h4 className="font-semibold mb-2">Caracteres específicos:</h4>
            <p className={`${fontOptions.find(f => f.id === selectedFont)?.class} text-gray-700 text-2xl`}>
              Í í Ç ç ã Ã õ Õ á é ó ú â ê ô
            </p>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-8 p-4 bg-blue-50 rounded border">
        <h3 className="text-lg font-semibold mb-2">Como usar:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Teste cada fonte clicando nos botões acima</li>
          <li>Observe como os caracteres acentuados são renderizados</li>
          <li>Compare com a fonte Volter original</li>
          <li>Escolha a fonte que melhor mantém o visual pixelado do Habbo</li>
        </ol>
      </div>
    </div>
  );
};
