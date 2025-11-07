import { initializeCropData, applyCropToImage, validateCropBounds } from '../cropCalculations';
import { ImageElement, TempCropData } from '../../types/image';

describe('cropCalculations', () => {
  const mockImage: ImageElement = {
    id: 'test',
    image: new Image(),
    x: 100,
    y: 100,
    width: 500,
    height: 400,
    rotation: 0,
    scaleX: 1.5,
    scaleY: 1.5,
    zIndex: 1
  };

  describe('initializeCropData', () => {
    it('should initialize crop data covering entire visible image', () => {
      const result = initializeCropData(mockImage);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.width).toBe(750); // 500 * 1.5
      expect(result.height).toBe(600); // 400 * 1.5
    });

    it('should work with different scale values', () => {
      const scaledImage = { ...mockImage, scaleX: 0.5, scaleY: 0.5 };
      const result = initializeCropData(scaledImage);
      
      expect(result.width).toBe(250); // 500 * 0.5
      expect(result.height).toBe(200); // 400 * 0.5
    });
  });

  describe('validateCropBounds', () => {
    it('should keep crop within image bounds', () => {
      const cropData: TempCropData = { x: 700, y: 500, width: 100, height: 100 };
      const result = validateCropBounds(cropData, mockImage);
      
      expect(result.x).toBeLessThanOrEqual(750 - 20); // displayWidth - minWidth
      expect(result.y).toBeLessThanOrEqual(600 - 20); // displayHeight - minHeight
    });

    it('should enforce minimum size', () => {
      const cropData: TempCropData = { x: 0, y: 0, width: 5, height: 5 };
      const result = validateCropBounds(cropData, mockImage);
      
      expect(result.width).toBeGreaterThanOrEqual(20);
      expect(result.height).toBeGreaterThanOrEqual(20);
    });
  });

  describe('applyCropToImage', () => {
    it('should calculate crop correctly for first crop', () => {
      const cropData: TempCropData = { x: 100, y: 50, width: 300, height: 200 };
      const result = applyCropToImage(mockImage, cropData);
      
      expect(result.x).toBe(200); // 100 + 100
      expect(result.y).toBe(150); // 100 + 50
      expect(result.width).toBe(200); // 300 / 1.5
      expect(result.height).toBeCloseTo(133.33, 1); // 200 / 1.5
      expect(result.crop?.x).toBeCloseTo(66.67, 1); // 100 / 1.5
      expect(result.crop?.y).toBeCloseTo(33.33, 1); // 50 / 1.5
    });

    it('should accumulate crops correctly', () => {
      const imageWithCrop: ImageElement = {
        ...mockImage,
        crop: { x: 50, y: 30, width: 400, height: 300 }
      };
      
      const cropData: TempCropData = { x: 50, y: 25, width: 200, height: 150 };
      const result = applyCropToImage(imageWithCrop, cropData);
      
      expect(result.crop?.x).toBeCloseTo(83.33, 1); // 50 + (50 / 1.5)
      expect(result.crop?.y).toBeCloseTo(46.67, 1); // 30 + (25 / 1.5)
    });
  });
});
