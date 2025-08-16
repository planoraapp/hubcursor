
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLoginDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkAccountDuplication = async (habboName: string) => {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', habboName);

      if (error) {
        console.error('Error checking account duplication:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in checkAccountDuplication:', error);
      return null;
    }
  };

  const checkAuthEmail = async (habboName: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'get_auth_email_for_habbo_with_hotel',
        { 
          habbo_name_param: habboName,
          hotel_param: 'br'
        }
      );

      if (error) {
        console.error('Error getting auth email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in checkAuthEmail:', error);
      return null;
    }
  };

  const debugLogin = async (habboName: string) => {
    const accounts = await checkAccountDuplication(habboName);
    const authEmail = await checkAuthEmail(habboName);
    
    const info = {
      habboName,
      accounts,
      authEmail,
      accountCount: accounts?.length || 0,
      hasDuplicates: (accounts?.length || 0) > 1
    };
    
    setDebugInfo(info);
    console.log('Login Debug Info:', info);
    return info;
  };

  return {
    debugInfo,
    debugLogin,
    checkAccountDuplication,
    checkAuthEmail
  };
};
