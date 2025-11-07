import { useState, useCallback } from 'react';
import type { ImageElement, TempCropData } from '../types/image';
import { initializeCropData, applyCropToImage, validateCropBounds } from '../utils/cropCalculations';

export function useCropManager(
  images: ImageElement[],
  selectedId: string | null,
  updateImage: (id: string, updates: Partial<ImageElement>) => void
) {
  const [isCropping, setIsCropping] = useState(false);
  const [tempCropData, setTempCropData] = useState<TempCropData | null>(null);

  const startCrop = useCallback(() => {
    if (!selectedId) return;
    
    const img = images.find(i => i.id === selectedId);
    if (!img) return;
    
    const initialCropData = initializeCropData(img);
    setTempCropData(initialCropData);
    setIsCropping(true);
  }, [selectedId, images]);

  const applyCrop = useCallback(() => {
    if (!selectedId || !tempCropData) return;
    
    const img = images.find(i => i.id === selectedId);
    if (!img) return;
    
    // Valider les limites du crop
    const validCropData = validateCropBounds(tempCropData, img);
    
    // Appliquer le crop
    const updates = applyCropToImage(img, validCropData);
    updateImage(selectedId, updates);
    
    // Nettoyer l'état
    setTempCropData(null);
    setIsCropping(false);
  }, [selectedId, tempCropData, images, updateImage]);

  const cancelCrop = useCallback(() => {
    setTempCropData(null);
    setIsCropping(false);
  }, []);

  const onCropChange = useCallback((data: TempCropData | null) => {
    setTempCropData(data);
  }, []);

  return {
    isCropping,
    tempCropData,
    startCrop,
    applyCrop,
    cancelCrop,
    onCropChange
  };
}
