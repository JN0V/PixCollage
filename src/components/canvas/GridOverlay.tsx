import React from 'react';
import { Layer, Rect, Group } from 'react-konva';
import type { GridZone } from '../../types/grid';
import { getAbsoluteZone } from '../../types/grid';

interface GridOverlayProps {
  zones: GridZone[];
  canvasWidth: number;
  canvasHeight: number;
  visible: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  zones,
  canvasWidth,
  canvasHeight,
  visible,
}) => {
  if (!visible || zones.length === 0) return null;

  return (
    <Layer listening={false}>
      <Group>
        {zones.map((zone) => {
          const abs = getAbsoluteZone(zone, canvasWidth, canvasHeight);
          
          return (
            <React.Fragment key={zone.id}>
              {/* Zone de fond */}
              <Rect
                x={abs.x}
                y={abs.y}
                width={abs.width}
                height={abs.height}
                fill="transparent"
                stroke="#6366f1"
                strokeWidth={2}
                dash={[10, 5]}
                opacity={0.5}
              />
              
              {/* Label de la zone (optionnel) */}
              {zone.imageId && (
                <Rect
                  x={abs.x}
                  y={abs.y}
                  width={abs.width}
                  height={abs.height}
                  fill="#6366f1"
                  opacity={0.05}
                />
              )}
            </React.Fragment>
          );
        })}
      </Group>
    </Layer>
  );
};
