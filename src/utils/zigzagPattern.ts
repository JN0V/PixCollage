/**
 * Generate zigzag pattern points for Konva Line
 */
export const getZigzagPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  amplitude: number = 5,
  frequency: number = 15
): number[] => {
  const points: number[] = [];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return [x1, y1, x2, y2];
  
  // Normalize direction
  const unitX = dx / length;
  const unitY = dy / length;
  
  // Perpendicular direction for zigzag
  const perpX = -unitY;
  const perpY = unitX;
  
  // Start point
  points.push(x1, y1);
  
  // Generate zigzag points
  let currentLength = 0;
  let zigzagUp = true;
  
  while (currentLength < length) {
    currentLength += frequency;
    if (currentLength > length) currentLength = length;
    
    const baseX = x1 + unitX * currentLength;
    const baseY = y1 + unitY * currentLength;
    
    if (currentLength < length) {
      const offset = zigzagUp ? amplitude : -amplitude;
      points.push(
        baseX + perpX * offset,
        baseY + perpY * offset
      );
      zigzagUp = !zigzagUp;
    } else {
      // End point
      points.push(x2, y2);
    }
  }
  
  return points;
};
