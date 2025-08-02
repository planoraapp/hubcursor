
import { useState, useCallback, useEffect } from 'react';
import { AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValidatedBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
}

const ValidatedBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md',
  showFallback = true
}: ValidatedBadgeImageProps) => {
  const [badgeData, setBadgeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const validateBadge = useCallback(async (badgeCode: string) => {
    console.log(`🔍 [ValidatedBadgeImage] Validating badge: ${badgeCode}`);
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('habbo-badges-validator', {
        body: { badgeCode, validateImage: true }
      });

      if (error) {
        console.error(`❌ [ValidatedBadgeImage] Validation error for ${badgeCode}:`, error);
        throw error;
      }

      if (data?.success && data?.badge) {
        console.log(`✅ [ValidatedBadgeImage] Badge ${badgeCode} validated successfully`);
        setBadgeData(data.badge);
        setHasError(false);
      } else {
        console.log(`❌ [ValidatedBadgeImage] Badge ${badgeCode} not found`);
        setHasError(true);
        setBadgeData(null);
      }
    } catch (error) {
      console.error(`❌ [ValidatedBadgeImage] Error validating ${badgeCode}:`, error);
      setHasError(true);
      setBadgeData(null);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    if (code) {
      setIsLoading(true);
      setHasError(false);
      setBadgeData(null);
      validateBadge(code);
    }
  }, [code, validateBadge]);

  if (isLoading || isValidating) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-blue-50 border-2 border-blue-200 rounded animate-pulse`}>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
      </div>
    );
  }

  if (hasError || !badgeData) {
    if (!showFallback) return null;
    
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-red-50 border-2 border-red-200 rounded`}>
        <div className="text-center">
          <AlertCircle className="w-3 h-3 text-red-500 mx-auto mb-1" />
          <span className="text-xs font-bold text-red-600 leading-none">
            {code.slice(0, 3)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded overflow-hidden`}>
      {/* Indicador de badge validado */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
        <CheckCircle className="w-2 h-2 text-white" />
      </div>
      
      <img
        src={badgeData.image_url}
        alt={name || badgeData.badge_name || `Badge ${code}`}
        title={`${code} - ${badgeData.badge_name} (Validado: ${badgeData.source})`}
        className="w-full h-full object-contain transition-opacity duration-300"
        style={{ imageRendering: 'pixelated' }}
        loading="lazy"
        decoding="async"
      />
      
      {/* Indicador de fonte */}
      <div className="absolute -bottom-1 -left-1 text-xs bg-black bg-opacity-75 text-white px-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
        {badgeData.source}
      </div>
    </div>
  );
};

export default ValidatedBadgeImage;
