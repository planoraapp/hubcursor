import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { HOTEL_COUNTRIES, hotelCodeToDomain, getHotelFlag } from '@/utils/hotelHelpers';
import { cn } from '@/lib/utils';

interface CompactLoginFormProps {
  onLoginSuccess?: () => void;
  className?: string;
}

export const CompactLoginForm: React.FC<CompactLoginFormProps> = ({ 
  onLoginSuccess,
  className = '' 
}) => {
  const { t } = useI18n();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<string>('br');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de fluxo
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'motto' | null>(null);
  const [mottoStep, setMottoStep] = useState<'generate' | 'verify' | 'password' | 'complete'>('generate');
  
  // Estados de loading
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Verificar se usuário já tem conta quando nome é digitado
  useEffect(() => {
    const checkAccount = async () => {
      if (!username.trim() || checkingAccount) return;
      
      setCheckingAccount(true);
      setHasAccount(null);
      setLoginMode(null);
      setMottoStep('generate');
      setPassword('');
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');

      try {
        const { data: existingAccounts } = await supabase
          .from('habbo_accounts')
          .select('*')
          .ilike('habbo_name', username.trim())
          .eq('hotel', selectedHotel)
          .limit(1);

        if (existingAccounts && existingAccounts.length > 0) {
          setHasAccount(true);
          setLoginMode('password');
        } else {
          setHasAccount(false);
          setLoginMode(null);
        }
      } catch (error) {
        console.error('Erro ao verificar conta:', error);
        setHasAccount(null);
      } finally {
        setCheckingAccount(false);
      }
    };

    const timeoutId = setTimeout(checkAccount, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [username, selectedHotel]);

  // Gerar código de verificação
  const generateVerificationCode = () => {
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    const code = `HUB-${randomNum}`;
    setVerificationCode(code);
    setMottoStep('verify');
    return code;
  };

  // Login com senha
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(username.trim(), password, selectedHotel);
      if (success) {
        toast.success(`Bem-vindo de volta, ${username}!`);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro no login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Verificar motto
  const handleVerifyMotto = async () => {
    if (!username.trim() || !verificationCode.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsVerifying(true);
    
    try {
      const hotelDomain = hotelCodeToDomain(selectedHotel);
      const habboApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
      
      const habboResponse = await fetch(habboApiUrl);
      
      if (!habboResponse.ok) {
        throw new Error('Usuário não encontrado no Habbo Hotel');
      }

      const habboData = await habboResponse.json();
      
      if (!habboData.motto || !habboData.motto.includes(verificationCode)) {
        throw new Error(`Código ${verificationCode} não encontrado na sua motto. Verifique se você copiou corretamente.`);
      }

      // Verificar se usuário já existe
      const { data: existingAccounts } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', username.trim())
        .eq('hotel', selectedHotel)
        .limit(1);
      
      const existingAccount = existingAccounts?.[0];

      if (existingAccount) {
        setMottoStep('password');
        toast.success('Usuário encontrado! Digite uma nova senha para resetar sua conta.');
      } else {
        setMottoStep('password');
        toast.success('Verificação bem-sucedida! Agora crie uma senha para sua conta.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro na verificação');
    } finally {
      setIsVerifying(false);
    }
  };

  // Criar/resetar conta
  const handleCreateOrResetAccount = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsCreatingAccount(true);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('habbo-complete-auth', {
        body: {
          action: 'register',
          habbo_name: username.trim(),
          verification_code: verificationCode.trim(),
          password: newPassword,
          hotel: selectedHotel
        }
      });

      if (functionError || data?.error) {
        throw new Error(data?.error || functionError.message || 'Erro na criação da conta');
      }

      if (data?.success) {
        setMottoStep('complete');
        toast.success(data.message || 'Conta criada com sucesso!');
        
        // Auto-login
        setTimeout(async () => {
          const loginSuccess = await login(username.trim(), newPassword, selectedHotel);
          if (loginSuccess && onLoginSuccess) {
            onLoginSuccess();
          }
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro na criação da conta');
    } finally {
      setIsCreatingAccount(false);
    }
  };


  // Mapeamento de códigos para siglas
  const getCountryCode = (code: string): string => {
    const codeMap: { [key: string]: string } = {
      'br': 'PTBR',
      'com': 'COM',
      'de': 'DE',
      'fr': 'FR',
      'it': 'IT',
      'es': 'ES',
      'nl': 'NL',
      'tr': 'TR',
      'fi': 'FI'
    };
    return codeMap[code] || code.toUpperCase();
  };

  const selectedCountryData = HOTEL_COUNTRIES.find(c => c.code === selectedHotel);

  return (
    <div className={cn("w-full max-w-md mx-auto space-y-4", className)}>
      {/* Campo de nome Habbo com dropdown de país */}
      <div className="relative">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Nome Habbo
        </label>
        <div 
          className={cn(
            "relative flex items-center bg-white/10 border border-white/20 rounded-lg transition-all",
            showCountryDropdown ? "border-white/40 rounded-b-none" : "focus-within:border-white/40"
          )}
          ref={dropdownRef}
        >
          <input
            type="text"
            placeholder="Digite seu nome Habbo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/50 px-3 py-2 focus:outline-none text-sm"
            disabled={checkingAccount || isLoggingIn}
          />
          {/* Dropdown de país */}
          <div className="relative border-l border-white/20">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="px-3 py-2 flex items-center justify-center h-full hover:bg-white/10 transition-colors"
              disabled={checkingAccount || isLoggingIn}
            >
              {selectedCountryData ? (
                <img
                  src={selectedCountryData.flag}
                  alt={selectedCountryData.name}
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <img
                  src="/assets/console/hotelfilter.png"
                  alt="Filtro"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
            </button>
          </div>

           {/* Dropdown menu - expande por toda a largura do campo */}
           {showCountryDropdown && (
             <div 
               className="absolute top-full left-0 right-0 border-x border-b border-white/40 rounded-b-lg z-50 bg-white/10 backdrop-blur-sm"
             >
               <div className="p-2 grid grid-cols-3 gap-2">
                {HOTEL_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedHotel(country.code);
                      setShowCountryDropdown(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors text-sm",
                      selectedHotel === country.code ? 'bg-white/10' : ''
                    )}
                  >
                    <img
                      src={country.flag}
                      alt={country.name}
                      className="flex-shrink-0"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className="text-white text-xs font-medium">{getCountryCode(country.code)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {checkingAccount && (
          <p className="text-xs text-white/60 mt-1">Verificando conta...</p>
        )}
      </div>

      {/* Login com senha (se já tem conta) */}
      {hasAccount && loginMode === 'password' && mottoStep !== 'complete' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 px-3 py-2 pr-10 focus:outline-none focus:border-white/40 text-sm"
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || !password.trim()}
              className="flex-1 text-black font-semibold"
              style={{ backgroundColor: '#FDCC00' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#FEE100')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDCC00'}
            >
              {isLoggingIn ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLoginMode('motto');
                generateVerificationCode();
                setPassword('');
              }}
              disabled={isLoggingIn}
              className="border-white/20 text-black hover:bg-[#FDCC00] hover:border-[#FDCC00] transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#FDCC00')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Resetar Senha
            </Button>
          </div>
        </div>
      )}

      {/* Verificação por motto (se não tem conta ou reset) */}
      {loginMode === 'motto' && mottoStep === 'verify' && (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/20 rounded-lg p-3">
            <p className="text-sm text-white/80 mb-2 font-semibold">
              Código para sua motto:
            </p>
            <div className="flex items-center gap-2">
              <input
                value={verificationCode}
                readOnly
                className="flex-1 bg-white/10 border border-yellow-400/50 text-white text-center px-3 py-2 rounded text-sm font-mono"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(verificationCode);
                    toast.success('Código copiado!');
                  } catch (err) {
                    toast.error('Erro ao copiar código');
                  }
                }}
                className="px-3 py-2 text-black rounded transition-colors"
                style={{ backgroundColor: '#FDCC00' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE100'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDCC00'}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/60 mt-2">
              Cole este código em sua motto no Habbo e clique em "Verificar"
            </p>
          </div>

          <Button
            onClick={handleVerifyMotto}
            disabled={isVerifying}
            className="w-full text-black font-semibold"
            style={{ backgroundColor: '#FDCC00' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE100'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDCC00'}
          >
            {isVerifying ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Verificando...
              </>
            ) : (
              'Verificar Habbo'
            )}
          </Button>
        </div>
      )}

      {/* Campos de senha para criação/reset */}
      {mottoStep === 'password' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Nova Senha (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:border-white/40 text-sm"
              disabled={isCreatingAccount}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateOrResetAccount();
                }
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:border-white/40 text-sm"
              disabled={isCreatingAccount}
            />
          </div>
          <Button
            onClick={handleCreateOrResetAccount}
            disabled={isCreatingAccount || !newPassword.trim() || !confirmPassword.trim()}
            className="w-full text-black font-semibold"
            style={{ backgroundColor: '#FDCC00' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#FEE100')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDCC00'}
          >
            {isCreatingAccount ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Criando conta...
              </>
            ) : (
              hasAccount ? 'Resetar Senha' : 'Criar Conta'
            )}
          </Button>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {mottoStep === 'complete' && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <p className="text-green-400 text-center font-semibold">
            ✅ Conta criada com sucesso!
          </p>
        </div>
      )}

      {/* Iniciar verificação por motto (se não tem conta e não está em modo motto) */}
      {!hasAccount && loginMode !== 'motto' && username.trim() && mottoStep === 'generate' && (
        <Button
          onClick={() => {
            setLoginMode('motto');
            generateVerificationCode();
          }}
          className="w-full text-black font-semibold"
          style={{ backgroundColor: '#FDCC00' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE100'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDCC00'}
        >
          Criar Conta (Verificação por Motto)
        </Button>
      )}
    </div>
  );
};
