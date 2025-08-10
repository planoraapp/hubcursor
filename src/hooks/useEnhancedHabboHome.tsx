
import { useState } from 'react';

export const useEnhancedHabboHome = () => {
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  return {
    loading,
    setLoading,
    habboData: null,
    widgets: [],
    stickers: [],
    background: null,
    guestbook: [],
    error: null,
    addWidget: () => {},
    removeWidget: () => {},
    updateWidgetPosition: () => {},
    handleSaveLayout: () => Promise.resolve(),
    isEditMode,
    setIsEditMode,
    isOwner: false,
    addGuestbookEntry: async (message: string) => {},
    setStickers: () => {},
    handleStickerAdd: (stickerId: string) => {},
    handleStickerRemove: (stickerId: string) => {},
    handleStickerMove: () => {},
    handleStickerDrop: () => {},
    handleStickerPositionChange: () => {},
    handleBackgroundChange: (backgroundId: string) => {},
  };
};
