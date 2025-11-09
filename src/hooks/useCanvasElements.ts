import { useState, useCallback } from 'react';

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  image: HTMLImageElement;
  width: number;
  height: number;
  crop?: { x: number; y: number; width: number; height: number };
  filters?: {
    brightness: number;
    contrast: number;
    blur: number;
    grayscale: boolean;
    sepia: boolean;
    saturation: number;
  };
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface EmojiElement extends BaseElement {
  type: 'emoji';
  emoji: string;
  fontSize: number;
}

export type CanvasElement = ImageElement | TextElement | EmojiElement;

export const useCanvasElements = () => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addImage = useCallback((image: HTMLImageElement) => {
    const id = `img-${Date.now()}`;
    const newImage: ImageElement = {
      id,
      type: 'image',
      image,
      x: 50,
      y: 50,
      width: image.width,
      height: image.height,
      rotation: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      zIndex: elements.length,
      filters: {
        brightness: 100,
        contrast: 100,
        blur: 0,
        grayscale: false,
        sepia: false,
        saturation: 100,
      },
    };
    setElements((prev) => [...prev, newImage]);
    setSelectedId(id);
  }, [elements.length]);

  const addText = useCallback((text: string) => {
    const id = `text-${Date.now()}`;
    const newText: TextElement = {
      id,
      type: 'text',
      text,
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: elements.length,
    };
    setElements((prev) => [...prev, newText]);
    setSelectedId(id);
  }, [elements.length]);

  const addEmoji = useCallback((emoji: string) => {
    const id = `emoji-${Date.now()}`;
    const newEmoji: EmojiElement = {
      id,
      type: 'emoji',
      emoji,
      x: 150,
      y: 150,
      fontSize: 48,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: elements.length,
    };
    setElements((prev) => [...prev, newEmoji]);
    setSelectedId(id);
  }, [elements.length]);

  const updateElement = useCallback((id: string, updates: Partial<Omit<CanvasElement, 'type'>>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } as CanvasElement : el))
    );
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId(null);
  }, []);

  const moveElement = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setElements((prev) => {
      const index = prev.findIndex((el) => el.id === id);
      if (index === -1) return prev;

      const newElements = [...prev];
      const [element] = newElements.splice(index, 1);

      switch (direction) {
        case 'up':
          newElements.splice(Math.min(index + 1, newElements.length), 0, element);
          break;
        case 'down':
          newElements.splice(Math.max(index - 1, 0), 0, element);
          break;
        case 'top':
          newElements.push(element);
          break;
        case 'bottom':
          newElements.unshift(element);
          break;
      }

      return newElements.map((el, idx) => ({ ...el, zIndex: idx }));
    });
  }, []);

  const clearAll = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, []);

  return {
    elements,
    selectedId,
    setSelectedId,
    addImage,
    addText,
    addEmoji,
    updateElement,
    deleteElement,
    moveElement,
    clearAll,
  };
};
