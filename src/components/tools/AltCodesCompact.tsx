import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Notification from '@/components/ui/notification';

const AltCodesCompact = () => {
  const [selectedAltCode, setSelectedAltCode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; isVisible: boolean }>({
    message: '',
    isVisible: false
  });

  // Dados dos Alt Codes com imagens locais
  const habboAltCodes = [
    { 
      code: 'Alt + 7', 
      unicode: 'Alt + 0149', 
      character: '•', 
      description: 'Ponto de lista (bullet)', 
      imageUrl: '/images/alt-codes/alt-7.png'
    },
    { 
      code: 'Alt + 20', 
      unicode: 'Alt + 0182', 
      character: '¶', 
      description: 'Símbolo de parágrafo', 
      imageUrl: '/images/alt-codes/alt-20.png'
    },
    { 
      code: 'Alt + 124', 
      unicode: 'Alt + 0124', 
      character: '|', 
      description: 'Barra vertical (pipe)', 
      imageUrl: '/images/alt-codes/alt-124.png'
    },
    { 
      code: 'Alt + 159', 
      unicode: 'Alt + 0131', 
      character: 'ƒ', 
      description: 'Símbolo florin', 
      imageUrl: '/images/alt-codes/alt-159.png'
    },
    { 
      code: 'Alt + 166', 
      unicode: 'Alt + 0170', 
      character: 'ª', 
      description: 'Ordinal feminino', 
      imageUrl: '/images/alt-codes/alt-166.png'
    },
    { 
      code: 'Alt + 167', 
      unicode: 'Alt + 0186', 
      character: 'º', 
      description: 'Ordinal masculino', 
      imageUrl: '/images/alt-codes/alt-167.png'
    },
    { 
      code: 'Alt + 170', 
      unicode: 'Alt + 0172', 
      character: '¬', 
      description: 'Símbolo de negação', 
      imageUrl: '/images/alt-codes/alt-170.png'
    },
    { 
      code: 'Alt + 175', 
      unicode: 'Alt + 0187', 
      character: '»', 
      description: 'Aspas angulares direitas', 
      imageUrl: '/images/alt-codes/alt-175.png'
    },
    { 
      code: 'Alt + 190', 
      unicode: 'Alt + 0165', 
      character: '¥', 
      description: 'Símbolo do yen', 
      imageUrl: '/images/alt-codes/alt-190.png'
    },
    { 
      code: 'Alt + 230', 
      unicode: 'Alt + 0181', 
      character: 'µ', 
      description: 'Símbolo micro', 
      imageUrl: '/images/alt-codes/alt-230.png'
    },
    { 
      code: 'Alt + 241', 
      unicode: 'Alt + 0177', 
      character: '±', 
      description: 'Símbolo mais-menos', 
      imageUrl: '/images/alt-codes/alt-241.png'
    },
    { 
      code: 'Alt + 246', 
      unicode: 'Alt + 0247', 
      character: '÷', 
      description: 'Símbolo de divisão', 
      imageUrl: '/images/alt-codes/alt-246.png'
    },
    { 
      code: 'Alt + 248', 
      unicode: 'Alt + 0176', 
      character: '°', 
      description: 'Símbolo de grau', 
      imageUrl: '/images/alt-codes/alt-248.png'
    },
    { 
      code: 'Alt + 251', 
      unicode: 'Alt + 0221', 
      character: '√', 
      description: 'Símbolo de raiz quadrada', 
      imageUrl: '/images/alt-codes/alt-251.png'
    },
    { 
      code: 'Alt + 0134', 
      unicode: 'Alt + 0134', 
      character: '†', 
      description: 'Símbolo de cruz', 
      imageUrl: '/images/alt-codes/alt-0134.png'
    },
    { 
      code: 'Alt + 0135', 
      unicode: 'Alt + 0135', 
      character: '‡', 
      description: 'Símbolo de cruz dupla', 
      imageUrl: '/images/alt-codes/alt-0135.png'
    },
    { 
      code: 'Alt + 0145', 
      unicode: 'Alt + 0145', 
      character: '\u2018', 
      description: 'Aspas simples esquerda', 
      imageUrl: '/images/alt-codes/alt-0145.png'
    },
    { 
      code: 'Alt + 0151', 
      unicode: 'Alt + 0151', 
      character: '—', 
      description: 'Traço longo', 
      imageUrl: '/images/alt-codes/alt-0151.png'
    }
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      // Tentar usar a API moderna do clipboard primeiro
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para navegadores mais antigos ou contextos não seguros
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (fallbackErr) {
                    // Se tudo falhar, mostrar o texto para o usuário copiar manualmente
          alert(`Copie este caractere: ${text}`);
          return;
        } finally {
          document.body.removeChild(textArea);
        }
      }
      
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
      
      // Mostrar notificação
      setNotification({
        message: `Alt Code copiado: ${text}`,
        isVisible: true
      });
    } catch (err) {
            // Mostrar notificação de erro
      setNotification({
        message: `Erro ao copiar. Tente selecionar e copiar manualmente: ${text}`,
        isVisible: true
      });
    }
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const openModal = (altCode: any) => {
    setSelectedAltCode(altCode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAltCode(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 volter-font text-center">
        Alt Codes Habbo
      </h3>
      
      {/* Grid de Alt Codes */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {habboAltCodes.slice(0, 8).map((altCode, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded p-2 hover:bg-gray-100 transition-colors cursor-pointer relative"
            onClick={() => copyToClipboard(altCode.character, `main-${index}`)}
            title={`${altCode.character} - ${altCode.description} - Clique para copiar`}
          >
            <img 
              src={altCode.imageUrl} 
              alt={altCode.character}
              className="w-full h-8 object-contain mx-auto"
              style={{ imageRendering: 'pixelated' }}
              loading="lazy"
            />
            {copiedCode === `main-${index}` && (
              <div className="absolute inset-0 bg-green-100 bg-opacity-90 flex items-center justify-center rounded">
                <span className="volter-font text-xs text-green-800 font-bold">✓ Copiado!</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botão para ver todos */}
      <div className="text-center">
        <Button 
          onClick={() => openModal(null)}
          className="habbo-button-blue sidebar-font-option-4 text-white px-4 py-2 rounded"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '0.2px'
          }}
        >
          Ver Todos ({habboAltCodes.length})
        </Button>
      </div>

      {/* Modal com todos os Alt Codes */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="volter-font text-xl text-center">
              {selectedAltCode ? `${selectedAltCode.character} - ${selectedAltCode.description}` : 'Todos os Alt Codes'}
            </DialogTitle>
            
            {/* Orientações completas */}
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <h4 className="volter-font font-semibold text-blue-900 mb-3 text-center">Como Usar os Alt Codes</h4>
              <div className="volter-font text-sm text-blue-800 space-y-2">
                <p><strong>Os Alt Codes funcionam quando o 'Num Lock' está ativado (laptop) ou usando o teclado numérico (na maioria dos computadores, e até mesmo em alguns teclados de laptop).</strong></p>
                
                <p><strong>Para usar estes alt codes, você deve:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Mantenha pressionada a tecla <strong>Alt</strong> (Alt + Fn para alguns laptops)</li>
                  <li>Digite os números correspondentes no teclado numérico (para alguns laptops você tem que usar as teclas 7-8-9, u-i-o, j-k-l e m)</li>
                  <li>Solte a tecla Alt</li>
                </ul>
                
                <p><strong>Usuários que não têm teclado numérico no teclado também podem usar o Teclado Virtual.</strong></p>
                <p>Para usar isso pressione a tecla Windows e digite "osk" e pressione Enter. Em seguida, ative o teclado numérico nas opções e siga as instruções acima.</p>
                
                <p><strong>Alternativamente ao uso de Alt codes, você pode copiar os caracteres correspondentes desta página e colá-los no Habbo.</strong></p>
                <p>Este método é especialmente útil para pessoas que não usam um computador Windows.</p>
              </div>
            </div>
          </DialogHeader>
          
          {selectedAltCode ? (
            // Modal de um Alt Code específico
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="volter-font text-lg font-bold">{selectedAltCode.character}</span>
                      <div className="relative">
                        <img 
                          src={selectedAltCode.imageUrl} 
                          alt={selectedAltCode.character}
                          className="mx-auto"
                          style={{
                            width: '32px',
                            height: '32px',
                            imageRendering: 'pixelated'
                          }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="volter-font text-xs text-gray-600 leading-tight">
                      <div><span className="font-semibold">Alt:</span> {selectedAltCode.code}</div>
                      <div><span className="font-semibold">Unicode:</span> {selectedAltCode.unicode}</div>
                      <div><span className="font-semibold">Descrição:</span> {selectedAltCode.description}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => copyToClipboard(selectedAltCode.character, 'character')}
                  className="sidebar-font-option-4"
                  variant={copiedCode === 'character' ? 'default' : 'outline'}
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    letterSpacing: '0.2px'
                  }}
                >
                  {copiedCode === 'character' ? '✓ Copiado!' : 'Copiar Caractere'}
                </Button>
                <Button
                  onClick={() => copyToClipboard(selectedAltCode.code, 'code')}
                  className="sidebar-font-option-4"
                  variant={copiedCode === 'code' ? 'default' : 'outline'}
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    letterSpacing: '0.2px'
                  }}
                >
                  {copiedCode === 'code' ? '✓ Copiado!' : 'Copiar Código'}
                </Button>
              </div>
            </div>
          ) : (
            // Modal com todos os Alt Codes
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {habboAltCodes.map((altCode, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded p-3 hover:bg-gray-100 transition-colors cursor-pointer relative"
                    onClick={() => copyToClipboard(altCode.character, `modal-${index}`)}
                    title={`${altCode.character} - ${altCode.description} - Clique para copiar`}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>{altCode.character}</span>
                        <img 
                          src={altCode.imageUrl} 
                          alt={altCode.character}
                          style={{
                            width: '20px',
                            height: '20px',
                            imageRendering: 'pixelated'
                          }}
                          loading="lazy"
                        />
                      </div>
                      <div className="volter-font text-xs text-gray-600">
                        <div><strong>{altCode.code}</strong></div>
                        <div className="text-center">{altCode.description}</div>
                      </div>
                    </div>
                    {copiedCode === `modal-${index}` && (
                      <div className="absolute inset-0 bg-green-100 bg-opacity-90 flex items-center justify-center rounded">
                        <span className="volter-font text-xs text-green-800 font-bold">✓ Copiado!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notificação */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        duration={3000}
      />
    </div>
  );
};

export default AltCodesCompact;