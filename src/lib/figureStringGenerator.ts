
export const generateFigureString = (
  currentFigure: string,
  item: any,
  colorId: string
): string => {
  if (!item || !item.category) {
    return currentFigure;
  }

  const parts = currentFigure.split('.');
  const category = item.category;
  const figureId = item.figureId || item.id;
  
  // Find and replace existing part or add new one
  const newPart = `${category}-${figureId}-${colorId}`;
  const existingIndex = parts.findIndex(part => part.startsWith(`${category}-`));
  
  if (existingIndex !== -1) {
    parts[existingIndex] = newPart;
  } else {
    parts.push(newPart);
  }
  
  return parts.join('.');
};
