import { useCallback } from 'react';
import type { StickerElement, CanvasElement } from '../types/canvas';

interface UseStickersProps {
  canvasSize: { width: number; height: number };
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
}

export const useStickers = ({ canvasSize, elements, setElements }: UseStickersProps) => {
  const addSticker = useCallback((stickerId: string, category: 'stars' | 'sparkles' | 'hearts' | 'explosion') => {
    const maxZIndex = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;
    
    const defaultSize = 350; // Much bigger default size for grouped stickers
    
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      stickerId,
      category,
      size: defaultSize,
      x: canvasSize.width / 2 - defaultSize / 2, // Center
      y: canvasSize.height / 2 - defaultSize / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: maxZIndex + 1,
    };

    setElements(prev => [...prev, newSticker]);
  }, [canvasSize, elements, setElements]);

  return {
    addSticker,
  };
};
