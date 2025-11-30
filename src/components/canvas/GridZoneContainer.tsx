import React, { memo, useMemo, useCallback } from 'react';
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

const GridZoneContainerInner: React.FC<GridZoneContainerProps> = ({
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
  // Memoize all calculations
  const { absX, absY, absWidth, absHeight, centerX, centerY, clipPoints } = useMemo(() => {
    const aX = zone.x * canvasWidth;
    const aY = zone.y * canvasHeight;
    const aW = zone.width * canvasWidth;
    const aH = zone.height * canvasHeight;

    let cX = aW / 2;
    let cY = aH / 2;
    let points: number[] | null = null;
    
    if (zone.clipPath && zone.clipPath.length > 0) {
      // Pre-calculate clip points
      points = zone.clipPath.flatMap(p => [p.x * aW, p.y * aH]);
      
      // Calculate centroid
      let sumX = 0, sumY = 0;
      for (let i = 0; i < points.length; i += 2) {
        sumX += points[i];
        sumY += points[i + 1];
      }
      cX = sumX / (points.length / 2);
      cY = sumY / (points.length / 2);
    }

    return { absX: aX, absY: aY, absWidth: aW, absHeight: aH, centerX: cX, centerY: cY, clipPoints: points };
  }, [zone.x, zone.y, zone.width, zone.height, zone.clipPath, canvasWidth, canvasHeight]);

  // Memoize clipFunc to avoid recreation on every render
  const clipFunc = useCallback((ctx: { beginPath: () => void; moveTo: (x: number, y: number) => void; lineTo: (x: number, y: number) => void; closePath: () => void; rect: (x: number, y: number, w: number, h: number) => void }) => {
    if (clipPoints) {
      ctx.beginPath();
      ctx.moveTo(clipPoints[0], clipPoints[1]);
      for (let i = 2; i < clipPoints.length; i += 2) {
        ctx.lineTo(clipPoints[i], clipPoints[i + 1]);
      }
      ctx.closePath();
    } else {
      ctx.rect(0, 0, absWidth, absHeight);
    }
  }, [clipPoints, absWidth, absHeight]);

  // Memoize click handlers
  const handleClick = useCallback(() => {
    if (!hasElement) onAddClick(zone.id);
  }, [hasElement, onAddClick, zone.id]);

  const handleAddButtonClick = useCallback((e: { cancelBubble: boolean }) => {
    e.cancelBubble = true;
    onAddClick(zone.id);
  }, [onAddClick, zone.id]);

  return (
    <Group
      x={absX}
      y={absY}
      onClick={handleClick}
      onTap={handleClick}
      clipFunc={clipFunc}
    >
      {/* Zone background - only visible when empty */}
      {!hasElement && (
        <>
          {clipPoints ? (
            // Polygon border for diagonal/zigzag zones
            <Line
              points={clipPoints.concat([clipPoints[0], clipPoints[1]])}
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
            onClick={handleAddButtonClick}
            onTap={handleAddButtonClick}
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

// Memoize the entire component to prevent unnecessary re-renders
export const GridZoneContainer = memo(GridZoneContainerInner);
