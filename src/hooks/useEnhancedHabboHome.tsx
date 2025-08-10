
import { useState } from 'react';

export const useEnhancedHabboHome = (username?: string, hotel?: string) => {
  const [loading, setLoading] = useState(false);
  const [habboData, setHabboData] = useState<any>(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [background, setBackground] = useState<any>({ background_type: 'color', background_value: '#c7d2dc' });
  const [guestbook, setGuestbook] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  const addWidget = () => {
    console.log('Adding widget...');
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  const updateWidget = (id: string, updates: any) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  };

  const moveWidget = (id: string, position: { x: number; y: number }) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, position } : widget
    ));
  };

  const updateWidgetPosition = (id: string, x: number, y: number) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, x, y } : widget
    ));
  };

  const addSticker = () => {
    console.log('Adding sticker...');
  };

  const removeSticker = (id: string) => {
    setStickers(prev => prev.filter(sticker => sticker.id !== id));
  };

  const updateSticker = (id: string, updates: any) => {
    setStickers(prev => prev.map(sticker => 
      sticker.id === id ? { ...sticker, ...updates } : sticker
    ));
  };

  const handleStickerMove = () => {
    console.log('Handling sticker move...');
  };

  const handleStickerDrop = (stickerId: string, position?: { x: number; y: number }) => {
    const newSticker = {
      id: Date.now().toString(),
      sticker_id: stickerId,
      sticker_src: 'https://via.placeholder.com/64',
      category: 'test',
      x: position?.x || 100,
      y: position?.y || 100,
      z_index: 1,
      scale: 1,
      rotation: 0
    };
    setStickers(prev => [...prev, newSticker]);
  };

  const handleStickerPositionChange = (stickerId: string, x: number, y: number) => {
    setStickers(prev => prev.map(sticker => 
      sticker.id === stickerId ? { ...sticker, x, y } : sticker
    ));
  };

  const handleBackgroundChange = (background: { type: 'repeat' | 'color' | 'cover'; value: string }) => {
    setBackground({
      background_type: background.type,
      background_value: background.value
    });
  };

  const addGuestbookEntry = async (message: string) => {
    console.log('Adding guestbook entry:', message);
    const newEntry = {
      id: Date.now().toString(),
      message,
      author: 'Current User',
      timestamp: new Date().toISOString()
    };
    setGuestbook(prev => [newEntry, ...prev]);
  };

  const removeGuestbookEntry = (id: string) => {
    setGuestbook(prev => prev.filter(entry => entry.id !== id));
  };

  const loadHabboData = () => {
    setLoading(true);
    setTimeout(() => {
      setHabboData({
        name: username || 'Test User',
        motto: 'Welcome to my home!',
        figureString: 'hd-180-1.ch-255-66.lg-270-82.sh-305-62',
        hotel: hotel || 'com',
        online: true,
        memberSince: '2024-01-01',
        selectedBadges: []
      });
      setLoading(false);
    }, 1000);
  };

  const saveChanges = () => {
    console.log('Saving changes...');
  };

  const handleSaveLayout = () => {
    console.log('Saving layout...');
  };

  const resetChanges = () => {
    setWidgets([]);
    setStickers([]);
    setBackground({ background_type: 'color', background_value: '#c7d2dc' });
    setGuestbook([]);
  };

  return {
    loading,
    setLoading,
    habboData,
    widgets,
    stickers,
    setStickers,
    background,
    guestbook,
    error,
    isEditMode,
    setIsEditMode,
    isOwner,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    updateWidgetPosition,
    addSticker,
    removeSticker,
    updateSticker,
    handleStickerMove,
    handleStickerDrop,
    handleStickerPositionChange,
    handleBackgroundChange,
    addGuestbookEntry,
    removeGuestbookEntry,
    loadHabboData,
    saveChanges,
    handleSaveLayout,
    resetChanges
  };
};
