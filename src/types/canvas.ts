export interface BaseElement {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  image: HTMLImageElement;
  width: number;
  height: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    grayscale: boolean;
    sepia: boolean;
  };
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bold italic';
  align?: 'left' | 'center' | 'right';
  width?: number;
}

export interface EmojiElement extends BaseElement {
  type: 'emoji';
  emoji: string;
  fontSize: number;
}

export interface StickerElement extends BaseElement {
  type: 'sticker';
  stickerId: string;
  category: 'stars' | 'sparkles' | 'hearts' | 'explosion';
  size: number; // Base size in pixels
}

export type CanvasElement = ImageElement | TextElement | EmojiElement | StickerElement;

export interface TempCropData {
  x: number;
  y: number;
  width: number;
  height: number;
  originalRotation?: number; // Store original rotation when cropping rotated images
}

export interface CanvasPreset {
  id: string;
  name: string;
  width: number;
  height: number;
}

export const canvasPresets: CanvasPreset[] = [
  { id: 'default', name: 'Défaut', width: 800, height: 600 },
  { id: 'square', name: 'Carré', width: 1080, height: 1080 },
  { id: 'ig-post', name: 'Instagram Post', width: 1080, height: 1080 },
  { id: 'ig-story', name: 'Instagram Story', width: 1080, height: 1920 },
  { id: 'fb-post', name: 'Facebook Post', width: 1200, height: 630 },
  { id: 'portrait', name: 'Portrait', width: 800, height: 1200 },
  { id: 'landscape', name: 'Paysage', width: 1200, height: 800 },
];
