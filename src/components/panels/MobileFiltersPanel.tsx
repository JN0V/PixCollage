import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
}

interface MobileFiltersPanelProps {
  show: boolean;
  isLandscape: boolean;
  filters: FilterValues | null;
  onFilterChange: (key: keyof FilterValues, value: number | boolean) => void;
  onReset: () => void;
  onClose: () => void;
}

const MobileFiltersPanelInner: React.FC<MobileFiltersPanelProps> = ({
  show,
  isLandscape,
  filters,
  onFilterChange,
  onReset,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!show || !filters) return null;

  return (
    <div
      className={`fixed z-40 ${
        isLandscape ? 'left-0 top-0 bottom-0 w-[280px]' : 'inset-x-0 bottom-16'
      }`}
    >
      <div className="mx-auto max-w-xl px-3">
        <div className="bg-white/95 backdrop-blur border border-gray-200 shadow-xl rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-800">{t('sidebar.filters')}</div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100"
              title="Fermer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {/* Brightness */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Luminosité</span>
                <span className="text-indigo-600">{filters.brightness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.brightness}
                onChange={(e) => onFilterChange('brightness', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Contraste</span>
                <span className="text-indigo-600">{filters.contrast}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.contrast}
                onChange={(e) => onFilterChange('contrast', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Saturation</span>
                <span className="text-indigo-600">{filters.saturation}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.saturation}
                onChange={(e) => onFilterChange('saturation', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Flou</span>
                <span className="text-indigo-600">{filters.blur}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={filters.blur}
                onChange={(e) => onFilterChange('blur', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Grayscale & Sepia */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onFilterChange('grayscale', !filters.grayscale)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  filters.grayscale
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                N&B
              </button>
              <button
                onClick={() => onFilterChange('sepia', !filters.sepia)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  filters.sepia
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                Sépia
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={onReset}
                className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {t('mobile.reset') || 'Réinitialiser'}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                {t('mobile.apply') || 'Appliquer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileFiltersPanel = memo(MobileFiltersPanelInner);
