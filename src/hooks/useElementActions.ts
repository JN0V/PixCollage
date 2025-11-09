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
  const startCrop = useCallback(() => {
    const selectedImage = elements.find(el => el.id === selectedId && el.type === 'image') as ImageElement | undefined;
    if (!selectedImage) return;
    
    setIsCropping(true);
    setTempCropData({
      x: 0,
      y: 0,
      width: selectedImage.width * selectedImage.scaleX,
      height: selectedImage.height * selectedImage.scaleY,
    });
  }, [selectedId, elements, setIsCropping, setTempCropData]);

  // Crop: Apply crop
  const applyCrop = useCallback(() => {
    if (!tempCropData || !selectedId) return;
    
    const selectedImage = elements.find(el => el.id === selectedId && el.type === 'image') as ImageElement | undefined;
    if (!selectedImage) return;

    const newImage = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = tempCropData.width;
    canvas.height = tempCropData.height;

    newImage.onload = () => {
      const sx = tempCropData.x / selectedImage.scaleX;
      const sy = tempCropData.y / selectedImage.scaleY;
      const sw = tempCropData.width / selectedImage.scaleX;
      const sh = tempCropData.height / selectedImage.scaleY;

      ctx.drawImage(newImage, sx, sy, sw, sh, 0, 0, tempCropData.width, tempCropData.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const croppedImage = new window.Image();
        croppedImage.onload = () => {
          setElements(elements.map(el =>
            el.id === selectedId
              ? {
                  ...el,
                  image: croppedImage,
                  width: tempCropData.width,
                  height: tempCropData.height,
                  scaleX: 1,
                  scaleY: 1,
                } as CanvasElement
              : el
          ));
          URL.revokeObjectURL(url);
          setIsCropping(false);
          setTempCropData(null);
        };
        croppedImage.src = url;
      });
    };
    newImage.src = selectedImage.image.src;
  }, [tempCropData, selectedId, elements, setElements, setIsCropping, setTempCropData]);

  // Crop: Cancel crop
  const cancelCrop = useCallback(() => {
    setIsCropping(false);
    setTempCropData(null);
  }, [setIsCropping, setTempCropData]);

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
