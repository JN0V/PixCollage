import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { stickerLibrary, type Sticker } from '../../data/stickers';

interface StickerPickerProps {
  show: boolean;
  onClose: () => void;
  onSelectSticker: (stickerId: string, category: 'stars' | 'sparkles' | 'hearts' | 'explosion') => void;
}

type Category = 'stars' | 'sparkles' | 'hearts' | 'explosion';

const categoryLabels: Record<Category, { name: string; emoji: string }> = {
  stars: { name: 'Étoiles', emoji: '⭐' },
  sparkles: { name: 'Brillants', emoji: '✨' },
  hearts: { name: 'Cœurs', emoji: '💖' },
  explosion: { name: 'Explosion', emoji: '💥' },
};

export const StickerPicker: React.FC<StickerPickerProps> = ({
  show,
  onClose,
  onSelectSticker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('stars');

  if (!show) return null;

  const filteredStickers = stickerLibrary.filter(s => s.category === selectedCategory);

  const handleStickerClick = (sticker: Sticker) => {
    onSelectSticker(sticker.id, sticker.category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Choisir un sticker</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-100 overflow-x-auto">
          {(Object.keys(categoryLabels) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-medium text-xs transition-all
                ${selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-2xl">{categoryLabels[cat].emoji}</span>
              <span>{categoryLabels[cat].name}</span>
            </button>
          ))}
        </div>

        {/* Sticker grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredStickers.map(sticker => (
              <button
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className="aspect-square flex flex-col items-center justify-center rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all active:scale-95 border-2 border-transparent hover:border-indigo-300 p-3"
                title={sticker.name}
              >
                <img 
                  src={sticker.imageUrl} 
                  alt={sticker.name}
                  className="w-full h-auto mb-2 flex-1 object-contain"
                />
                <span className="text-xs text-gray-600 text-center font-medium">{sticker.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Cliquez sur un sticker pour l'ajouter à votre composition
          </p>
        </div>
      </div>
    </div>
  );
};
