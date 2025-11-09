import { useCallback, useState } from 'react';
import Konva from 'konva';
import { logger } from '../utils/logger';

interface MultiTouchState {
  isActive: boolean;
  startDistance: number | null;
  startRotation: number | null;
  initialScale: { x: number; y: number };
  initialRotation: number;
}

interface UseMultiTouchGesturesProps {
  nodeRef: React.RefObject<Konva.Image | Konva.Text | null>;
  onTransformEnd: (transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
  }) => void;
  snapRotation?: boolean;
  enabled?: boolean;
}

const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const getTouchAngle = (touch1: Touch, touch2: Touch): number => {
  return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
};

const snapToGrid = (rotation: number): number => {
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

export const useMultiTouchGestures = ({
  nodeRef,
  onTransformEnd,
  snapRotation = true,
  enabled = true,
}: UseMultiTouchGesturesProps) => {
  const [state, setState] = useState<MultiTouchState>({
    isActive: false,
    startDistance: null,
    startRotation: null,
    initialScale: { x: 1, y: 1 },
    initialRotation: 0,
  });

  const handleTouchStart = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    if (!enabled) return;
    
    const evt = e.evt as TouchEvent;
    logger.gesture(`TouchStart - fingers: ${evt.touches.length}, wasActive: ${state.isActive}`);

    // Si multi-touch était actif mais qu'on a maintenant moins de 2 doigts, terminer le multi-touch
    if (state.isActive && evt.touches.length < 2) {
      logger.gesture('Multi-touch RESET - not enough fingers');
      setState({
        isActive: false,
        startDistance: null,
        startRotation: null,
        initialScale: { x: 1, y: 1 },
        initialRotation: 0,
      });
      return;
    }

    // Multi-touch détecté (2+ doigts)
    if (evt.touches.length === 2) {
      evt.preventDefault();
      e.cancelBubble = true; // Empêcher la propagation

      const node = nodeRef.current;
      if (!node) return;

      const touch1 = evt.touches[0];
      const touch2 = evt.touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const angle = getTouchAngle(touch1, touch2);

      logger.gesture(`Multi-touch START - distance: ${distance.toFixed(0)} angle: ${angle.toFixed(1)}`);

      setState({
        isActive: true,
        startDistance: distance,
        startRotation: angle,
        initialScale: { x: node.scaleX(), y: node.scaleY() },
        initialRotation: node.rotation(),
      });
    }
  }, [enabled, nodeRef, state.isActive]);

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    if (!enabled || !state.isActive) return;

    const evt = e.evt as TouchEvent;

    if (evt.touches.length === 2) {
      evt.preventDefault();
      e.cancelBubble = true;

      const node = nodeRef.current;
      if (!node || state.startDistance === null || state.startRotation === null) return;

      const touch1 = evt.touches[0];
      const touch2 = evt.touches[1];

      // Pinch to zoom
      const currentDistance = getTouchDistance(touch1, touch2);
      const scale = currentDistance / state.startDistance;
      node.scaleX(state.initialScale.x * scale);
      node.scaleY(state.initialScale.y * scale);

      // Rotation
      const currentRotation = getTouchAngle(touch1, touch2);
      const rotationDelta = currentRotation - state.startRotation;
      node.rotation(state.initialRotation + rotationDelta);

      node.getLayer()?.batchDraw();
    }
  }, [enabled, state, nodeRef]);

  const handleTouchEnd = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    if (!enabled) return;

    const evt = e.evt as TouchEvent;
    logger.gesture(`TouchEnd - remaining: ${evt.touches.length} wasActive: ${state.isActive}`);

    // Fin du geste multi-touch dès qu'on passe SOUS 2 doigts
    if (state.isActive && evt.touches.length < 2) {
      const node = nodeRef.current;
      if (node) {
        let rotation = node.rotation();

        // Snap rotation
        if (snapRotation) {
          const snapped = snapToGrid(rotation);
          if (snapped !== rotation) {
            rotation = snapped;
            node.rotation(rotation);
            logger.gesture(`Rotation snapped to: ${rotation}`);
          }
        }

        logger.gesture('Multi-touch END - Saving transform');
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation,
        });
      }

      // Reset state
      setState({
        isActive: false,
        startDistance: null,
        startRotation: null,
        initialScale: { x: 1, y: 1 },
        initialRotation: 0,
      });
    }
  }, [enabled, state.isActive, nodeRef, snapRotation, onTransformEnd]);

  return {
    isMultiTouchActive: state.isActive,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
