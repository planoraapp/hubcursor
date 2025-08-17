
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DebugInfo {
  accountCount: number;
  hasDuplicates: boolean;
  authEmail: string | null;
}

export const useLoginDebug = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const debugLogin = async (habboName: string) => {
    try {
      console.log('🔍 [Debug] Checking account for:', habboName);
      
      // Check for accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('habbo_name', habboName)
        .eq('hotel', 'br');

      if (accountsError) {
        console.error('❌ [Debug] Error checking accounts:', accountsError);
        return;
      }

      const accountCount = accounts?.length || 0;
      const hasDuplicates = accountCount > 1;

      console.log('🔍 [Debug] Found accounts:', accountCount);
      console.log('🔍 [Debug] Has duplicates:', hasDuplicates);

      let authEmail = null;
      if (accountCount > 0) {
        // Try to get auth email
        const { data: emailResult, error: emailError } = await supabase.rpc(
          'get_auth_email_for_habbo_with_hotel', 
          { 
            habbo_name_param: habboName,
            hotel_param: 'br'
          }
        );

        if (!emailError && emailResult) {
          authEmail = emailResult;
          console.log('🔍 [Debug] Auth email found:', authEmail);
        }
      }

      setDebugInfo({
        accountCount,
        hasDuplicates,
        authEmail
      });

    } catch (error) {
      console.error('❌ [Debug] Error in debugLogin:', error);
    }
  };

  return { debugLogin, debugInfo };
};
