import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, ExternalLink } from 'lucide-react';

export const OpenConsolePopupButton: React.FC = () => {
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      switch (event.data.type) {
        case 'CONSOLE_POPUP_OPENED':
          setIsPopupOpen(true);
          break;
        case 'CONSOLE_POPUP_CLOSED':
          setIsPopupOpen(false);
          setPopupWindow(null);
          break;
        case 'AUTH_STATE_CHANGE':
          // Sync auth state between windows if needed
          console.log('Auth state changed in popup:', event.data.isLoggedIn);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Check if popup is still open on mount
    const checkPopup = () => {
      if (popupWindow && popupWindow.closed) {
        setIsPopupOpen(false);
        setPopupWindow(null);
      }
    };
    
    const intervalId = setInterval(checkPopup, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(intervalId);
    };
  }, [popupWindow]);

  const openPopup = () => {
    if (isPopupOpen && popupWindow) {
      // Focus existing popup
      popupWindow.focus();
      return;
    }

    const popup = window.open(
      '/console-popup',
      'HabboHubConsole',
      'width=420,height=650,scrollbars=no,resizable=yes,status=no,directories=no,toolbar=no,menubar=no'
    );

    if (popup) {
      setPopupWindow(popup);
      popup.focus();
    }
  };

  return (
    <Button
      onClick={openPopup}
      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold volter-font"
      size="lg"
    >
      <Monitor className="w-5 h-5 mr-2" />
      {isPopupOpen ? 'Focar Console' : 'Abrir Console'}
      <ExternalLink className="w-4 h-4 ml-2" />
    </Button>
  );
};