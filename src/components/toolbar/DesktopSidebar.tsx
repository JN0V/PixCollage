import { useTranslation } from 'react-i18next';
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ScissorsIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CanvasSize {
  width: number;
  height: number;
}

interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
}

interface DesktopSidebarProps {
  // File input
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFilesSelected: (files: FileList) => void;
  onAddImages: () => void;
  
  // Canvas size
  canvasSize: CanvasSize;
  onCanvasSizeChange: (size: CanvasSize) => void;
  
  // Snap rotation
  snapRotation: boolean;
  onSnapRotationToggle: () => void;
  
  // Element actions
  selectedId: string | null;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  
  // Crop
  isCropping: boolean;
  onStartCrop: () => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  
  // Filters
  tempFilters: FilterValues | null;
  onUpdateFilter: (key: keyof FilterValues, value: number | boolean) => void;
  onResetFilters: () => void;
  
  // Export
  exportMode: 'canvas' | 'content';
  onExportModeChange: (mode: 'canvas' | 'content') => void;
  onDelete: () => void;
  onClear: () => void;
  onExport: () => void;
  hasElements: boolean;
  
  // Text/Emoji
  onAddText: () => void;
  onAddEmoji: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  fileInputRef,
  onFilesSelected,
  onAddImages,
  canvasSize,
  onCanvasSizeChange,
  snapRotation,
  onSnapRotationToggle,
  selectedId,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  isCropping,
  onStartCrop,
  onApplyCrop,
  onCancelCrop,
  tempFilters,
  onUpdateFilter,
  onResetFilters,
  exportMode,
  onExportModeChange,
  onDelete,
  onClear,
  onExport,
  hasElements,
  onAddText,
  onAddEmoji,
}) => {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-1 space-y-3 sm:space-y-4">
      {/* Add Images */}
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 text-indigo-600" />
          {t('sidebar.images')}
        </h3>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              onFilesSelected(e.target.files);
            }
          }}
          className="hidden"
        />
        <div className="space-y-2">
          <button
            onClick={onAddImages}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <PhotoIcon className="h-5 w-5" />
            {t('sidebar.add')}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onAddText}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              {t('canvas.addText')}
            </button>
            <button
              onClick={onAddEmoji}
              className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors text-sm font-medium"
            >
              {t('canvas.addEmoji')}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">{t('sidebar.dragDrop')}</p>
      </div>

      {/* Canvas Size */}
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">{t('sidebar.canvas')}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {t('sidebar.width')}
            </label>
            <input
              type="number"
              value={canvasSize.width}
              onChange={(e) =>
                onCanvasSizeChange({ ...canvasSize, width: parseInt(e.target.value) || 800 })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {t('sidebar.height')}
            </label>
            <input
              type="number"
              value={canvasSize.height}
              onChange={(e) =>
                onCanvasSizeChange({ ...canvasSize, height: parseInt(e.target.value) || 600 })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onCanvasSizeChange({ width: 1920, height: 1080 })}
              className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('sidebar.fullHD')}
            </button>
            <button
              onClick={() => onCanvasSizeChange({ width: 1080, height: 1080 })}
              className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('sidebar.square')}
            </button>
          </div>
        </div>
      </div>

      {/* Snap Rotation */}
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-gray-800 flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-indigo-600" />
            {t('sidebar.snapRotation')}
          </label>
          <button
            onClick={onSnapRotationToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              snapRotation ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                snapRotation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t('sidebar.snapDesc')}</p>
      </div>

      {/* Z-Order Controls */}
      {selectedId && (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold text-gray-800 mb-3">{t('sidebar.zOrder')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onBringToFront}
              className="px-3 py-2 text-xs font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
              title="Premier plan"
            >
              <ChevronDoubleUpIcon className="h-4 w-4" />
              Premier
            </button>
            <button
              onClick={onBringForward}
              className="px-3 py-2 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-1"
              title="Avancer"
            >
              <ArrowUpIcon className="h-4 w-4" />
              Avancer
            </button>
            <button
              onClick={onSendBackward}
              className="px-3 py-2 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors flex items-center justify-center gap-1"
              title="Reculer"
            >
              <ArrowDownIcon className="h-4 w-4" />
              Reculer
            </button>
            <button
              onClick={onSendToBack}
              className="px-3 py-2 text-xs font-medium bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex items-center justify-center gap-1"
              title="Arrière-plan"
            >
              <ChevronDoubleDownIcon className="h-4 w-4" />
              Dernier
            </button>
          </div>
        </div>
      )}

      {/* Cropping */}
      {selectedId && !isCropping && (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ScissorsIcon className="h-5 w-5 text-indigo-600" />
            Recadrage
          </h3>
          <button
            onClick={onStartCrop}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <ScissorsIcon className="h-4 w-4" />
            Recadrer l'image
          </button>
        </div>
      )}

      {/* Cropping Controls */}
      {selectedId && isCropping && (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-indigo-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
            <ScissorsIcon className="h-5 w-5" />
            Mode recadrage
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Déplacez et redimensionnez le rectangle rouge pour sélectionner la zone à conserver
          </p>
          <div className="space-y-2">
            <button
              onClick={onApplyCrop}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <CheckIcon className="h-4 w-4" />
              Appliquer
            </button>
            <button
              onClick={onCancelCrop}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <XMarkIcon className="h-4 w-4" />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {selectedId && !isCropping && tempFilters && (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 sticky top-0 bg-white/90 pb-2">
            <SparklesIcon className="h-5 w-5 text-indigo-600" />
            Filtres
          </h3>

          <div className="space-y-3">
            {/* Brightness */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Luminosité</span>
                <span className="text-indigo-600">{tempFilters.brightness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={tempFilters.brightness}
                onChange={(e) => onUpdateFilter('brightness', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Contraste</span>
                <span className="text-indigo-600">{tempFilters.contrast}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={tempFilters.contrast}
                onChange={(e) => onUpdateFilter('contrast', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Saturation</span>
                <span className="text-indigo-600">{tempFilters.saturation}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={tempFilters.saturation}
                onChange={(e) => onUpdateFilter('saturation', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                <span>Flou</span>
                <span className="text-indigo-600">{tempFilters.blur}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={tempFilters.blur}
                onChange={(e) => onUpdateFilter('blur', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Grayscale & Sepia */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onUpdateFilter('grayscale', !tempFilters.grayscale)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  tempFilters.grayscale
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                N&B
              </button>
              <button
                onClick={() => onUpdateFilter('sepia', !tempFilters.sepia)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  tempFilters.sepia
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                Sépia
              </button>
            </div>

            <button
              onClick={onResetFilters}
              className="w-full px-3 py-2 mt-2 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-600 flex justify-between mb-1">
              <span>Zone d'export</span>
              <span className="text-indigo-600">
                {exportMode === 'content' ? 'Contenu' : 'Canvas complet'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onExportModeChange('content')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  exportMode === 'content' ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Contenu
              </button>
              <button
                onClick={() => onExportModeChange('canvas')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  exportMode === 'canvas' ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Canvas
              </button>
            </div>
          </div>
          <button
            onClick={onDelete}
            disabled={!selectedId}
            className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md disabled:hover:shadow-sm"
          >
            <TrashIcon className="h-4 w-4" />
            Supprimer
          </button>
          <button
            onClick={onClear}
            className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
          >
            <TrashIcon className="h-4 w-4" />
            Tout effacer
          </button>
          <button
            onClick={onExport}
            disabled={!hasElements}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md disabled:hover:shadow-sm"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Exporter PNG
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <p className="font-semibold text-sm text-blue-900 mb-2">💡 Raccourcis</p>
        <ul className="text-xs text-blue-800 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Glisser pour déplacer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Coins pour redimensionner/pivoter</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Clic pour sélectionner</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
