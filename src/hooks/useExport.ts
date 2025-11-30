import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import Konva from 'konva';
import type { GridMode } from './useGrid';

interface UseExportProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  canvasSize: { width: number; height: number };
  gridMode: GridMode;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  setToast: (message: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

interface UseExportReturn {
  isExporting: boolean;
  exportProgress: number;
  handleExport: () => Promise<void>;
}

export const useExport = ({
  stageRef,
  canvasSize,
  gridMode,
  selectedId,
  setSelectedId,
  setToast,
  t,
}: UseExportProps): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = useCallback(async () => {
    if (!stageRef.current) return;
    
    setIsExporting(true);
    setExportProgress(5);
    
    // Temporarily deselect to hide controls
    const previousSelection = selectedId;
    setSelectedId(null);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    setExportProgress(15);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    setExportProgress(25);
    
    // Wait for controls to be hidden
    setTimeout(async () => {
      const stage = stageRef.current!;
      let exportOptions: { 
        pixelRatio: number; 
        mimeType: string; 
        x?: number; 
        y?: number; 
        width?: number; 
        height?: number;
      } = {
        pixelRatio: 2,
        mimeType: 'image/png',
      };

      setExportProgress(35);
      
      // In grid mode, always export full canvas. In free mode, crop to content.
      if (gridMode === 'free') {
        const imageNodes = stage.find('Image') as Konva.Image[];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        imageNodes.forEach((node) => {
          if (!node.visible()) return;
          const r = node.getClientRect({ skipStroke: true, skipShadow: true });
          minX = Math.min(minX, r.x);
          minY = Math.min(minY, r.y);
          maxX = Math.max(maxX, r.x + r.width);
          maxY = Math.max(maxY, r.y + r.height);
        });
        
        if (isFinite(minX) && isFinite(minY) && isFinite(maxX) && isFinite(maxY)) {
          const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));
          const x = clamp(minX, 0, stage.width());
          const y = clamp(minY, 0, stage.height());
          const w = clamp(maxX, 0, stage.width()) - x;
          const h = clamp(maxY, 0, stage.height()) - y;
          if (w > 0 && h > 0) {
            exportOptions = { ...exportOptions, x, y, width: w, height: h };
          }
        }
      } else {
        // Grid mode: export full canvas with exact dimensions
        exportOptions = {
          ...exportOptions,
          x: 0,
          y: 0,
          width: canvasSize.width,
          height: canvasSize.height
        };
      }

      setExportProgress(45);
      await new Promise(resolve => setTimeout(resolve, 50));
      setExportProgress(55);
      
      const uri = stage.toDataURL(exportOptions);
      
      setExportProgress(75);
      await new Promise(resolve => setTimeout(resolve, 50));
      setExportProgress(85);

      if (Capacitor.isNativePlatform()) {
        try {
          setExportProgress(90);
          const { Share } = await import('@capacitor/share');
          await Share.share({ title: 'Export PNG', url: uri });
          setToast(t('toast.exportReady'));
        } catch {
          try {
            const base64 = uri.split(',')[1] || '';
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            const name = `collage-${Date.now()}.png`;
            await Filesystem.writeFile({
              path: name,
              data: base64,
              directory: Directory.Documents,
              recursive: true,
            });
            setToast(t('toast.exportSaved', { filename: name }));
          } catch {
            setToast(t('toast.exportUnavailable'));
          }
        } finally {
          setExportProgress(100);
          setTimeout(() => {
            setIsExporting(false);
            setExportProgress(0);
          }, 500);
        }
      } else {
        setExportProgress(90);
        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = uri;
        link.click();
        setToast(t('toast.exportDownloaded'));
        setExportProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
        }, 500);
      }
      
      // Restore selection
      setSelectedId(previousSelection);
    }, 200);
  }, [stageRef, canvasSize, gridMode, selectedId, setSelectedId, setToast, t]);

  return {
    isExporting,
    exportProgress,
    handleExport,
  };
};
