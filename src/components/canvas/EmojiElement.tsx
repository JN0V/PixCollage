import React, { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { useMultiTouchGestures } from '../../hooks/useMultiTouchGestures';

interface EmojiData {
  id: string;
  x: number;
  y: number;
  emoji: string;
  fontSize: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface EmojiElementProps {
  emojiData: EmojiData;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, updates: Partial<Omit<EmojiData, 'id'>>) => void;
}

export const EmojiElement: React.FC<EmojiElementProps> = ({
  emojiData,
  isSelected,
  onSelect,
  onTransform,
}) => {
  const emojiRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Multi-touch gestures
  const { isMultiTouchActive, handlers: multiTouchHandlers } = useMultiTouchGestures({
    nodeRef: emojiRef,
    onTransformEnd: (transform) => {
      const node = emojiRef.current;
      if (!node) return;
      
      const scaleChange = Math.max(transform.scaleX, transform.scaleY);
      onTransform(emojiData.id, {
        ...transform,
        fontSize: Math.max(12, emojiData.fontSize * scaleChange),
        scaleX: 1,
        scaleY: 1,
      });
    },
    snapRotation: true,
    enabled: true,
  });

  useEffect(() => {
    if (isSelected && trRef.current && emojiRef.current) {
      trRef.current.nodes([emojiRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={emojiRef}
        text={emojiData.emoji}
        x={emojiData.x}
        y={emojiData.y}
        fontSize={emojiData.fontSize}
        rotation={emojiData.rotation}
        scaleX={emojiData.scaleX}
        scaleY={emojiData.scaleY}
        draggable={!isMultiTouchActive}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onTransform(emojiData.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = e.target as Konva.Text;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onTransform(emojiData.id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(12, emojiData.fontSize * Math.max(scaleX, scaleY)),
            scaleX: 1,
            scaleY: 1,
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
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          borderStroke="#A855F7"
          borderStrokeWidth={2}
          anchorFill="#A855F7"
          anchorStroke="#fff"
          anchorSize={8}
        />
      )}
    </>
  );
};
