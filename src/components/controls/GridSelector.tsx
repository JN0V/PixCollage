import React from 'react';
import { gridTemplates } from '../../types/grid';

interface GridSelectorProps {
  selectedGridId: string;
  onSelectGrid: (gridId: string) => void;
  show: boolean;
  onClose: () => void;
}

export const GridSelector: React.FC<GridSelectorProps> = ({
  selectedGridId,
  onSelectGrid,
  show,
  onClose,
}) => {
  if (!show) return null;

  const handleSelect = (gridId: string) => {
    onSelectGrid(gridId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Choisir une grille</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gridTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`group relative aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                  selectedGridId === template.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-400 bg-white'
                }`}
              >
                <div className="absolute inset-2 flex items-center justify-center">
                  <GridPreview zones={template.zones} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs font-medium text-white text-center">{template.name}</p>
                </div>
                {selectedGridId === template.id && (
                  <div className="absolute top-2 right-2">
                    <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface GridPreviewProps {
  zones: Array<{ x: number; y: number; width: number; height: number }>;
}

const GridPreview: React.FC<GridPreviewProps> = ({ zones }) => {
  if (zones.length === 0) {
    return (
      <div className="text-gray-400 text-xs">Mode libre</div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {zones.map((zone, i) => (
        <rect
          key={i}
          x={zone.x * 100}
          y={zone.y * 100}
          width={zone.width * 100}
          height={zone.height * 100}
          fill="rgb(99, 102, 241)"
          fillOpacity="0.2"
          stroke="rgb(99, 102, 241)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
};
