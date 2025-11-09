import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import type { GridZone } from '../../types/grid';

interface GridZoneContainerProps {
  zone: GridZone;
  canvasWidth: number;
  canvasHeight: number;
  hasElement: boolean;
  onAddClick: (zoneId: string) => void;
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash' | 'zigzag';
  children?: React.ReactNode;
}

const getLineDashPattern = (style: string): number[] | undefined => {
  switch (style) {
    case 'solid': return undefined;
    case 'dashed': return [10, 5];
    case 'dotted': return [2, 4];
    case 'dash-dot': return [10, 5, 2, 5];
    case 'long-dash': return [20, 8];
    case 'zigzag': return [8, 4, 4, 4];
    default: return undefined;
  }
};

export const GridZoneContainer: React.FC<GridZoneContainerProps> = ({
  zone,
  canvasWidth,
  canvasHeight,
  hasElement,
  onAddClick,
  lineColor = '#6366f1',
  lineWidth = 2,
  lineStyle = 'dashed',
  children,
}) => {
  const absX = zone.x * canvasWidth;
  const absY = zone.y * canvasHeight;
  const absWidth = zone.width * canvasWidth;
  const absHeight = zone.height * canvasHeight;

  // Calculate centroid for button placement
  let centerX = absWidth / 2;
  let centerY = absHeight / 2;
  
  if (zone.clipPath && zone.clipPath.length > 0) {
    // For polygon zones, calculate true centroid
    const points = zone.clipPath.map(p => ({
      x: p.x * absWidth,
      y: p.y * absHeight
    }));
    
    let sumX = 0;
    let sumY = 0;
    points.forEach(p => {
      sumX += p.x;
      sumY += p.y;
    });
    centerX = sumX / points.length;
    centerY = sumY / points.length;
  }

  return (
    <Group
      x={absX}
      y={absY}
      onClick={() => !hasElement && onAddClick(zone.id)}
      onTap={() => !hasElement && onAddClick(zone.id)}
      clipFunc={(ctx) => {
        // Clip content to zone boundaries (polygon or rectangle)
        if (zone.clipPath && zone.clipPath.length > 0) {
          // Polygon clipping (diagonal, zigzag, etc.)
          ctx.beginPath();
          const firstPoint = zone.clipPath[0];
          ctx.moveTo(firstPoint.x * absWidth, firstPoint.y * absHeight);
          for (let i = 1; i < zone.clipPath.length; i++) {
            const point = zone.clipPath[i];
            ctx.lineTo(point.x * absWidth, point.y * absHeight);
          }
          ctx.closePath();
        } else {
          // Rectangle clipping (default)
          ctx.rect(0, 0, absWidth, absHeight);
        }
      }}
    >
      {/* Zone background - only visible when empty */}
      {!hasElement && (
        <>
          {zone.clipPath && zone.clipPath.length > 0 ? (
            // Polygon border for diagonal/zigzag zones
            <Line
              points={zone.clipPath.flatMap(p => [p.x * absWidth, p.y * absHeight]).concat([
                zone.clipPath[0].x * absWidth, 
                zone.clipPath[0].y * absHeight
              ])}
              fill={`${lineColor}14`}
              stroke={lineColor}
              strokeWidth={lineWidth}
              dash={getLineDashPattern(lineStyle)}
              closed
            />
          ) : (
            // Rectangle border for standard zones
            <Rect
              x={0}
              y={0}
              width={absWidth}
              height={absHeight}
              fill={`${lineColor}14`}
              stroke={lineColor}
              strokeWidth={lineWidth}
              dash={getLineDashPattern(lineStyle)}
            />
          )}
        </>
      )}

      {/* Add button when zone is empty */}
      {!hasElement && (
        <>
          <Rect
            x={centerX - 30}
            y={centerY - 30}
            width={60}
            height={60}
            fill="#6366f1"
            cornerRadius={30}
            opacity={0.9}
            onClick={(e) => {
              e.cancelBubble = true;
              onAddClick(zone.id);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onAddClick(zone.id);
            }}
            _useStrictMode
          />
          {/* Plus icon */}
          <Rect
            x={centerX - 15}
            y={centerY - 3}
            width={30}
            height={6}
            fill="white"
            listening={false}
          />
          <Rect
            x={centerX - 3}
            y={centerY - 15}
            width={6}
            height={30}
            fill="white"
            listening={false}
          />
        </>
      )}

      {/* Element content (clipped to zone) */}
      {children}
    </Group>
  );
};
