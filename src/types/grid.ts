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
  elementId?: string | null; // ID de l'élément dans cette zone (1 seul)
  imageId?: string; // ID de l'image assignée à cette zone
  // Pour formes non-rectangulaires (triangles, polygones)
  clipPath?: Array<{x: number, y: number}>; // Points du polygone en coordonnées relatives (0-1)
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
    id: 'grid-2x2',
    name: 'Grille 2×2',
    zones: [
      { id: 'tl', x: 0, y: 0, width: 0.5, height: 0.5 },
      { id: 'tr', x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { id: 'bl', x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { id: 'br', x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  {
    id: 'grid-3x3',
    name: 'Grille 3×3',
    zones: [
      { id: 'r1c1', x: 0, y: 0, width: 0.333, height: 0.333 },
      { id: 'r1c2', x: 0.333, y: 0, width: 0.334, height: 0.333 },
      { id: 'r1c3', x: 0.667, y: 0, width: 0.333, height: 0.333 },
      { id: 'r2c1', x: 0, y: 0.333, width: 0.333, height: 0.334 },
      { id: 'r2c2', x: 0.333, y: 0.333, width: 0.334, height: 0.334 },
      { id: 'r2c3', x: 0.667, y: 0.333, width: 0.333, height: 0.334 },
      { id: 'r3c1', x: 0, y: 0.667, width: 0.333, height: 0.333 },
      { id: 'r3c2', x: 0.333, y: 0.667, width: 0.334, height: 0.333 },
      { id: 'r3c3', x: 0.667, y: 0.667, width: 0.333, height: 0.333 },
    ],
  },
  {
    id: 'grid-2x3',
    name: 'Grille 2×3',
    zones: [
      { id: 'r1c1', x: 0, y: 0, width: 0.5, height: 0.333 },
      { id: 'r1c2', x: 0.5, y: 0, width: 0.5, height: 0.333 },
      { id: 'r2c1', x: 0, y: 0.333, width: 0.5, height: 0.334 },
      { id: 'r2c2', x: 0.5, y: 0.333, width: 0.5, height: 0.334 },
      { id: 'r3c1', x: 0, y: 0.667, width: 0.5, height: 0.333 },
      { id: 'r3c2', x: 0.5, y: 0.667, width: 0.5, height: 0.333 },
    ],
  },
  {
    id: 'grid-3x4',
    name: 'Grille 3×4',
    zones: [
      { id: 'r1c1', x: 0, y: 0, width: 0.333, height: 0.25 },
      { id: 'r1c2', x: 0.333, y: 0, width: 0.334, height: 0.25 },
      { id: 'r1c3', x: 0.667, y: 0, width: 0.333, height: 0.25 },
      { id: 'r2c1', x: 0, y: 0.25, width: 0.333, height: 0.25 },
      { id: 'r2c2', x: 0.333, y: 0.25, width: 0.334, height: 0.25 },
      { id: 'r2c3', x: 0.667, y: 0.25, width: 0.333, height: 0.25 },
      { id: 'r3c1', x: 0, y: 0.5, width: 0.333, height: 0.25 },
      { id: 'r3c2', x: 0.333, y: 0.5, width: 0.334, height: 0.25 },
      { id: 'r3c3', x: 0.667, y: 0.5, width: 0.333, height: 0.25 },
      { id: 'r4c1', x: 0, y: 0.75, width: 0.333, height: 0.25 },
      { id: 'r4c2', x: 0.333, y: 0.75, width: 0.334, height: 0.25 },
      { id: 'r4c3', x: 0.667, y: 0.75, width: 0.333, height: 0.25 },
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
    id: 'diagonal-split',
    name: 'Diagonale Simple',
    zones: [
      { 
        id: 'top-left', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}] // Triangle haut-gauche
      },
      { 
        id: 'bottom-right', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}] // Triangle bas-droite
      },
    ],
  },
  {
    id: 'diagonal-inverse',
    name: 'Diagonale Inverse',
    zones: [
      { 
        id: 'top-right', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}] // Triangle haut-droite
      },
      { 
        id: 'bottom-left', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}] // Triangle bas-gauche
      },
    ],
  },
  {
    id: 'diagonal-cross',
    name: 'Croix Diagonale',
    zones: [
      { 
        id: 'top', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0.5, y: 0.5}]
      },
      { 
        id: 'right', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 1, y: 0}, {x: 1, y: 1}, {x: 0.5, y: 0.5}]
      },
      { 
        id: 'bottom', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 1, y: 1}, {x: 0, y: 1}, {x: 0.5, y: 0.5}]
      },
      { 
        id: 'left', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0.5, y: 0.5}]
      },
    ],
  },
  {
    id: 'zigzag-3',
    name: 'Zigzag 3',
    zones: [
      { 
        id: 'z1', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 0.4, y: 0}, {x: 0.6, y: 0.5}, {x: 0, y: 0.5}]
      },
      { 
        id: 'z2', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0.4, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0.4, y: 1}, {x: 0.6, y: 0.5}]
      },
      { 
        id: 'z3', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0.5}, {x: 0.6, y: 0.5}, {x: 0.4, y: 1}, {x: 0, y: 1}]
      },
    ],
  },
  {
    id: 'broken-mirror',
    name: 'Miroir Brisé',
    zones: [
      { 
        id: 'shard1', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 0.3, y: 0}, {x: 0.45, y: 0.4}, {x: 0, y: 0.5}]
      },
      { 
        id: 'shard2', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0.3, y: 0}, {x: 0.7, y: 0}, {x: 0.55, y: 0.35}, {x: 0.45, y: 0.4}]
      },
      { 
        id: 'shard3', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0.7, y: 0}, {x: 1, y: 0}, {x: 1, y: 0.6}, {x: 0.55, y: 0.35}]
      },
      { 
        id: 'shard4', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0.5}, {x: 0.45, y: 0.4}, {x: 0.5, y: 0.7}, {x: 0, y: 1}]
      },
      { 
        id: 'shard5', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0.45, y: 0.4}, {x: 0.55, y: 0.35}, {x: 1, y: 0.6}, {x: 0.6, y: 1}, {x: 0.5, y: 0.7}]
      },
      { 
        id: 'shard6', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 1}, {x: 0.5, y: 0.7}, {x: 0.6, y: 1}]
      },
      { 
        id: 'shard7', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0.6, y: 1}, {x: 1, y: 0.6}, {x: 1, y: 1}]
      },
    ],
  },
  {
    id: 'lightning',
    name: 'Éclair',
    zones: [
      { 
        id: 'left', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0, y: 0}, {x: 0.4, y: 0}, {x: 0.3, y: 0.3}, {x: 0.5, y: 0.5}, {x: 0.35, y: 0.7}, {x: 0.45, y: 1}, {x: 0, y: 1}]
      },
      { 
        id: 'right', 
        x: 0, y: 0, width: 1, height: 1,
        clipPath: [{x: 0.4, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0.45, y: 1}, {x: 0.35, y: 0.7}, {x: 0.5, y: 0.5}, {x: 0.3, y: 0.3}]
      },
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
