
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
    handleSaveLayout: () => {},
    isEditMode,
    setIsEditMode,
    isOwner: false,
    addGuestbookEntry: () => {},
    setStickers: () => {},
    handleStickerAdd: () => {},
    handleStickerRemove: () => {},
    handleStickerMove: () => {},
  };
};
