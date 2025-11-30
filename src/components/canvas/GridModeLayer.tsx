import React, { useMemo, useCallback, memo } from 'react';
import { Layer } from 'react-konva';
import { GridZoneContainer } from './GridZoneContainer';
import { GridImageElement } from './GridImageElement';
import type { GridZone } from '../../types/grid';
import type { ImageElement, CanvasElement } from '../../types/canvas';

interface GridModeLayerProps {
  zones: GridZone[];
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onTransform: (id: string, newAttrs: Partial<CanvasElement>) => void;
  onAddToZone: (zoneId: string) => void;
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash' | 'zigzag';
}

const GridModeLayerInner: React.FC<GridModeLayerProps> = ({
  zones,
  elements,
  canvasWidth,
  canvasHeight,
  selectedId,
  onSelectElement,
  onTransform,
  onAddToZone,
  lineColor = '#6366f1',
  lineWidth = 2,
  lineStyle = 'dashed',
}) => {
  // Memoize zone calculations to avoid recalculating on every render
  const processedZones = useMemo(() => {
    return zones.map((zone) => {
      const zoneElement = elements.find(el => 
        zone.elementId && el.id === zone.elementId && el.type === 'image'
      ) as ImageElement | undefined;

      const zoneAbsX = zone.x * canvasWidth;
      const zoneAbsY = zone.y * canvasHeight;

      const adjustedElement = zoneElement ? {
        ...zoneElement,
        x: zoneElement.x - zoneAbsX,
        y: zoneElement.y - zoneAbsY,
      } : undefined;

      return { zone, zoneElement, zoneAbsX, zoneAbsY, adjustedElement };
    });
  }, [zones, elements, canvasWidth, canvasHeight]);

  // Memoize transform handler factory
  const createTransformHandler = useCallback((zoneAbsX: number, zoneAbsY: number) => {
    return (id: string, newAttrs: Partial<CanvasElement>) => {
      const absoluteAttrs = { ...newAttrs };
      if (newAttrs.x !== undefined) {
        absoluteAttrs.x = newAttrs.x + zoneAbsX;
      }
      if (newAttrs.y !== undefined) {
        absoluteAttrs.y = newAttrs.y + zoneAbsY;
      }
      onTransform(id, absoluteAttrs);
    };
  }, [onTransform]);

  // Memoize select handler factory
  const createSelectHandler = useCallback((elementId: string) => {
    return () => onSelectElement(elementId);
  }, [onSelectElement]);

  return (
    <Layer>
      {processedZones.map(({ zone, zoneElement, zoneAbsX, zoneAbsY, adjustedElement }) => (
        <GridZoneContainer
          key={zone.id}
          zone={zone}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          hasElement={!!zoneElement}
          onAddClick={onAddToZone}
          lineColor={lineColor}
          lineWidth={lineWidth}
          lineStyle={lineStyle}
        >
          {adjustedElement && (
            <GridImageElement
              imageData={adjustedElement}
              isSelected={adjustedElement.id === selectedId}
              onSelect={createSelectHandler(adjustedElement.id)}
              onTransform={createTransformHandler(zoneAbsX, zoneAbsY)}
            />
          )}
        </GridZoneContainer>
      ))}
    </Layer>
  );
};

// Memoize the entire layer to prevent unnecessary re-renders
export const GridModeLayer = memo(GridModeLayerInner);
