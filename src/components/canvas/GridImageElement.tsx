import React, { useRef, useCallback, memo } from 'react';
import { Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

interface GridImageData {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

interface GridImageElementProps {
  imageData: GridImageData;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, updates: Partial<Omit<GridImageData, 'id' | 'image'>>) => void;
}

/**
 * Lightweight image component for grid mode.
 * No Transformer, no filters caching, no multi-touch gestures.
 * Optimized for performance on mobile devices with complex grids.
 */
const GridImageElementInner: React.FC<GridImageElementProps> = ({
  imageData,
  isSelected,
  onSelect,
  onTransform,
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = useCallback(() => {
    const node = imageRef.current;
    if (node) {
      dragStartPos.current = { x: node.x(), y: node.y() };
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    const node = imageRef.current;
    if (!node) return;

    onTransform(imageData.id, {
      x: node.x(),
      y: node.y(),
    });
    dragStartPos.current = null;
  }, [imageData.id, onTransform]);

  return (
    <KonvaImage
      ref={imageRef}
      image={imageData.image}
      x={imageData.x}
      y={imageData.y}
      width={imageData.width}
      height={imageData.height}
      scaleX={imageData.scaleX}
      scaleY={imageData.scaleY}
      rotation={imageData.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      stroke={isSelected ? '#6366f1' : undefined}
      strokeWidth={isSelected ? 3 : 0}
      strokeScaleEnabled={false}
    />
  );
};

// Memoize to prevent unnecessary re-renders
export const GridImageElement = memo(GridImageElementInner);
