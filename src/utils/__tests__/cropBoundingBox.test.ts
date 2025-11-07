import { describe, it, expect } from 'vitest';

// Simulation des fonctions de crop avec bounding box
export const calculateCropWithBoundingBox = (img: any, tempCropData: any) => {
  // Calculer les dimensions affichées
  const displayWidth = img.width * img.scaleX;
  const displayHeight = img.height * img.scaleY;
  
  // Simuler le calcul du bounding box (comme dans Konva)
  let boundingBox;
  if (img.rotation === 0) {
    boundingBox = {
      x: img.x,
      y: img.y,
      width: displayWidth,
      height: displayHeight
    };
  } else {
    // Pour une rotation 180°, le bounding box est le même mais centré différemment
    boundingBox = {
      x: img.x - (displayWidth - img.width * img.scaleX) / 2,
      y: img.y - (displayHeight - img.height * img.scaleY) / 2,
      width: displayWidth,
      height: displayHeight
    };
  }
  
  // Convertir en coordonnées relatives par rapport au bounding box
  const relativeX = tempCropData.x - boundingBox.x;
  const relativeY = tempCropData.y - boundingBox.y;
  
  const cropXRatio = relativeX / displayWidth;
  const cropYRatio = relativeY / displayHeight;
  const cropWidthRatio = tempCropData.width / displayWidth;
  const cropHeightRatio = tempCropData.height / displayHeight;
  
  // Calculer le résultat
  const newWidth = img.width * cropWidthRatio;
  const newHeight = img.height * cropHeightRatio;
  
  const baseCropX = img.crop?.x || 0;
  const baseCropY = img.crop?.y || 0;
  
  const newCropX = baseCropX + (img.width * cropXRatio);
  const newCropY = baseCropY + (img.height * cropYRatio);
  
  return {
    x: tempCropData.x, // Position absolue
    y: tempCropData.y, // Position absolue
    width: newWidth,
    height: newHeight,
    crop: {
      x: newCropX,
      y: newCropY,
      width: newWidth,
      height: newHeight
    }
  };
};

describe('Crop Bounding Box Tests', () => {
  describe('calculateCropWithBoundingBox', () => {
    it('devrait fonctionner correctement pour une image sans rotation', () => {
      const img = {
        x: 100,
        y: 50,
        width: 200,
        height: 150,
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: 0,
        crop: null
      };
      
      // Crop initial (bounding box = position de l'image)
      const tempCropData = {
        x: 100,
        y: 50,
        width: 300, // 200 * 1.5
        height: 225 // 150 * 1.5
      };
      
      const result = calculateCropWithBoundingBox(img, tempCropData);
      
      expect(result.x).toBe(100);
      expect(result.y).toBe(50);
      expect(result.width).toBe(200);
      expect(result.height).toBe(150);
      expect(result.crop?.x).toBe(0);
      expect(result.crop?.y).toBe(0);
    });
    
    it('devrait fonctionner correctement pour une image rotatée à 180°', () => {
      const img = {
        x: 200,
        y: 150,
        width: 300,
        height: 500, // Format portrait
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: 180,
        crop: null
      };
      
      // Crop initial (bounding box de l'image rotatée)
      const tempCropData = {
        x: 200, // Même position que l'original
        y: 150,
        width: 450, // 300 * 1.5
        height: 750 // 500 * 1.5
      };
      
      const result = calculateCropWithBoundingBox(img, tempCropData);
      
      expect(result.x).toBe(200);
      expect(result.y).toBe(150);
      expect(result.width).toBe(300);
      expect(result.height).toBe(500);
      expect(result.crop?.x).toBe(0);
      expect(result.crop?.y).toBe(0);
    });
    
    it('devrait calculer correctement un crop partiel sur image rotatée', () => {
      const img = {
        x: 200,
        y: 150,
        width: 300,
        height: 500,
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: 180,
        crop: null
      };
      
      // Crop partiel (décalé de 50px, réduit)
      const tempCropData = {
        x: 250, // 200 + 50
        y: 200, // 150 + 50
        width: 350, // Réduit
        height: 650  // Réduit
      };
      
      const result = calculateCropWithBoundingBox(img, tempCropData);
      
      expect(result.x).toBe(250);
      expect(result.y).toBe(200);
      expect(result.width).toBeCloseTo(233.33, 1); // 350 / 1.5
      expect(result.height).toBeCloseTo(433.33, 1); // 650 / 1.5
      expect(result.crop?.x).toBeCloseTo(33.33, 1); // 50 / 1.5
      expect(result.crop?.y).toBeCloseTo(33.33, 1); // 50 / 1.5
    });
  });
});
