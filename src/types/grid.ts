/**
 * Grid system for photo collage layouts
 * Defines predefined zones where images can be placed
 */

export interface GridZone {
  id: string;
  x: number;      // Position X relative (0-1)
  y: number;      // Position Y relative (0-1)
  width: number;  // Largeur relative (0-1)
  height: number; // Hauteur relative (0-1)
  imageId?: string; // ID de l'image assignée à cette zone
}

export interface GridTemplate {
  id: string;
  name: string;
  zones: GridZone[];
  thumbnail?: string; // SVG ou data URI pour prévisualisation
}

/**
 * Grilles prédéfinies
 */
export const gridTemplates: GridTemplate[] = [
  {
    id: 'none',
    name: 'Libre',
    zones: [],
  },
  {
    id: '2-vertical',
    name: '2 Colonnes',
    zones: [
      { id: 'left', x: 0, y: 0, width: 0.5, height: 1 },
      { id: 'right', x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
  },
  {
    id: '2-horizontal',
    name: '2 Lignes',
    zones: [
      { id: 'top', x: 0, y: 0, width: 1, height: 0.5 },
      { id: 'bottom', x: 0, y: 0.5, width: 1, height: 0.5 },
    ],
  },
  {
    id: '3-horizontal',
    name: '3 Lignes',
    zones: [
      { id: 'top', x: 0, y: 0, width: 1, height: 0.333 },
      { id: 'middle', x: 0, y: 0.333, width: 1, height: 0.334 },
      { id: 'bottom', x: 0, y: 0.667, width: 1, height: 0.333 },
    ],
  },
  {
    id: '3-vertical',
    name: '3 Colonnes',
    zones: [
      { id: 'left', x: 0, y: 0, width: 0.333, height: 1 },
      { id: 'middle', x: 0.333, y: 0, width: 0.334, height: 1 },
      { id: 'right', x: 0.667, y: 0, width: 0.333, height: 1 },
    ],
  },
  {
    id: '4-grid',
    name: 'Grille 2×2',
    zones: [
      { id: 'tl', x: 0, y: 0, width: 0.5, height: 0.5 },
      { id: 'tr', x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { id: 'bl', x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { id: 'br', x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  {
    id: 'hero-left',
    name: 'Héro Gauche',
    zones: [
      { id: 'hero', x: 0, y: 0, width: 0.66, height: 1 },
      { id: 'top', x: 0.66, y: 0, width: 0.34, height: 0.5 },
      { id: 'bottom', x: 0.66, y: 0.5, width: 0.34, height: 0.5 },
    ],
  },
  {
    id: 'hero-right',
    name: 'Héro Droite',
    zones: [
      { id: 'top', x: 0, y: 0, width: 0.34, height: 0.5 },
      { id: 'bottom', x: 0, y: 0.5, width: 0.34, height: 0.5 },
      { id: 'hero', x: 0.34, y: 0, width: 0.66, height: 1 },
    ],
  },
  {
    id: 'hero-top',
    name: 'Héro Haut',
    zones: [
      { id: 'hero', x: 0, y: 0, width: 1, height: 0.66 },
      { id: 'left', x: 0, y: 0.66, width: 0.5, height: 0.34 },
      { id: 'right', x: 0.5, y: 0.66, width: 0.5, height: 0.34 },
    ],
  },
  {
    id: 'hero-bottom',
    name: 'Héro Bas',
    zones: [
      { id: 'left', x: 0, y: 0, width: 0.5, height: 0.34 },
      { id: 'right', x: 0.5, y: 0, width: 0.5, height: 0.34 },
      { id: 'hero', x: 0, y: 0.34, width: 1, height: 0.66 },
    ],
  },
  {
    id: 'asymmetric-1',
    name: 'Asymétrique 1',
    zones: [
      { id: 'large', x: 0, y: 0, width: 0.6, height: 0.7 },
      { id: 'small-1', x: 0.6, y: 0, width: 0.4, height: 0.4 },
      { id: 'small-2', x: 0.6, y: 0.4, width: 0.4, height: 0.3 },
      { id: 'bottom', x: 0, y: 0.7, width: 0.6, height: 0.3 },
    ],
  },
  {
    id: 'asymmetric-2',
    name: 'Asymétrique 2',
    zones: [
      { id: 'top-left', x: 0, y: 0, width: 0.4, height: 0.3 },
      { id: 'top-right', x: 0.4, y: 0, width: 0.6, height: 0.5 },
      { id: 'middle', x: 0, y: 0.3, width: 0.4, height: 0.4 },
      { id: 'bottom', x: 0, y: 0.7, width: 1, height: 0.3 },
      { id: 'small', x: 0.4, y: 0.5, width: 0.6, height: 0.2 },
    ],
  },
  {
    id: 'mosaic',
    name: 'Mosaïque',
    zones: [
      { id: 'z1', x: 0, y: 0, width: 0.33, height: 0.4 },
      { id: 'z2', x: 0.33, y: 0, width: 0.34, height: 0.6 },
      { id: 'z3', x: 0.67, y: 0, width: 0.33, height: 0.3 },
      { id: 'z4', x: 0, y: 0.4, width: 0.33, height: 0.3 },
      { id: 'z5', x: 0.67, y: 0.3, width: 0.33, height: 0.4 },
      { id: 'z6', x: 0, y: 0.7, width: 0.67, height: 0.3 },
      { id: 'z7', x: 0.33, y: 0.6, width: 0.34, height: 0.1 },
      { id: 'z8', x: 0.67, y: 0.7, width: 0.33, height: 0.3 },
    ],
  },
];

/**
 * Calcule les dimensions absolues d'une zone sur le canvas
 */
export const getAbsoluteZone = (
  zone: GridZone,
  canvasWidth: number,
  canvasHeight: number
) => ({
  x: zone.x * canvasWidth,
  y: zone.y * canvasHeight,
  width: zone.width * canvasWidth,
  height: zone.height * canvasHeight,
});

/**
 * Trouve la zone la plus proche d'un point
 */
export const findClosestZone = (
  x: number,
  y: number,
  zones: GridZone[],
  canvasWidth: number,
  canvasHeight: number
): GridZone | null => {
  if (zones.length === 0) return null;

  let closestZone: GridZone | null = null;
  let minDistance = Infinity;

  zones.forEach(zone => {
    const abs = getAbsoluteZone(zone, canvasWidth, canvasHeight);
    const centerX = abs.x + abs.width / 2;
    const centerY = abs.y + abs.height / 2;
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestZone = zone;
    }
  });

  return closestZone;
};
