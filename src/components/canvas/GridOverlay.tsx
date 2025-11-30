import React, { memo } from 'react';
import { Layer, Rect, Group, Line } from 'react-konva';
import type { GridZone } from '../../types/grid';
import { getAbsoluteZone } from '../../types/grid';
import { getZigzagPoints } from '../../utils/zigzagPattern';

interface GridOverlayProps {
  zones: GridZone[];
  canvasWidth: number;
  canvasHeight: number;
  visible: boolean;
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash' | 'zigzag';
}

const getLineDashPattern = (style: string): number[] | undefined => {
  switch (style) {
    case 'solid': return undefined;
    case 'dashed': return [10, 5];
    case 'dotted': return [2, 4];
    case 'dash-dot': return [10, 5, 2, 5];
    case 'long-dash': return [20, 8];
    case 'zigzag': return undefined; // Zigzag uses custom points, not dash
    default: return undefined;
  }
};

const renderLine = (
  points: number[],
  color: string,
  width: number,
  style: string,
  key: string
) => {
  if (style === 'zigzag') {
    // For zigzag, create a path with actual zigzag points
    const [x1, y1, x2, y2] = points;
    const zigzagPoints = getZigzagPoints(x1, y1, x2, y2, width * 1.5, 12);
    return (
      <Line
        key={key}
        points={zigzagPoints}
        stroke={color}
        strokeWidth={width}
        lineCap="round"
        lineJoin="round"
        opacity={0.5}
      />
    );
  }
  
  // Normal line with dash pattern
  return (
    <Line
      key={key}
      points={points}
      stroke={color}
      strokeWidth={width}
      dash={getLineDashPattern(style)}
      opacity={0.5}
    />
  );
};

const GridOverlayInner: React.FC<GridOverlayProps> = ({
  zones,
  canvasWidth,
  canvasHeight,
  visible,
  lineColor = '#6366f1',
  lineWidth = 2,
  lineStyle = 'dashed',
}) => {
  if (!visible || zones.length === 0) return null;

  // Collect all unique grid line segments to avoid rendering duplicates
  const lineSegments = new Set<string>();
  const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = [];
  
  zones.forEach(zone => {
    const abs = getAbsoluteZone(zone, canvasWidth, canvasHeight);
    
    // Create segments with unique identifiers (rounded to avoid float precision issues)
    const segments = [
      { x1: abs.x, y1: abs.y, x2: abs.x + abs.width, y2: abs.y, type: 'h' }, // Top
      { x1: abs.x, y1: abs.y + abs.height, x2: abs.x + abs.width, y2: abs.y + abs.height, type: 'h' }, // Bottom
      { x1: abs.x, y1: abs.y, x2: abs.x, y2: abs.y + abs.height, type: 'v' }, // Left
      { x1: abs.x + abs.width, y1: abs.y, x2: abs.x + abs.width, y2: abs.y + abs.height, type: 'v' }, // Right
    ];
    
    segments.forEach(seg => {
      // Round coordinates to avoid floating point precision issues
      const x1 = Math.round(seg.x1);
      const y1 = Math.round(seg.y1);
      const x2 = Math.round(seg.x2);
      const y2 = Math.round(seg.y2);
      
      // Create unique key for this exact line segment
      const key = seg.type === 'h' 
        ? `h-${y1}-${Math.min(x1, x2)}-${Math.max(x1, x2)}`
        : `v-${x1}-${Math.min(y1, y2)}-${Math.max(y1, y2)}`;
      
      // Only add if not already present
      if (!lineSegments.has(key)) {
        lineSegments.add(key);
        gridLines.push({ x1, y1, x2, y2, key });
      }
    });
  });

  return (
    <Layer listening={false}>
      <Group>
        {/* Render zone backgrounds */}
        {zones.map((zone) => {
          const abs = getAbsoluteZone(zone, canvasWidth, canvasHeight);
          
          return (
            <React.Fragment key={zone.id}>
              {/* Zone de fond */}
              {zone.clipPath && zone.clipPath.length > 0 ? (
                // Polygon overlay for diagonal/zigzag zones
                <Line
                  points={zone.clipPath.flatMap(p => [
                    abs.x + p.x * abs.width,
                    abs.y + p.y * abs.height
                  ]).concat([
                    abs.x + zone.clipPath[0].x * abs.width,
                    abs.y + zone.clipPath[0].y * abs.height
                  ])}
                  fill={zone.imageId ? `${lineColor}14` : "transparent"}
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  dash={getLineDashPattern(lineStyle)}
                  opacity={0.5}
                  closed
                />
              ) : (
                // Just render background for standard rectangular zones
                <Rect
                  x={abs.x}
                  y={abs.y}
                  width={abs.width}
                  height={abs.height}
                  fill={zone.imageId ? `${lineColor}08` : "transparent"}
                  opacity={0.3}
                />
              )}
            </React.Fragment>
          );
        })}
        
        {/* Render unique grid lines (no duplicates) */}
        {gridLines.map((line) => 
          renderLine(
            [line.x1, line.y1, line.x2, line.y2],
            lineColor,
            lineWidth,
            lineStyle,
            line.key
          )
        )}
      </Group>
    </Layer>
  );
};

// Memoize to prevent unnecessary re-renders
export const GridOverlay = memo(GridOverlayInner);
