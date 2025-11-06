import React from 'react';
import { useI18n } from '@/contexts/I18nContext';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="mt-12 mb-8 text-center">
      <p className="text-gray-700 text-xs volter-body-text max-w-4xl mx-auto px-4">
        {t('footer.disclaimer')}
      </p>
    </footer>
  );
};

