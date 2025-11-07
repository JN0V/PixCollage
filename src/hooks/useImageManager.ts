import { useState, useCallback } from 'react';
import type { ImageElement } from '../types/image';

export function useImageManager() {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadImages = useCallback(async (files: File[]) => {
    const newImages: ImageElement[] = [];
    
    for (const file of files) {
      const image = new Image();
      const url = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      
      const aspectRatio = image.width / image.height;
      const displayHeight = 400;
      const displayWidth = displayHeight * aspectRatio;
      
      const newImage: ImageElement = {
        id: Math.random().toString(36).substr(2, 9),
        image,
        x: Math.random() * 200,
        y: Math.random() * 200,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        zIndex: images.length + newImages.length,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          grayscale: false,
          sepia: false
        }
      };
      
      newImages.push(newImage);
    }
    
    setImages(prev => [...prev, ...newImages]);
    setSelectedId(newImages[newImages.length - 1]?.id || null);
  }, [images.length]);

  const deleteImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const updateImage = useCallback((id: string, updates: Partial<ImageElement>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, []);

  const handleTransform = useCallback((id: string, newAttrs: Partial<ImageElement>) => {
    updateImage(id, newAttrs);
  }, [updateImage]);

  const moveImageZIndex = useCallback((id: string, direction: 'front' | 'back' | 'top' | 'bottom') => {
    setImages(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex(img => img.id === id);
      
      if (index === -1) return prev;
      
      if (direction === 'front' && index < sorted.length - 1) {
        [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
      } else if (direction === 'back' && index > 0) {
        [sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]];
      } else if (direction === 'top') {
        const [item] = sorted.splice(index, 1);
        sorted.push(item);
      } else if (direction === 'bottom') {
        const [item] = sorted.splice(index, 1);
        sorted.unshift(item);
      }
      
      return sorted.map((img, i) => ({ ...img, zIndex: i }));
    });
  }, []);

  return {
    images,
    selectedId,
    setSelectedId,
    loadImages,
    deleteImage,
    updateImage,
    handleTransform,
    moveImageZIndex
  };
}
