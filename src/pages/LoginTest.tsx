import React from 'react';

export const LoginTest: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>
        🚨 TESTE DE LOGIN - PÁGINA FUNCIONANDO
      </h1>
      <p style={{ fontSize: '18px', color: '#333' }}>
        Se você está vendo esta página, o roteamento está funcionando.
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: 'white', 
        border: '2px solid #007bff',
        borderRadius: '8px'
      }}>
        <p><strong>Usuário:</strong> habbohub</p>
        <p><strong>Senha:</strong> 151092</p>
      </div>
    </div>
  );
};

export default LoginTest;
