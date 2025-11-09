import React, { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from 'konva';

interface TextData {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface TextElementProps {
  textData: TextData;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, updates: Partial<Omit<TextData, 'id'>>) => void;
  onDoubleClick: (id: string, currentText: string) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  textData,
  isSelected,
  onSelect,
  onTransform,
  onDoubleClick,
}) => {
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        text={textData.text}
        x={textData.x}
        y={textData.y}
        fontSize={textData.fontSize}
        fontFamily={textData.fontFamily}
        fill={textData.fill}
        rotation={textData.rotation}
        scaleX={textData.scaleX}
        scaleY={textData.scaleY}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => onDoubleClick(textData.id, textData.text)}
        onDblTap={() => onDoubleClick(textData.id, textData.text)}
        onDragEnd={(e) => {
          onTransform(textData.id, {
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
          
          onTransform(textData.id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(5, textData.fontSize * Math.max(scaleX, scaleY)),
            scaleX: 1,
            scaleY: 1,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['middle-left', 'middle-right']}
          borderStroke="#3B82F6"
          borderStrokeWidth={2}
          anchorFill="#3B82F6"
          anchorStroke="#fff"
          anchorSize={8}
        />
      )}
    </>
  );
};
