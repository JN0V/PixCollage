import { useState, useCallback } from 'react';
import type { GridZone } from '../types/grid';
import { gridTemplates, findClosestZone, getAbsoluteZone } from '../types/grid';
import type { CanvasElement, ImageElement } from '../types/canvas';

export type GridMode = 'free' | 'grid';

interface UseGridProps {
  canvasSize: { width: number; height: number };
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
}

export const useGrid = ({ canvasSize, elements, setElements }: UseGridProps) => {
  const [gridMode, setGridMode] = useState<GridMode>('free');
  const [selectedGridId, setSelectedGridId] = useState<string | null>(null);
  const [gridZones, setGridZones] = useState<GridZone[]>([]);
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [gridLineColor, setGridLineColor] = useState('#6366f1');
  const [gridLineWidth, setGridLineWidth] = useState(2);
  const [gridLineStyle, setGridLineStyle] = useState<'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash' | 'zigzag'>('dashed');

  const selectGrid = useCallback((gridId: string) => {
    const template = gridTemplates.find(t => t.id === gridId);
    if (!template) return;

    setSelectedGridId(gridId);
    setGridZones(template.zones.map(z => ({ ...z })));
    setShowGridOverlay(template.zones.length > 0);
  }, []);

  /**
   * Assigne une image à une zone spécifique
   */
  const assignImageToZone = useCallback((imageId: string, zoneId: string) => {
    setGridZones(prev =>
      prev.map(zone =>
        zone.id === zoneId ? { ...zone, imageId } : zone
      )
    );

    // Positionne et redimensionne l'image pour remplir la zone
    const zone = gridZones.find(z => z.id === zoneId);
    if (!zone) return;

    const abs = getAbsoluteZone(zone, canvasSize.width, canvasSize.height);
    const imageElement = elements.find(el => el.id === imageId && el.type === 'image') as ImageElement | undefined;
    if (!imageElement) return;

    // Calcule le scale pour remplir la zone (mode "cover")
    const scaleX = abs.width / imageElement.width;
    const scaleY = abs.height / imageElement.height;
    const scale = Math.max(scaleX, scaleY); // cover mode

    setElements(prev =>
      prev.map(el =>
        el.id === imageId
          ? {
              ...el,
              x: abs.x + (abs.width - imageElement.width * scale) / 2,
              y: abs.y + (abs.height - imageElement.height * scale) / 2,
              scaleX: scale,
              scaleY: scale,
              rotation: 0,
            } as CanvasElement
          : el
      )
    );
  }, [gridZones, canvasSize, elements, setElements]);

  /**
   * Snap automatique: trouve la zone la plus proche et assigne l'image
   */
  const snapToGrid = useCallback((imageId: string, x: number, y: number) => {
    if (gridZones.length === 0) return;

    const closestZone = findClosestZone(x, y, gridZones, canvasSize.width, canvasSize.height);
    if (closestZone && !closestZone.imageId) {
      assignImageToZone(imageId, closestZone.id);
    }
  }, [gridZones, canvasSize, assignImageToZone]);

  /**
   * Auto-remplit les zones avec les images disponibles
   */
  const autoFillGrid = useCallback(() => {
    const imageElements = elements.filter(el => el.type === 'image') as ImageElement[];
    const emptyZones = gridZones.filter(z => !z.imageId);

    emptyZones.forEach((zone, index) => {
      if (index < imageElements.length) {
        assignImageToZone(imageElements[index].id, zone.id);
      }
    });
  }, [elements, gridZones, assignImageToZone]);

  /**
   * Réinitialise toutes les assignations de zones
   */
  const clearGrid = useCallback(() => {
    setGridZones(prev => prev.map(z => ({ ...z, imageId: undefined })));
  }, []);

  // Assign element to zone (for grid mode)
  const assignElementToZone = useCallback((zoneId: string, elementId: string) => {
    setGridZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, elementId } : z
    ));
  }, []);

  // Remove element from zone
  const removeElementFromZone = useCallback((zoneId: string) => {
    setGridZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, elementId: null } : z
    ));
  }, []);

  // Toggle between free and grid mode
  const toggleGridMode = useCallback(() => {
    setGridMode(prev => prev === 'free' ? 'grid' : 'free');
    if (gridMode === 'free' && gridZones.length === 0 && gridTemplates.length > 0) {
      // Auto-select first grid when switching to grid mode for first time
      selectGrid(gridTemplates[0].id);
    }
  }, [gridMode, gridZones.length, selectGrid]);

  return {
    gridMode,
    setGridMode,
    toggleGridMode,
    selectedGridId,
    gridZones,
    showGridOverlay,
    setShowGridOverlay,
    gridLineColor,
    setGridLineColor,
    gridLineWidth,
    setGridLineWidth,
    gridLineStyle,
    setGridLineStyle,
    selectGrid,
    assignImageToZone,
    assignElementToZone,
    removeElementFromZone,
    snapToGrid,
    autoFillGrid,
    clearGrid,
  };
};
