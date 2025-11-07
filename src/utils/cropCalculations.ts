import type { ImageElement, CropData, TempCropData } from '../types/image';

/**
 * Calcule les dimensions affichées d'une image avec son scale
 */
export function getDisplayDimensions(image: ImageElement) {
  return {
    width: image.width * image.scaleX,
    height: image.height * image.scaleY
  };
}

/**
 * Initialise les données de crop pour couvrir toute l'image visible
 * CORRECTION : Force toujours un réinitialisation complète pour éviter les bugs
 */
export function initializeCropData(image: ImageElement): TempCropData {
  const display = getDisplayDimensions(image);
  
  console.log('=== INITIALIZE CROP ===');
  console.log('Image:', { 
    x: image.x, y: image.y, 
    width: image.width, height: image.height, 
    scaleX: image.scaleX, scaleY: image.scaleY,
    crop: image.crop 
  });
  console.log('Display size:', display);
  
  // CORRECTION CRITIQUE : Force toujours (0, 0) comme point de départ
  // même si l'image a déjà été croppée
  const initialCropData = {
    x: 0,
    y: 0,
    width: display.width,
    height: display.height
  };
  
  console.log('Initial crop data:', initialCropData);
  console.log('Rectangle will be rendered at:', {
    x: image.x + initialCropData.x,
    y: image.y + initialCropData.y
  });
  
  return initialCropData;
}

/**
 * Applique le crop à une image
 * Utilise un système de ratios pour garantir la cohérence entre les crops successifs
 */
export function applyCropToImage(image: ImageElement, tempCropData: TempCropData): Partial<ImageElement> {
  console.log('=== APPLY CROP ===');
  console.log('Image actuelle:', { 
    x: image.x, y: image.y, 
    width: image.width, height: image.height, 
    scaleX: image.scaleX, scaleY: image.scaleY,
    crop: image.crop 
  });
  console.log('tempCropData (pixels affichés):', tempCropData);
  
  // Calculer les dimensions affichées de l'image
  const display = getDisplayDimensions(image);
  
  // Calculer les ratios du rectangle par rapport à l'image affichée
  const cropXRatio = tempCropData.x / display.width;
  const cropYRatio = tempCropData.y / display.height;
  const cropWidthRatio = tempCropData.width / display.width;
  const cropHeightRatio = tempCropData.height / display.height;
  
  console.log('Ratios:', { cropXRatio, cropYRatio, cropWidthRatio, cropHeightRatio });
  
  // Nouvelles dimensions en coordonnées source
  const newWidth = image.width * cropWidthRatio;
  const newHeight = image.height * cropHeightRatio;
  
  // Calculer la nouvelle position du crop dans l'image ORIGINALE
  const baseCropX = image.crop?.x || 0;
  const baseCropY = image.crop?.y || 0;
  
  const newCropX = baseCropX + (image.width * cropXRatio);
  const newCropY = baseCropY + (image.height * cropYRatio);
  
  // Nouvelle position sur le canvas (pour que la partie croppée reste au même endroit)
  const newX = image.x + tempCropData.x;
  const newY = image.y + tempCropData.y;
  
  console.log('Résultat:', {
    newX, newY,
    newWidth, newHeight,
    newCropX, newCropY
  });
  
  const newCrop: CropData = {
    x: newCropX,
    y: newCropY,
    width: newWidth,
    height: newHeight
  };
  
  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
    crop: newCrop
  };
}

/**
 * Valide et limite les coordonnées du rectangle de crop
 */
export function validateCropBounds(
  tempCropData: TempCropData, 
  image: ImageElement
): TempCropData {
  const display = getDisplayDimensions(image);
  
  // Limiter les coordonnées pour rester dans l'image
  const validX = Math.max(0, Math.min(tempCropData.x, display.width - 20));
  const validY = Math.max(0, Math.min(tempCropData.y, display.height - 20));
  const validWidth = Math.max(20, Math.min(tempCropData.width, display.width - validX));
  const validHeight = Math.max(20, Math.min(tempCropData.height, display.height - validY));
  
  return {
    x: validX,
    y: validY,
    width: validWidth,
    height: validHeight
  };
}
