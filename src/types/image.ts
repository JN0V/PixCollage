export interface ImageElement {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
  crop?: CropData;
  filters?: FilterData;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FilterData {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
}

export interface TempCropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageComponentProps {
  imageData: ImageElement;
  isSelected: boolean;
  isCropping: boolean;
  tempCropData: TempCropData | null;
  snapRotation: boolean;
  onSelect: () => void;
  onTransform: (id: string, newAttrs: Partial<Omit<ImageElement, 'id' | 'image'>>) => void;
  onCropChange: (data: TempCropData) => void;
}
