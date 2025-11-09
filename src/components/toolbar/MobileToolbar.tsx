import { useTranslation } from 'react-i18next';
import {
  PhotoIcon,
  ScissorsIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface MobileToolbarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLandscape: boolean;
  isCropping: boolean;
  selectedId: string | null;
  selectedElementType: 'image' | 'text' | 'emoji' | null;
  selectedImageExists: boolean;
  hasElements: boolean;
  onAddImages: () => void;
  onEditText: () => void;
  onCrop: () => void;
  onToggleFilters: () => void;
  onAddText: () => void;
  onAddEmoji: () => void;
  onExport: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isLandscape,
  isCropping,
  selectedId,
  selectedElementType,
  selectedImageExists,
  hasElements,
  onAddImages,
  onEditText,
  onCrop,
  onToggleFilters,
  onAddText,
  onAddEmoji,
  onExport,
  onBringForward,
  onSendBackward,
  onDelete,
  onApplyCrop,
  onCancelCrop,
}) => {
  const { t } = useTranslation();

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className={`fixed z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl rounded-full p-3 hover:from-indigo-700 hover:to-purple-700 transition-all ${
          isLandscape ? 'right-4 top-1/2 -translate-y-1/2' : 'bottom-4 right-4'
        }`}
        title="Afficher la barre d'outils"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-2xl border border-gray-200 ${
        isLandscape
          ? 'right-0 top-0 bottom-0 w-48 flex flex-col'
          : 'bottom-0 left-0 right-0'
      }`}
    >
      {/* Collapse button */}
      <button
        onClick={onToggleCollapse}
        className={`absolute z-10 bg-white/95 backdrop-blur shadow-lg rounded-full border border-gray-200 p-2 hover:bg-gray-50 transition-colors ${
          isLandscape ? '-left-10 top-1/2 -translate-y-1/2' : 'right-4 -top-10'
        }`}
        title="Réduire la barre"
      >
        <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isLandscape ? 'M9 5l7 7-7 7' : 'M19 9l-7 7-7-7'}
          />
        </svg>
      </button>

      <div
        className={`${
          isLandscape ? 'flex-1 overflow-y-auto p-3' : 'mx-auto mb-3 max-w-xl px-3'
        }`}
      >
        <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-lg rounded-2xl border border-gray-200 p-3">
          {!isCropping ? (
            <div className={`grid ${isLandscape ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
              {/* Row 1 */}
              <button
                onClick={onAddImages}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-600 text-white shadow-sm active:scale-95 transition-transform"
              >
                <PhotoIcon className="h-5 w-5" />
                <span>{t('mobile.add')}</span>
              </button>

              {selectedElementType === 'text' ? (
                <button
                  onClick={onEditText}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-blue-600 text-white active:scale-95 transition-transform"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>{t('mobile.edit')}</span>
                </button>
              ) : (
                <button
                  onClick={onCrop}
                  disabled={!selectedImageExists}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <ScissorsIcon className="h-5 w-5" />
                  <span>{t('mobile.crop')}</span>
                </button>
              )}

              <button
                onClick={onToggleFilters}
                disabled={!selectedImageExists}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>{t('mobile.effects')}</span>
              </button>

              {/* Row 2 */}
              <button
                onClick={onAddText}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-blue-100 text-blue-700 active:scale-95 transition-transform"
              >
                <span className="text-lg font-bold">T</span>
                <span>Texte</span>
              </button>

              <button
                onClick={onAddEmoji}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-yellow-100 text-yellow-700 active:scale-95 transition-transform"
              >
                <span className="text-xl">😊</span>
                <span>Emoji</span>
              </button>

              <button
                onClick={onExport}
                disabled={!hasElements}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>{t('mobile.export')}</span>
              </button>

              {/* Row 3 - Z-order and Delete */}
              <button
                onClick={onBringForward}
                disabled={!selectedId}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-50 text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <ArrowUpIcon className="h-5 w-5" />
                <span>{t('mobile.forward')}</span>
              </button>

              <button
                onClick={onSendBackward}
                disabled={!selectedId}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-50 text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <ArrowDownIcon className="h-5 w-5" />
                <span>{t('mobile.backward')}</span>
              </button>

              <button
                onClick={onDelete}
                disabled={!selectedId}
                className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <TrashIcon className="h-5 w-5" />
                <span>{t('mobile.delete')}</span>
              </button>
            </div>
          ) : (
            // Crop mode
            <div className="flex gap-2">
              <button
                onClick={onApplyCrop}
                className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 min-h-[56px] text-sm font-medium rounded-xl bg-green-600 text-white active:scale-95 transition-transform"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('mobile.apply')}</span>
              </button>
              <button
                onClick={onCancelCrop}
                className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 min-h-[56px] text-sm font-medium rounded-xl bg-gray-600 text-white active:scale-95 transition-transform"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{t('mobile.cancel')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
