import React, { useRef, useEffect, memo } from 'react';
import { Image as KonvaImage, Transformer, Rect } from 'react-konva';
import Konva from 'konva';
import { useMultiTouchGestures } from '../../hooks/useMultiTouchGestures';
import { logger } from '../../utils/logger';

interface ImageData {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  crop?: { x: number; y: number; width: number; height: number };
  filters?: {
    brightness: number;
    contrast: number;
    blur: number;
    grayscale: boolean;
    sepia: boolean;
    saturation: number;
  };
}

interface ImageElementProps {
  imageData: ImageData;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, updates: Partial<Omit<ImageData, 'id' | 'image'>>) => void;
  snapRotation?: boolean;
  isCropping: boolean;
  tempCropData: { x: number; y: number; width: number; height: number } | null;
  onCropChange: (data: { x: number; y: number; width: number; height: number } | null) => void;
}

const snapToGrid = (rotation: number, shouldSnap: boolean): number => {
  if (!shouldSnap) return rotation;
  
  const snapAngles = [0, 90, 180, 270, 360];
  const normalized = ((rotation % 360) + 360) % 360;
  
  let closestAngle = snapAngles[0];
  let minDiff = Math.abs(normalized - snapAngles[0]);
  
  for (const angle of snapAngles) {
    const diff = Math.abs(normalized - angle);
    if (diff < minDiff) {
      minDiff = diff;
      closestAngle = angle;
    }
  }
  
  return minDiff < 15 ? closestAngle : rotation;
};

const ImageElementInner: React.FC<ImageElementProps> = ({
  imageData,
  isSelected,
  onSelect,
  onTransform,
  snapRotation = true,
  isCropping,
  tempCropData,
  onCropChange,
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const cropRef = useRef<Konva.Rect>(null);
  const cropTrRef = useRef<Konva.Transformer>(null);

  // Multi-touch gestures hook
  const { isMultiTouchActive, handlers: multiTouchHandlers } = useMultiTouchGestures({
    nodeRef: imageRef,
    onTransformEnd: (transform) => {
      logger.image('Multi-touch transform complete');
      onTransform(imageData.id, transform);
    },
    snapRotation,
    enabled: !isCropping,
  });

  // Transformer pour manipulation desktop
  useEffect(() => {
    if (isSelected && !isCropping && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isCropping]);

  // Transformer pour crop
  useEffect(() => {
    if (isCropping && isSelected && tempCropData) {
      setTimeout(() => {
        if (cropTrRef.current && cropRef.current) {
          cropTrRef.current.nodes([cropRef.current]);
          cropTrRef.current.getLayer()?.batchDraw();
        }
      }, 50);
    }
  }, [isCropping, isSelected, tempCropData, imageData.x, imageData.y]);

  // Filtres
  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;

    if (isCropping) {
      node.clearCache();
      node.filters([]);
      node.getLayer()?.batchDraw();
      return;
    }

    const { filters: imgFilters } = imageData;
    if (!imgFilters) return;

    node.clearCache();
    node.filters([]);

    const filtersToApply: Parameters<typeof node.filters>[0] = [];
    
    if (imgFilters.brightness !== 100 || imgFilters.contrast !== 100) {
      filtersToApply.push(Konva.Filters.Brighten, Konva.Filters.Contrast);
    }
    if (imgFilters.blur > 0) filtersToApply.push(Konva.Filters.Blur);
    if (imgFilters.grayscale) filtersToApply.push(Konva.Filters.Grayscale);
    if (imgFilters.sepia) filtersToApply.push(Konva.Filters.Sepia);
    if (imgFilters.saturation !== 100) filtersToApply.push(Konva.Filters.HSL);

    if (filtersToApply.length > 0) {
      node.filters(filtersToApply);
      node.brightness((imgFilters.brightness - 100) / 100);
      node.contrast((imgFilters.contrast - 100) / 100);
      node.blurRadius(imgFilters.blur || 0);
      node.saturation((imgFilters.saturation - 100) / 100);
    }

    node.getLayer()?.batchDraw();
    
    // Cache différé
    const cacheTimer = setTimeout(() => {
      if (!node || !imgFilters) return;
      
      const filtersActive = 
        imgFilters.brightness !== 100 || 
        imgFilters.contrast !== 100 ||
        imgFilters.saturation !== 100 ||
        imgFilters.blur > 0 ||
        imgFilters.grayscale ||
        imgFilters.sepia;
        
      if (filtersActive) {
        const layer = node.getLayer();
        const stage = layer?.getStage();
        if (stage) {
          const textNodes = stage.find('Text') as Konva.Text[];
          const textNodesVisibility = textNodes.map(n => n.visible());
          textNodes.forEach(n => n.visible(false));
          node.cache();
          textNodes.forEach((n, i) => n.visible(textNodesVisibility[i]));
        } else {
          node.cache();
        }
        node.getLayer()?.batchDraw();
      }
    }, 800);
    
    return () => clearTimeout(cacheTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData.filters, isCropping]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        id={`image-${imageData.id}`}
        name={`image-${imageData.id}`}
        image={imageData.image}
        x={imageData.x}
        y={imageData.y}
        width={imageData.width}
        height={imageData.height}
        scaleX={imageData.scaleX}
        scaleY={imageData.scaleY}
        rotation={imageData.rotation}
        crop={imageData.crop}
        draggable={!isCropping && !isMultiTouchActive}
        onClick={onSelect}
        onTap={onSelect}
        opacity={1}
        onDragStart={(e) => {
          if (isMultiTouchActive) {
            logger.drag('BLOCKED - multi-touch active');
            e.evt.preventDefault();
            e.cancelBubble = true;
            return;
          }
          logger.drag('START');
        }}
        onDragEnd={(e) => {
          logger.drag(`Drag end: ${e.target.x().toFixed(0)} ${e.target.y().toFixed(0)}`)
          if (!isCropping) {
            onTransform(imageData.id, {
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
        onTransformStart={() => {
          // Ne pas clearCache pour garder les filtres visibles
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;
          
          let rotation = node.rotation();
          rotation = snapToGrid(rotation, snapRotation);

          onTransform(imageData.id, {
            x: node.x(),
            y: node.y(),
            rotation,
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          });
        }}
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
      
      {/* Transformer desktop */}
      {isSelected && !isCropping && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
      
      {/* Mode crop */}
      {isCropping && tempCropData && isSelected && (
        <>
          <Rect
            key={`crop-rect-${tempCropData.x}-${tempCropData.y}-${tempCropData.width}-${tempCropData.height}`}
            ref={cropRef}
            x={tempCropData.x}
            y={tempCropData.y}
            width={tempCropData.width}
            height={tempCropData.height}
            stroke="#FF0000"
            strokeWidth={5}
            dash={[15, 10]}
            fill="rgba(255, 0, 0, 0.05)"
            draggable
            dragBoundFunc={(pos) => {
              const stage = cropRef.current?.getStage();
              const imgNode = stage ? (stage.findOne(`.image-${imageData.id}`) as Konva.Image | null) : null;
              const boundingBox = imgNode
                ? imgNode.getClientRect({ skipStroke: true, skipShadow: true })
                : { x: imageData.x, y: imageData.y, width: imageData.width * imageData.scaleX, height: imageData.height * imageData.scaleY };
              const minX = boundingBox.x;
              const minY = boundingBox.y;
              const maxX = boundingBox.x + boundingBox.width - tempCropData.width;
              const maxY = boundingBox.y + boundingBox.height - tempCropData.height;
              return {
                x: Math.max(minX, Math.min(pos.x, maxX)),
                y: Math.max(minY, Math.min(pos.y, maxY)),
              };
            }}
            onDragEnd={(e) => {
              onCropChange({
                ...tempCropData,
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onTransformEnd={(e) => {
              const node = e.target as Konva.Rect;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              
              node.scaleX(1);
              node.scaleY(1);
              
              onCropChange({
                x: node.x(),
                y: node.y(),
                width: Math.max(20, node.width() * scaleX),
                height: Math.max(20, node.height() * scaleY),
              });
            }}
          />
          <Transformer
            ref={cropTrRef}
            rotateEnabled={false}
            borderStroke="#FF0000"
            borderStrokeWidth={3}
            anchorFill="#FF0000"
            anchorStroke="#fff"
            anchorSize={12}
            keepRatio={false}
          />
        </>
      )}
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export const ImageElement = memo(ImageElementInner);
