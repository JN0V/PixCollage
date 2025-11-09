import { useCallback } from 'react';
import type { ImageElement, CanvasElement } from '../types/canvas';

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
};

interface UseImageHandlersProps {
  elements: CanvasElement[];
  canvasSize: { width: number; height: number };
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setToast: (message: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const useImageHandlers = ({
  elements,
  canvasSize,
  setElements,
  setSelectedId,
  setToast,
  scrollRef,
}: UseImageHandlersProps) => {
  
  const onDrop = useCallback(async (acceptedFiles: File[], toastMessage: string) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    
    const loaded = await Promise.all(acceptedFiles.map(f => loadImage(f)));
    const baseZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;
    
    const created: ImageElement[] = loaded.map((img, i) => {
      const scale = Math.min(
        canvasSize.width / 3 / img.width,
        canvasSize.height / 3 / img.height
      );
      const displayW = img.width * scale;
      const displayH = img.height * scale;
      const jitter = (i - (loaded.length - 1) / 2) * 16;
      const maxX = Math.max(0, canvasSize.width - displayW);
      const maxY = Math.max(0, canvasSize.height - displayH);
      const cxRaw = (canvasSize.width - displayW) / 2 + jitter;
      const cyRaw = (canvasSize.height - displayH) / 2 + jitter;
      const cx = Math.min(Math.max(0, cxRaw), maxX);
      const cy = Math.min(Math.max(0, cyRaw), maxY);
      
      return {
        type: 'image',
        id: Math.random().toString(36).substr(2, 9),
        image: img,
        x: cx,
        y: cy,
        width: img.width,
        height: img.height,
        rotation: 0,
        scaleX: scale,
        scaleY: scale,
        zIndex: baseZ + i + 1,
      } as ImageElement;
    });
    
    setElements(prev => [...prev, ...created]);
    setSelectedId(created[created.length - 1]?.id ?? null);
    setToast(toastMessage);
    
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const targetLeft = Math.max(0, (canvasSize.width - el.clientWidth) / 2);
      const targetTop = Math.max(0, (canvasSize.height - el.clientHeight) / 2);
      el.scrollTo({ left: targetLeft, top: targetTop, behavior: 'smooth' });
    });
  }, [canvasSize, elements, setElements, setSelectedId, setToast, scrollRef]);

  return { onDrop };
};
