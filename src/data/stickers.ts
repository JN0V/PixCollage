export interface Sticker {
  id: string;
  category: 'stars' | 'sparkles' | 'hearts' | 'explosion';
  imageUrl: string; // Path to PNG image or data URI
  name: string;
  previewEmoji: string; // For modal preview before we have images
}

// Sticker library with SVG files in public/stickers/
export const stickerLibrary: Sticker[] = [
  // Stars - Groupes d'étoiles
  { 
    id: 'stars-group-1', 
    category: 'stars', 
    imageUrl: './stickers/stars-group-1.svg',
    name: 'Groupe étoiles',
    previewEmoji: '⭐⭐⭐'
  },
  { 
    id: 'stars-group-2', 
    category: 'stars', 
    imageUrl: './stickers/stars-group-2.svg',
    name: 'Constellation',
    previewEmoji: '⭐✨⭐✨⭐✨⭐'
  },
  { 
    id: 'stars-group-3', 
    category: 'stars', 
    imageUrl: './stickers/stars-group-3.svg',
    name: 'Étoiles filantes',
    previewEmoji: '🌠🌟💫'
  },
  
  // Sparkles - Effets brillants
  { 
    id: 'sparkles-1', 
    category: 'sparkles', 
    imageUrl: './stickers/sparkles-1.svg',
    name: 'Paillettes',
    previewEmoji: '✨✨✨'
  },
  { 
    id: 'sparkles-2', 
    category: 'sparkles', 
    imageUrl: './stickers/sparkles-2.svg',
    name: 'Brillance',
    previewEmoji: '✨💫✨💫✨'
  },
  { 
    id: 'sparkles-3', 
    category: 'sparkles', 
    imageUrl: './stickers/sparkles-3.svg',
    name: 'Scintillement',
    previewEmoji: '✨✨✨✨✨✨✨'
  },
  
  // Hearts - Groupes de cœurs
  { 
    id: 'hearts-1', 
    category: 'hearts', 
    imageUrl: './stickers/hearts-1.svg',
    name: 'Cœurs multiples',
    previewEmoji: '💕💖💕'
  },
  { 
    id: 'hearts-2', 
    category: 'hearts', 
    imageUrl: './stickers/hearts-2.svg',
    name: 'Cœurs tournants',
    previewEmoji: '💖💕💖💕💖'
  },
  { 
    id: 'hearts-3', 
    category: 'hearts', 
    imageUrl: './stickers/hearts-3.svg',
    name: 'Explosion cœurs',
    previewEmoji: '💕💕💕💕💕'
  },
  
  // Explosion - Effets d'explosion
  { 
    id: 'explosion-1', 
    category: 'explosion', 
    imageUrl: './stickers/explosion-1.svg',
    name: 'Boom',
    previewEmoji: '💥💥💥'
  },
  { 
    id: 'explosion-2', 
    category: 'explosion', 
    imageUrl: './stickers/explosion-2.svg',
    name: 'Feux d\'artifice',
    previewEmoji: '🎆🎇🎆🎇'
  },
  { 
    id: 'explosion-3', 
    category: 'explosion', 
    imageUrl: './stickers/explosion-3.svg',
    name: 'Éclatement',
    previewEmoji: '💫🌟💫🌟💫'
  },
];

export const getStickersByCategory = (category: 'stars' | 'sparkles' | 'hearts' | 'explosion') => {
  return stickerLibrary.filter(s => s.category === category);
};

export const getStickerById = (id: string) => {
  return stickerLibrary.find(s => s.id === id);
};
