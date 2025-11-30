import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { CanvasElement, TextElement, EmojiElement } from '../types/canvas';

interface UseTextEmojiProps {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  canvasSize: { width: number; height: number };
}

export const useTextEmoji = ({
  elements,
  setElements,
  setSelectedId,
  canvasSize,
}: UseTextEmojiProps) => {
  const { t } = useTranslation();

  // Add text element
  const addText = useCallback(() => {
    const baseZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;
    const newText: TextElement = {
      type: 'text',
      id: Math.random().toString(36).substr(2, 9),
      text: t('canvas.newText'),
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 40,
      fontSize: 64,
      fontFamily: 'Arial',
      fill: '#6b7280',
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: baseZ + 1,
    };
    setElements(prev => [...prev, newText]);
    setSelectedId(newText.id);
  }, [elements, canvasSize, setElements, setSelectedId, t]);

  // Add emoji element
  const addEmoji = useCallback((emoji: string) => {
    const baseZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;
    const newEmoji: EmojiElement = {
      type: 'emoji',
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: canvasSize.width / 2 - 60,
      y: canvasSize.height / 2 - 60,
      fontSize: 96,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: baseZ + 1,
    };
    setElements(prev => [...prev, newEmoji]);
    setSelectedId(newEmoji.id);
  }, [elements, canvasSize, setElements, setSelectedId]);

  return {
    addText,
    addEmoji,
  };
};
