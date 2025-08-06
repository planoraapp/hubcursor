
import { useHabboHome } from './useHabboHome';

// Hook de transição para manter compatibilidade
export const useHabboHomeMigration = (username: string) => {
  const oldHook = useHabboHome(username);
  
  // Adicionar funcionalidades de sticker vazias para compatibilidade
  const enhancedHook = {
    ...oldHook,
    addSticker: async () => {},
    updateStickerPosition: async () => {},
    removeSticker: async () => {},
    getWidgetSizeRestrictions: oldHook.getWidgetSizeRestrictions || (() => ({ 
      minWidth: 200, 
      maxWidth: 600, 
      minHeight: 150, 
      maxHeight: 400, 
      resizable: true 
    }))
  };

  return enhancedHook;
};
