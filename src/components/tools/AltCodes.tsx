import React, { useState, useEffect } from 'react';

const AltCodes = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [volterText, setVolterText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Dados dos Alt Codes com múltiplos URLs de fallback
  const habboAltCodes = [
    { 
      code: 'Alt + 7', 
      unicode: 'Alt + 0149', 
      character: '•', 
      description: 'Ponto de lista (bullet)', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/7-1.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/7/72/2_alt.png',
        'https://habboxwiki.com/File:2_alt.png'
      ]
    },
    { 
      code: 'Alt + 20', 
      unicode: 'Alt + 0182', 
      character: '¶', 
      description: 'Símbolo de parágrafo', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/20.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/b/b2/3_alt.png',
        'https://habboxwiki.com/File:3_alt.png'
      ]
    },
    { 
      code: 'Alt + 124', 
      unicode: 'Alt + 0124', 
      character: '|', 
      description: 'Barra vertical (pipe)', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/shiftheart.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/9/92/22_alt.png',
        'https://habboxwiki.com/File:22_alt.png'
      ]
    },
    { 
      code: 'Alt + 159', 
      unicode: 'Alt + 0131', 
      character: 'ƒ', 
      description: 'Símbolo florin', 
      imageUrl: 'https://habboxwiki.com/wiki/images/0/04/6_alt.png',
      fallbackUrls: [
        'https://habbox.com/wp-content/uploads/2016/10/159.png',
        'https://habboxwiki.com/File:6_alt.png',
        'https://habboxwiki.com/wiki/images/0/04/6_alt.png'
      ]
    },
    { 
      code: 'Alt + 166', 
      unicode: 'Alt + 0170', 
      character: 'ª', 
      description: 'Ordinal feminino', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/422.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/e/e6/32_alt.png',
        'https://habboxwiki.com/File:32_alt.png'
      ]
    },
    { 
      code: 'Alt + 167', 
      unicode: 'Alt + 0186', 
      character: 'º', 
      description: 'Ordinal masculino', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/423.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/c/cc/33_alt.png',
        'https://habboxwiki.com/File:33_alt.png'
      ]
    },
    { 
      code: 'Alt + 170', 
      unicode: 'Alt + 0172', 
      character: '¬', 
      description: 'Símbolo de negação', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/feesh.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/7/73/31_alt.png',
        'https://habboxwiki.com/File:31_alt.png'
      ]
    },
    { 
      code: 'Alt + 175', 
      unicode: 'Alt + 0187', 
      character: '»', 
      description: 'Aspas angulares direitas', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/175.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/b/b6/10_alt.png',
        'https://habboxwiki.com/File:10_alt.png'
      ]
    },
    { 
      code: 'Alt + 190', 
      unicode: 'Alt + 0165', 
      character: '¥', 
      description: 'Símbolo do yen', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/157.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/2/2e/5_alt.png',
        'https://habboxwiki.com/File:5_alt.png'
      ]
    },
    { 
      code: 'Alt + 230', 
      unicode: 'Alt + 0181', 
      character: 'µ', 
      description: 'Símbolo micro', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/230.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/3/3a/27_alt.png',
        'https://habboxwiki.com/File:27_alt.png'
      ]
    },
    { 
      code: 'Alt + 241', 
      unicode: 'Alt + 0177', 
      character: '±', 
      description: 'Símbolo mais-menos', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/241.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/5/58/17_alt.png',
        'https://habboxwiki.com/File:17_alt.png'
      ]
    },
    { 
      code: 'Alt + 246', 
      unicode: 'Alt + 0247', 
      character: '÷', 
      description: 'Símbolo de divisão', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/246.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/d/d4/18_alt.png',
        'https://habboxwiki.com/File:18_alt.png'
      ]
    },
    { 
      code: 'Alt + 0134', 
      unicode: 'Alt + 0134', 
      character: '†', 
      description: 'Símbolo de adaga', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/0134.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/4/49/35_alt.png',
        'https://habboxwiki.com/File:35_alt.png'
      ]
    },
    { 
      code: 'Alt + 0135', 
      unicode: 'Alt + 0135', 
      character: '‡', 
      description: 'Símbolo de adaga dupla', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/0135-1.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/a/a1/36_alt.png',
        'https://habboxwiki.com/File:36_alt.png'
      ]
    },
    { 
      code: 'Alt + 0145', 
      unicode: 'Alt + 0145', 
      character: '\u2018', 
      description: 'Aspas simples esquerda', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/0145-1.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/7/79/Lock_alt.png',
        'https://habboxwiki.com/File:Lock_alt.png'
      ]
    },
    { 
      code: 'Alt + 0151', 
      unicode: 'Alt + 0151', 
      character: '—', 
      description: 'Traço em (em dash)', 
      imageUrl: 'https://habbox.com/wp-content/uploads/2016/10/music.png',
      fallbackUrls: [
        'https://habboxwiki.com/wiki/images/7/7b/Music_alt.png',
        'https://habboxwiki.com/File:Music_alt.png'
      ]
    }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const generateVolterText = async () => {
    if (!volterText.trim()) return;
    
    try {
      // Primeiro, tentar usar o gerador de texto Volter do HabboEmotion
      const response = await fetch('https://files.habboemotion.com/resources/generalscripts/voltertxtgen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(volterText)}`
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setGeneratedImage(imageUrl);
      } else {
        // Fallback: criar uma imagem com Alt Codes usando as PNGs
        createAltCodesImage();
      }
    } catch (error) {
      console.error('Erro ao gerar texto Volter:', error);
      // Fallback: criar uma imagem com Alt Codes usando as PNGs
      createAltCodesImage();
    }
  };

  const createAltCodesImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mapear caracteres para suas imagens PNG
    const altCodeMap: { [key: string]: string } = {
      '•': 'https://habboxwiki.com/wiki/images/7/72/2_alt.png',
      '¶': 'https://habboxwiki.com/wiki/images/b/b2/3_alt.png',
      '|': 'https://habboxwiki.com/wiki/images/9/92/22_alt.png',
      'ƒ': 'https://habboxwiki.com/wiki/images/0/04/6_alt.png',
      'ª': 'https://habboxwiki.com/wiki/images/e/e6/32_alt.png',
      'º': 'https://habboxwiki.com/wiki/images/c/cc/33_alt.png',
      '¬': 'https://habboxwiki.com/wiki/images/7/73/31_alt.png',
      '»': 'https://habboxwiki.com/wiki/images/b/b6/10_alt.png',
      '¥': 'https://habboxwiki.com/wiki/images/2/2e/5_alt.png',
      'µ': 'https://habboxwiki.com/wiki/images/3/3a/27_alt.png',
      '±': 'https://habboxwiki.com/wiki/images/5/58/17_alt.png',
      '÷': 'https://habboxwiki.com/wiki/images/d/d4/18_alt.png',
      '†': 'https://habboxwiki.com/wiki/images/4/49/35_alt.png',
      '‡': 'https://habboxwiki.com/wiki/images/a/a1/36_alt.png',
      '\u2018': 'https://habboxwiki.com/wiki/images/7/79/Lock_alt.png',
      '—': 'https://habboxwiki.com/wiki/images/7/7b/Music_alt.png'
    };

    // Configurar canvas
    const charWidth = 16;
    const charHeight = 16;
    canvas.width = volterText.length * charWidth + 20;
    canvas.height = charHeight + 10;
    
    // Estilo pixelado
    ctx.imageSmoothingEnabled = false;
    
    let x = 10;
    
    // Processar cada caractere
    for (let i = 0; i < volterText.length; i++) {
      const char = volterText[i];
      
      if (altCodeMap[char]) {
        // Carregar e desenhar imagem PNG do Alt Code
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, x, 5, charWidth, charHeight);
              resolve(true);
            };
            img.onerror = () => {
              // Fallback para texto se a imagem não carregar
              ctx.font = '11px monospace';
              ctx.fillStyle = '#000000';
              ctx.fillText(char, x, 15);
              resolve(true);
            };
            img.src = altCodeMap[char];
          });
        } catch (error) {
          // Fallback para texto
          ctx.font = '11px monospace';
          ctx.fillStyle = '#000000';
          ctx.fillText(char, x, 15);
        }
      } else {
        // Desenhar caractere normal
        ctx.font = '11px monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText(char, x, 15);
      }
      
      x += charWidth;
    }
    
    const imageUrl = canvas.toDataURL();
    setGeneratedImage(imageUrl);
  };

  // Função para testar URLs das imagens
  const testImageUrls = () => {
    habboAltCodes.forEach((altCode, index) => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ ${altCode.character} (${altCode.code}) - URL OK: ${altCode.imageUrl}`);
      };
      img.onerror = () => {
        console.log(`❌ ${altCode.character} (${altCode.code}) - URL FALHOU: ${altCode.imageUrl}`);
        setImageErrors(prev => new Set(prev).add(altCode.character));
      };
      img.src = altCode.imageUrl;
    });
  };

  // Testar URLs ao carregar o componente
  useEffect(() => {
    testImageUrls();
  }, []);

  const handleImageError = (altCode: any, target: HTMLImageElement) => {
    const currentSrc = target.src;
    const fallbackUrls = altCode.fallbackUrls || [];
    
    // Encontrar o próximo URL de fallback
    const currentIndex = fallbackUrls.findIndex((url: string) => currentSrc.includes(url));
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fallbackUrls.length) {
      // Tentar próximo URL de fallback
      target.src = fallbackUrls[nextIndex];
    } else {
      // Se todos os fallbacks falharam, esconder imagem e mostrar indicador
      target.style.display = 'none';
      setImageErrors(prev => new Set(prev).add(altCode.character));
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⌨️</span>
          <h1 className="text-2xl font-bold text-gray-900 volter-font">Alt Codes Completos do Habbo</h1>
        </div>
        <p className="text-gray-600 text-base mb-2">
          Códigos Alt especiais do Habbo Hotel para usar no chat e nomes de salas
        </p>
        <p className="text-sm text-gray-500 volter-font">
          Baseado na <a href="https://habboxwiki.com/Alt_Codes" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Habbox Wiki</a> - {habboAltCodes.length} caracteres especiais
        </p>
        {imageErrors.size > 0 && (
          <div className="mt-1 text-sm text-orange-600 volter-font">
            ⚠️ {imageErrors.size} imagens não carregaram - usando fallbacks
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2 volter-font">Como usar:</h2>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 volter-font text-sm">
          <li>Mantenha o 'Num Lock' ativado (laptop) ou use o teclado numérico</li>
          <li>Segure a tecla Alt (Alt + Fn em alguns laptops)</li>
          <li>Digite os números correspondentes no teclado numérico</li>
          <li>Solte a tecla Alt</li>
          <li>Ou simplesmente copie e cole o caractere diretamente</li>
        </ol>
      </div>

      {/* Quadro branco com Alt Codes - altura otimizada */}
      <div className="bg-white border border-gray-300 rounded-lg p-3">
        <h2 className="text-base font-semibold text-gray-900 mb-2 volter-font text-center">Alt Codes Disponíveis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
          {habboAltCodes.map((altCode, index) => (
            <div key={index} className="border border-gray-200 rounded p-1.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                {/* Lado esquerdo: Informações do Alt Code */}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="volter-font text-base font-bold">{altCode.character}</span>
                    <div className="relative">
                      <img 
                        src={altCode.imageUrl} 
                        alt={altCode.character}
                        className="mx-auto"
                        style={{
                          width: '14px',
                          height: '14px',
                          imageRendering: 'pixelated'
                        }}
                        onError={(e) => handleImageError(altCode, e.target as HTMLImageElement)}
                      />
                    </div>
                  </div>
                  <div className="volter-font text-xs text-gray-600 leading-tight">
                    <div><span className="font-semibold">Alt:</span> {altCode.code}</div>
                    <div><span className="font-semibold">Unicode:</span> {altCode.unicode}</div>
                    <div className="text-gray-700">{altCode.description}</div>
                  </div>
                </div>
                
                {/* Lado direito: Botão de copiar */}
                <div className="ml-1.5">
                  <button
                    onClick={() => copyToClipboard(altCode.character)}
                    className="px-1.5 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors volter-font font-semibold"
                  >
                    {copiedCode === altCode.character ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h3 className="text-base font-semibold text-yellow-900 mb-1 volter-font">Nota Importante:</h3>
        <p className="text-yellow-800 volter-font text-sm">
          Esta tabela contém {habboAltCodes.length} caracteres especiais com suas respectivas imagens PNG pixeladas. 
          Os caracteres aparecem com a fonte padrão do sistema, mas no Habbo têm aparência pixelada oficial.
          Se alguma imagem não carregar, será exibido um indicador de erro (ponto vermelho).
        </p>
      </div>
    </div>
  );
};

export default AltCodes;