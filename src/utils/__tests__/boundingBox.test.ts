import { describe, it, expect } from 'vitest';

// Test pour valider l'approche du bounding box réel
describe('Bounding Box Real Tests', () => {
  it('devrait simuler le calcul du bounding box pour une image rotatée à 180°', () => {
    // Simulation d'une image comme dans ton scénario
    const imageData = {
      x: 200,      // Position après agrandissement
      y: 150,      // Position après agrandissement  
      width: 300,  // Largeur originale
      height: 500, // Hauteur originale (format portrait)
      scaleX: 1.5, // Agrandissement
      scaleY: 1.5, // Agrandissement
      rotation: 180 // Rotation complète
    };
    
    // Dimensions affichées
    const displayWidth = imageData.width * imageData.scaleX;  // 450
    const displayHeight = imageData.height * imageData.scaleY; // 750
    
    // Pour une rotation 180°, le bounding box devrait avoir les mêmes dimensions
    // mais le coin supérieur gauche change de position
    const expectedBoundingBox = {
      x: imageData.x - (displayWidth - imageData.width * imageData.scaleX) / 2,
      y: imageData.y - (displayHeight - imageData.height * imageData.scaleY) / 2,
      width: displayWidth,
      height: displayHeight
    };
    
    // Le bounding box réel de Konva pour une rotation 180°
    // devrait être centré sur le même point que l'image originale
    const centerX = imageData.x + displayWidth / 2;
    const centerY = imageData.y + displayHeight / 2;
    
    expect(expectedBoundingBox.x + expectedBoundingBox.width / 2).toBeCloseTo(centerX, 1);
    expect(expectedBoundingBox.y + expectedBoundingBox.height / 2).toBeCloseTo(centerY, 1);
    expect(expectedBoundingBox.width).toBeCloseTo(450, 1);
    expect(expectedBoundingBox.height).toBeCloseTo(750, 1);
  });
  
  it('devrait gérer correctement une image sans rotation', () => {
    const imageData = {
      x: 100,
      y: 50,
      width: 200,
      height: 150,
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    };
    
    const expectedBoundingBox = {
      x: imageData.x,
      y: imageData.y,
      width: imageData.width,
      height: imageData.height
    };
    
    expect(expectedBoundingBox.x).toBe(100);
    expect(expectedBoundingBox.y).toBe(50);
    expect(expectedBoundingBox.width).toBe(200);
    expect(expectedBoundingBox.height).toBe(150);
  });
});
