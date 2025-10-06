// Componente para verificação de usuário do Habbo
import React, { useState, useCallback } from 'react';
import { unifiedHabboApiService } from '@/services/unifiedHabboApiService';
import { HotelSelector, useHotelSelection } from './HotelSelector';

interface UserVerificationProps {
  onVerificationSuccess: (userData: any) => void;
  onVerificationError: (error: string) => void;
  className?: string;
}

export const UserVerification: React.FC<UserVerificationProps> = ({
  onVerificationSuccess,
  onVerificationError,
  className = ''
}) => {
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'username' | 'code' | 'success'>('username');
  
  const { selectedHotel, changeHotel, isValidHotel, getHotelInfo } = useHotelSelection('br');
  
  // Gerar código de verificação
  const generateVerificationCode = useCallback(() => {
    const code = `HUB-VERIFY-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setVerificationCode(code);
    return code;
  }, []);
  
  // Verificar se usuário existe no Habbo
  const verifyUserExists = useCallback(async () => {
    if (!username.trim()) {
      onVerificationError('Por favor, insira um nome de usuário');
      return;
    }
    
    if (!isValidHotel) {
      onVerificationError('Hotel selecionado não é suportado');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const userData = await unifiedHabboApiService.getUserByName(username, selectedHotel);
      
      if (userData) {
        // Usuário encontrado, gerar código de verificação
        const code = generateVerificationCode();
        setVerificationStep('code');
        console.log(`✅ Usuário encontrado: ${userData.name} (${userData.uniqueId})`);} else {
        onVerificationError('Usuário não encontrado no Habbo. Verifique o nome e hotel selecionado.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar usuário';
      onVerificationError(`Erro: ${errorMessage}`);
    } finally {
      setIsVerifying(false);
    }
  }, [username, selectedHotel, isValidHotel, onVerificationError, generateVerificationCode]);
  
  // Verificar código na motto
  const verifyCodeInMotto = useCallback(async () => {
    if (!verificationCode) {
      onVerificationError('Código de verificação não gerado');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Buscar usuário novamente para verificar se a motto foi atualizada
      const userData = await unifiedHabboApiService.getUserByName(username, selectedHotel);
      
      if (userData && userData.motto.includes(verificationCode)) {
        // Código encontrado na motto - verificação bem-sucedida
        setVerificationStep('success');
        onVerificationSuccess({
          ...userData,
          hotel: selectedHotel,
          verificationCode,
          verifiedAt: new Date().toISOString()
        });} else {
        onVerificationError('Código não encontrado na motto. Certifique-se de que você colocou o código exato na sua motto e aguarde alguns segundos.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar código';
      onVerificationError(`Erro: ${errorMessage}`);
    } finally {
      setIsVerifying(false);
    }
  }, [username, selectedHotel, verificationCode, onVerificationSuccess, onVerificationError]);
  
  // Reiniciar processo
  const resetVerification = useCallback(() => {
    setUsername('');
    setVerificationCode('');
    setVerificationStep('username');
    setIsVerifying(false);
  }, []);
  
  return (
    <div className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Verificação de Usuário Habbo
      </h2>
      
      {verificationStep === 'username' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Hotel
            </label>
            <HotelSelector
              selectedHotel={selectedHotel}
              onHotelChange={changeHotel}
              disabled={isVerifying}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário do Habbo"
              disabled={isVerifying}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <button
            onClick={verifyUserExists}
            disabled={isVerifying || !username.trim() || !isValidHotel}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? 'Verificando...' : 'Verificar Usuário'}
          </button>
        </div>
      )}
      
      {verificationStep === 'code' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Usuário Encontrado! ✅
            </h3>
            <p className="text-sm text-green-700">
              Agora você precisa colocar o código abaixo na sua motto no Habbo:
            </p>
            <div className="mt-3 p-3 bg-green-100 rounded-md">
              <code className="text-lg font-mono font-bold text-green-800">
                {verificationCode}
              </code>
            </div>
            <p className="text-xs text-green-600 mt-2">
              Copie o código acima, cole na sua motto no Habbo e clique em "Verificar Código"
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={verifyCodeInMotto}
              disabled={isVerifying}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? 'Verificando...' : 'Verificar Código'}
            </button>
            <button
              onClick={resetVerification}
              disabled={isVerifying}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
      
      {verificationStep === 'success' && (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-xl font-bold text-green-800">
            Verificação Bem-sucedida!
          </h3>
          <p className="text-gray-600">
            Sua conta foi verificada com sucesso. Agora você pode criar sua senha e acessar o sistema.
          </p>
          <button
            onClick={resetVerification}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Verificar Outro Usuário
          </button>
        </div>
      )}
    </div>
  );
};

