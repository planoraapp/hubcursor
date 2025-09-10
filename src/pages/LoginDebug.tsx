import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const LoginDebug: React.FC = () => {
  const navigate = useNavigate();
  const { habboAccount, isLoggedIn, loading, loginWithPassword } = useUnifiedAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    setDebugInfo(`
      Loading: ${loading}
      IsLoggedIn: ${isLoggedIn}
      HabboAccount: ${habboAccount ? habboAccount.habbo_name : 'null'}
    `);
  }, [loading, isLoggedIn, habboAccount]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('🔐 [LOGIN DEBUG] Tentando login:', username);
      const result = await loginWithPassword(username, password);
      console.log('✅ [LOGIN DEBUG] Login result:', result);
    } catch (err: any) {
      console.error('❌ [LOGIN DEBUG] Login error:', err);
      setError(err.message || 'Erro no login');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>✅ Já está logado!</h2>
        <p>Usuário: {habboAccount?.habbo_name}</p>
        <button onClick={() => navigate('/console')}>
          Ir para Console
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '400px', 
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      marginTop: '50px'
    }}>
      <h2>🔐 Login Debug</h2>
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>Usuário:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="habbohub ou beebop"
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="151092 ou 290684"
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Entrar
        </button>
      </form>

      {error && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px'
        }}>
          ❌ {error}
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <h4>Debug Info:</h4>
        <pre>{debugInfo}</pre>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#f3e5f5', 
        borderRadius: '4px'
      }}>
        <h4>Credenciais de Teste:</h4>
        <p><strong>habbohub</strong> / 151092</p>
        <p><strong>beebop</strong> / 290684</p>
      </div>
    </div>
  );
};

export default LoginDebug;
