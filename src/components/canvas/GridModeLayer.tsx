import React from 'react';
import { Layer } from 'react-konva';
import { GridZoneContainer } from './GridZoneContainer';
import { ImageElement as ImageComponent } from './ImageElement';
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
  snapRotation: boolean;
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash' | 'zigzag';
}

export const GridModeLayer: React.FC<GridModeLayerProps> = ({
  zones,
  elements,
  canvasWidth,
  canvasHeight,
  selectedId,
  onSelectElement,
  onTransform,
  onAddToZone,
  snapRotation,
  lineColor = '#6366f1',
  lineWidth = 2,
  lineStyle = 'dashed',
}) => {
  return (
    <Layer>
      {zones.map((zone) => {
        // Find element assigned to this zone
        const zoneElement = elements.find(el => 
          zone.elementId && el.id === zone.elementId && el.type === 'image'
        ) as ImageElement | undefined;

        // Calculate zone absolute position
        const zoneAbsX = zone.x * canvasWidth;
        const zoneAbsY = zone.y * canvasHeight;

        // Adjust element position to be relative to zone
        const adjustedElement = zoneElement ? {
          ...zoneElement,
          x: zoneElement.x - zoneAbsX,
          y: zoneElement.y - zoneAbsY,
        } : undefined;

        return (
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
              <ImageComponent
                imageData={adjustedElement}
                isSelected={adjustedElement.id === selectedId}
                onSelect={() => onSelectElement(adjustedElement.id)}
                onTransform={(id, newAttrs) => {
                  // Convert relative position back to absolute
                  const absoluteAttrs = { ...newAttrs };
                  if (newAttrs.x !== undefined) {
                    absoluteAttrs.x = newAttrs.x + zoneAbsX;
                  }
                  if (newAttrs.y !== undefined) {
                    absoluteAttrs.y = newAttrs.y + zoneAbsY;
                  }
                  onTransform(id, absoluteAttrs);
                }}
                snapRotation={snapRotation}
                isCropping={false}
                tempCropData={null}
                onCropChange={() => {}}
              />
            )}
          </GridZoneContainer>
        );
      })}
    </Layer>
  );
};
