import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ConsoleDebug: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      isLoggedIn,
      hasHabboAccount: !!habboAccount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }, [isLoggedIn, habboAccount]);

  return (
    <div className="p-4 bg-black/50 text-white text-xs">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default ConsoleDebug;
