import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { CanvasElement, TextElement, EmojiElement } from '../types/canvas';

interface UseTextEmojiProps {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingTextValue: React.Dispatch<React.SetStateAction<string>>;
  canvasSize: { width: number; height: number };
}

export const useTextEmoji = ({
  elements,
  setElements,
  setSelectedId,
  setEditingTextId,
  setEditingTextValue,
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
      fill: '#6b7280', // Gray-500 - visible on both light and dark
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
      fontSize: 96, // Increased from 48 to 96 for better visibility in zoomed grid
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: baseZ + 1,
    };
    setElements(prev => [...prev, newEmoji]);
    setSelectedId(newEmoji.id);
  }, [elements, canvasSize, setElements, setSelectedId]);

  // Handle text double-click to edit
  const handleTextDoubleClick = useCallback((id: string, currentText: string) => {
    setEditingTextId(id);
    setEditingTextValue(currentText);
  }, [setEditingTextId, setEditingTextValue]);

  // Save edited text
  const saveTextEdit = useCallback((textId: string, newText: string) => {
    setElements(prev =>
      prev.map(el =>
        el.id === textId && el.type === 'text'
          ? { ...el, text: newText } as CanvasElement
          : el
      )
    );
    setEditingTextId(null);
    setEditingTextValue('');
  }, [setElements, setEditingTextId, setEditingTextValue]);

  // Cancel text editing
  const cancelTextEdit = useCallback(() => {
    setEditingTextId(null);
    setEditingTextValue('');
  }, [setEditingTextId, setEditingTextValue]);

  return {
    addText,
    addEmoji,
    handleTextDoubleClick,
    saveTextEdit,
    cancelTextEdit,
  };
};
