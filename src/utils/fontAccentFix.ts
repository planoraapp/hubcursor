/**
 * Utilitário para corrigir automaticamente caracteres acentuados problemáticos
 * na fonte Volter Goldfish, substituindo apenas os caracteres que não renderizam bem
 */

// Caracteres problemáticos e suas versões corrigidas
const ACCENT_REPLACEMENTS: Record<string, string> = {
  'Í': '<span style="font-family: \'Ubuntu Condensed\', Arial, sans-serif;">Í</span>',
  'í': '<span style="font-family: \'Ubuntu Condensed\', Arial, sans-serif;">í</span>',
  'Ç': '<span style="font-family: \'Ubuntu Condensed\', Arial, sans-serif;">Ç</span>',
  'ã': '<span style="font-family: \'Ubuntu Condensed\', Arial, sans-serif;">ã</span>',
  'Ã': '<span style="font-family: \'Ubuntu Condensed\', Arial, sans-serif;">Ã</span>',
  'õ': '<span style="font-family: \'Ubuntu Condensed\', Arial, sans-serif;">õ</span>',
  'Õ': '<span style="font-family: \'Ubuntu Condensed\', Arial, sans-serif;">Õ</span>',
};

/**
 * Corrige caracteres acentuados problemáticos em um texto
 * @param text - Texto original
 * @returns Texto com caracteres problemáticos substituídos por versões corrigidas
 */
export function fixAccentedCharacters(text: string): string {
  let fixedText = text;
  
  // Substitui cada caractere problemático
  Object.entries(ACCENT_REPLACEMENTS).forEach(([char, replacement]) => {
    fixedText = fixedText.replace(new RegExp(char, 'g'), replacement);
  });
  
  return fixedText;
}

/**
 * Corrige automaticamente todos os elementos com classe volter-body-text na página
 */
export function fixAccentedCharactersInDOM(): void {
  const elements = document.querySelectorAll('.volter-body-text');
  
  elements.forEach((element) => {
    if (element.textContent) {
      const originalText = element.textContent;
      const fixedText = fixAccentedCharacters(originalText);
      
      // Só atualiza se houve mudanças
      if (fixedText !== originalText) {
        element.innerHTML = fixedText;
      }
    }
  });
}

/**
 * Hook React para corrigir caracteres acentuados automaticamente
 */
export function useAccentFix(text: string): string {
  return fixAccentedCharacters(text);
}

/**
 * Componente React que aplica correção automática de acentos
 */
export function AccentFixedText({ children, className = '' }: { children: string; className?: string }) {
  const fixedText = fixAccentedCharacters(children);
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: fixedText }}
    />
  );
}
