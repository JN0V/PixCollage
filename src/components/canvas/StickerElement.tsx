import React, { useRef, useEffect, useState, memo } from 'react';
import { Group, Image as KonvaImage, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import type { StickerElement as StickerData } from '../../types/canvas';
import { getStickerById } from '../../data/stickers';
import { useMultiTouchGestures } from '../../hooks/useMultiTouchGestures';

interface StickerComponentProps {
  sticker: StickerData;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, newAttrs: Partial<StickerData>) => void;
  snapRotation?: boolean;
}

const StickerComponentInner: React.FC<StickerComponentProps> = ({
  sticker,
  isSelected,
  onSelect,
  onTransform,
  snapRotation = true,
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const textFallbackRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageError, setImageError] = useState(false);

  const stickerData = getStickerById(sticker.stickerId);
  
  // Multi-touch gestures - use imageRef as primary, fallback if needed
  const activeRef = imageError ? textFallbackRef : imageRef;
  const { isMultiTouchActive, handlers: multiTouchHandlers } = useMultiTouchGestures({
    nodeRef: activeRef,
    onTransformEnd: (transform) => {
      onTransform(sticker.id, transform);
    },
    snapRotation,
    enabled: true,
  });
  
  // Load PNG image
  useEffect(() => {
    if (!stickerData) return;
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setImageError(false);
    };
    img.onerror = () => {
      console.warn(`Failed to load sticker image: ${stickerData.imageUrl}`);
      setImageError(true);
    };
    img.src = stickerData.imageUrl;
  }, [stickerData]);

  useEffect(() => {
    const nodeRef = imageError ? textFallbackRef.current : imageRef.current;
    if (isSelected && trRef.current && nodeRef) {
      trRef.current.nodes([nodeRef]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, imageError]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onTransform(sticker.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = imageError ? textFallbackRef.current : imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    let rotation = node.rotation();

    // Snap rotation to 15° increments if enabled
    if (snapRotation) {
      const snapAngle = 15;
      rotation = Math.round(rotation / snapAngle) * snapAngle;
    }

    node.scaleX(1);
    node.scaleY(1);

    onTransform(sticker.id, {
      x: node.x(),
      y: node.y(),
      scaleX,
      scaleY,
      rotation,
    });
  };

  if (!stickerData) return null;

  return (
    <Group>
      {!imageError && image ? (
        // Render PNG image
        <KonvaImage
          ref={imageRef}
          id={sticker.id}
          image={image}
          x={sticker.x}
          y={sticker.y}
          width={sticker.size}
          height={sticker.size}
          rotation={sticker.rotation}
          scaleX={sticker.scaleX}
          scaleY={sticker.scaleY}
          draggable={!isMultiTouchActive}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          onTouchStart={(e) => {
            const evt = e.evt as TouchEvent;
            if (evt.touches.length === 2) {
              onSelect();
            }
            multiTouchHandlers.onTouchStart(e);
          }}
          onTouchMove={multiTouchHandlers.onTouchMove}
          onTouchEnd={multiTouchHandlers.onTouchEnd}
        />
      ) : (
        // Fallback to emoji preview if image not loaded
        <Text
          ref={textFallbackRef}
          id={sticker.id}
          text={stickerData.previewEmoji}
          x={sticker.x}
          y={sticker.y}
          fontSize={sticker.size / 3} // Smaller for multi-emoji preview
          rotation={sticker.rotation}
          scaleX={sticker.scaleX}
          scaleY={sticker.scaleY}
          draggable={!isMultiTouchActive}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          onTouchStart={(e) => {
            const evt = e.evt as TouchEvent;
            if (evt.touches.length === 2) {
              onSelect();
            }
            multiTouchHandlers.onTouchStart(e);
          }}
          onTouchMove={multiTouchHandlers.onTouchMove}
          onTouchEnd={multiTouchHandlers.onTouchEnd}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotationSnaps={snapRotation ? [0, 45, 90, 135, 180, 225, 270, 315] : []}
          borderStroke="#ec4899"
          borderStrokeWidth={2}
          anchorStroke="#ec4899"
          anchorFill="#fff"
          anchorSize={10}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </Group>
  );
};

// Memoize to prevent unnecessary re-renders
export const StickerComponent = memo(StickerComponentInner);
