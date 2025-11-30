import { useCallback } from 'react';
import type { CanvasElement, ImageElement, TempCropData } from '../types/canvas';

interface UseElementActionsProps {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsCropping: React.Dispatch<React.SetStateAction<boolean>>;
  tempCropData: TempCropData | null;
  setTempCropData: React.Dispatch<React.SetStateAction<TempCropData | null>>;
}

export const useElementActions = ({
  elements,
  setElements,
  selectedId,
  setSelectedId,
  setIsCropping,
  tempCropData,
  setTempCropData,
}: UseElementActionsProps) => {

  // Delete selected element
  const handleDelete = useCallback(() => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  }, [selectedId, elements, setElements, setSelectedId]);

  // Clear all elements
  const handleClear = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, [setElements, setSelectedId]);

  // Z-order: Bring to front
  const bringToFront = useCallback(() => {
    if (!selectedId) return;
    const maxZIndex = Math.max(...elements.map(el => el.zIndex));
    setElements(elements.map(el =>
      el.id === selectedId ? { ...el, zIndex: maxZIndex + 1 } : el
    ));
  }, [selectedId, elements, setElements]);

  // Z-order: Bring forward
  const bringForward = useCallback(() => {
    if (!selectedId) return;
    const selected = elements.find(el => el.id === selectedId);
    if (!selected) return;
    
    const higher = elements
      .filter(el => el.zIndex > selected.zIndex)
      .sort((a, b) => a.zIndex - b.zIndex);
    
    if (higher.length > 0) {
      const nextZIndex = higher[0].zIndex;
      setElements(elements.map(el => {
        if (el.id === selectedId) return { ...el, zIndex: nextZIndex };
        if (el.id === higher[0].id) return { ...el, zIndex: selected.zIndex };
        return el;
      }));
    }
  }, [selectedId, elements, setElements]);

  // Z-order: Send backward
  const sendBackward = useCallback(() => {
    if (!selectedId) return;
    const selected = elements.find(el => el.id === selectedId);
    if (!selected) return;
    
    const lower = elements
      .filter(el => el.zIndex < selected.zIndex)
      .sort((a, b) => b.zIndex - a.zIndex);
    
    if (lower.length > 0) {
      const prevZIndex = lower[0].zIndex;
      setElements(elements.map(el => {
        if (el.id === selectedId) return { ...el, zIndex: prevZIndex };
        if (el.id === lower[0].id) return { ...el, zIndex: selected.zIndex };
        return el;
      }));
    }
  }, [selectedId, elements, setElements]);

  // Z-order: Send to back
  const sendToBack = useCallback(() => {
    if (!selectedId) return;
    const minZIndex = Math.min(...elements.map(el => el.zIndex));
    setElements(elements.map(el =>
      el.id === selectedId ? { ...el, zIndex: minZIndex - 1 } : el
    ));
  }, [selectedId, elements, setElements]);

  // Crop: Start crop mode
  // tempCropData uses ABSOLUTE canvas coordinates (not relative to image)
  // If image is rotated, we temporarily reset rotation to 0 for crop mode
  const startCrop = useCallback(() => {
    const selectedImage = elements.find(el => el.id === selectedId && el.type === 'image') as ImageElement | undefined;
    if (!selectedImage) return;
    
    // If image is rotated, reset rotation to 0 for easier cropping
    // Store original rotation in tempCropData for potential restore
    if (selectedImage.rotation !== 0) {
      // Calculate the center of the rotated image
      const imgWidth = selectedImage.width * selectedImage.scaleX;
      const imgHeight = selectedImage.height * selectedImage.scaleY;
      const centerX = selectedImage.x + imgWidth / 2;
      const centerY = selectedImage.y + imgHeight / 2;
      
      // Update the image to have 0 rotation (keep it centered)
      const newX = centerX - imgWidth / 2;
      const newY = centerY - imgHeight / 2;
      
      setElements(elements.map(el =>
        el.id === selectedId
          ? { ...el, x: newX, y: newY, rotation: 0 } as CanvasElement
          : el
      ));
      
      setIsCropping(true);
      setTempCropData({
        x: newX,
        y: newY,
        width: imgWidth,
        height: imgHeight,
        originalRotation: selectedImage.rotation, // Store original rotation
      } as TempCropData);
    } else {
      setIsCropping(true);
      // Initialize crop rect at image position with image dimensions
      setTempCropData({
        x: selectedImage.x,
        y: selectedImage.y,
        width: selectedImage.width * selectedImage.scaleX,
        height: selectedImage.height * selectedImage.scaleY,
      });
    }
  }, [selectedId, elements, setIsCropping, setTempCropData, setElements]);

  // Crop: Apply crop
  // tempCropData contains ABSOLUTE canvas coordinates
  const applyCrop = useCallback(() => {
    console.log('[CROP] applyCrop called', { tempCropData, selectedId });
    if (!tempCropData || !selectedId) {
      console.log('[CROP] Missing tempCropData or selectedId');
      return;
    }
    
    const selectedImage = elements.find(el => el.id === selectedId && el.type === 'image') as ImageElement | undefined;
    if (!selectedImage) {
      console.log('[CROP] No selected image found');
      return;
    }

    console.log('[CROP] Selected image:', {
      x: selectedImage.x,
      y: selectedImage.y,
      width: selectedImage.width,
      height: selectedImage.height,
      scaleX: selectedImage.scaleX,
      scaleY: selectedImage.scaleY,
      imageSrc: selectedImage.image.src?.substring(0, 50)
    });

    // Calculate offset from image position (tempCropData is in absolute coords)
    const offsetX = tempCropData.x - selectedImage.x;
    const offsetY = tempCropData.y - selectedImage.y;
    
    // Convert to source image coordinates (before scaling)
    const sx = offsetX / selectedImage.scaleX;
    const sy = offsetY / selectedImage.scaleY;
    const sw = tempCropData.width / selectedImage.scaleX;
    const sh = tempCropData.height / selectedImage.scaleY;

    console.log('[CROP] Crop params:', { offsetX, offsetY, sx, sy, sw, sh });

    // Use the original image directly instead of creating a new one
    const sourceImage = selectedImage.image;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('[CROP] Failed to get canvas context');
      return;
    }

    canvas.width = tempCropData.width;
    canvas.height = tempCropData.height;

    try {
      ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, tempCropData.width, tempCropData.height);
      console.log('[CROP] drawImage successful');

      canvas.toBlob((blob) => {
        if (!blob) {
          console.log('[CROP] Failed to create blob');
          return;
        }
        console.log('[CROP] Blob created:', blob.size, 'bytes');
        
        const url = URL.createObjectURL(blob);
        const croppedImage = new window.Image();
        croppedImage.onload = () => {
          console.log('[CROP] Cropped image loaded, updating elements');
          // Restore original rotation if it was stored
          const originalRotation = tempCropData.originalRotation ?? 0;
          
          setElements(elements.map(el =>
            el.id === selectedId
              ? {
                  ...el,
                  image: croppedImage,
                  // Keep the crop rect position as the new image position
                  x: tempCropData.x,
                  y: tempCropData.y,
                  width: tempCropData.width,
                  height: tempCropData.height,
                  scaleX: 1,
                  scaleY: 1,
                  rotation: originalRotation, // Restore original rotation
                } as CanvasElement
              : el
          ));
          URL.revokeObjectURL(url);
          setIsCropping(false);
          setTempCropData(null);
        };
        croppedImage.onerror = (e) => {
          console.error('[CROP] Failed to load cropped image:', e);
          URL.revokeObjectURL(url);
        };
        croppedImage.src = url;
      }, 'image/png');
    } catch (e) {
      console.error('[CROP] Error during crop:', e);
    }
  }, [tempCropData, selectedId, elements, setElements, setIsCropping, setTempCropData]);

  // Crop: Cancel crop - restore original rotation if it was changed
  const cancelCrop = useCallback(() => {
    // If we stored an original rotation, restore it
    if (tempCropData?.originalRotation !== undefined && selectedId) {
      const selectedImage = elements.find(el => el.id === selectedId && el.type === 'image') as ImageElement | undefined;
      if (selectedImage) {
        // Calculate center and restore rotation
        const imgWidth = selectedImage.width * selectedImage.scaleX;
        const imgHeight = selectedImage.height * selectedImage.scaleY;
        const centerX = selectedImage.x + imgWidth / 2;
        const centerY = selectedImage.y + imgHeight / 2;
        const newX = centerX - imgWidth / 2;
        const newY = centerY - imgHeight / 2;
        
        setElements(elements.map(el =>
          el.id === selectedId
            ? { ...el, x: newX, y: newY, rotation: tempCropData.originalRotation } as CanvasElement
            : el
        ));
      }
    }
    setIsCropping(false);
    setTempCropData(null);
  }, [setIsCropping, setTempCropData, tempCropData, selectedId, elements, setElements]);

  return {
    handleDelete,
    handleClear,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    startCrop,
    applyCrop,
    cancelCrop,
  };
};
