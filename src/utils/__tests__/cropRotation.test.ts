import { describe, it, expect } from 'vitest';

// Fonction de calcul de bounding box pour images rotatées
export const calculateCropBoundingBox = (img: any) => {
  const displayWidth = img.width * img.scaleX;
  const displayHeight = img.height * img.scaleY;
  
  let cropX, cropY, cropWidth, cropHeight;
  
  if (img.rotation === 0 || img.rotation === 360) {
    // Cas simple : pas de rotation
    cropX = img.x;
    cropY = img.y;
    cropWidth = displayWidth;
    cropHeight = displayHeight;
  } else {
    // Cas avec rotation : calculer le bounding box de l'image rotatée
    const centerX = img.x + displayWidth / 2;
    const centerY = img.y + displayHeight / 2;
    
    // Calculer les 4 coins de l'image rotatée
    const corners = [
      { x: -displayWidth/2, y: -displayHeight/2 },
      { x: displayWidth/2, y: -displayHeight/2 },
      { x: displayWidth/2, y: displayHeight/2 },
      { x: -displayWidth/2, y: displayHeight/2 }
    ];
    
    // Rotation des coins
    const radians = (img.rotation * Math.PI) / 180;
    const rotatedCorners = corners.map(corner => ({
      x: corner.x * Math.cos(radians) - corner.y * Math.sin(radians),
      y: corner.x * Math.sin(radians) + corner.y * Math.cos(radians)
    }));
    
    // Calculer le bounding box
    const minX = Math.min(...rotatedCorners.map(c => c.x));
    const maxX = Math.max(...rotatedCorners.map(c => c.x));
    const minY = Math.min(...rotatedCorners.map(c => c.y));
    const maxY = Math.max(...rotatedCorners.map(c => c.y));
    
    cropX = centerX + minX;
    cropY = centerY + minY;
    cropWidth = maxX - minX;
    cropHeight = maxY - minY;
  }
  
  return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
};

describe('Crop Rotation Tests', () => {
  describe('calculateCropBoundingBox', () => {
    it('devrait retourner les coordonnées exactes pour une image sans rotation', () => {
      const img = {
        x: 100,
        y: 50,
        width: 200,
        height: 150,
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: 0
      };
      
      const result = calculateCropBoundingBox(img);
      
      expect(result.x).toBe(100);
      expect(result.y).toBe(50);
      expect(result.width).toBe(300); // 200 * 1.5
      expect(result.height).toBe(225); // 150 * 1.5
    });
    
    it('devrait calculer correctement le bounding box pour une image rotatée à 180°', () => {
      const img = {
        x: 100,
        y: 50,
        width: 200,
        height: 150,
        scaleX: 1,
        scaleY: 1,
        rotation: 180
      };
      
      const result = calculateCropBoundingBox(img);
      
      // Pour une rotation 180°, les dimensions restent les mêmes
      expect(result.width).toBeCloseTo(200, 1);
      expect(result.height).toBeCloseTo(150, 1);
      // Le centre reste le même
      expect(result.x + result.width/2).toBeCloseTo(100 + 200/2, 1);
      expect(result.y + result.height/2).toBeCloseTo(50 + 150/2, 1);
    });
    
    it('devrait gérer correctement une image agrandie et rotatée à 180°', () => {
      const img = {
        x: 100,
        y: 50,
        width: 200,
        height: 150,
        scaleX: 2,
        scaleY: 2,
        rotation: 180
      };
      
      const result = calculateCropBoundingBox(img);
      
      // Dimensions après scale (rotation 180° ne change pas les dimensions)
      expect(result.width).toBeCloseTo(400, 1); // 200 * 2
      expect(result.height).toBeCloseTo(300, 1); // 150 * 2
      // Le centre reste le même
      expect(result.x + result.width/2).toBeCloseTo(100 + 400/2, 1);
      expect(result.y + result.height/2).toBeCloseTo(50 + 300/2, 1);
    });
  });
});
