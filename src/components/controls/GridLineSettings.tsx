import React from 'react';
import { useTranslation } from 'react-i18next';

interface GridLineSettingsProps {
  lineColor: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash' | 'zigzag';
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onStyleChange: (style: 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash' | 'zigzag') => void;
  onClose?: () => void;
}

const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#9ca3af' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
];

export const GridLineSettings: React.FC<GridLineSettingsProps> = ({
  lineColor,
  lineWidth,
  lineStyle,
  onColorChange,
  onWidthChange,
  onStyleChange,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-4 text-lg">
        {t('grid.lineSettings') || 'Paramètres des lignes'}
      </h4>

          {/* Color */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {t('grid.lineColor') || 'Couleur'}
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onColorChange(color.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                    lineColor === color.value ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <input
              type="color"
              value={lineColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Width */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {t('grid.lineWidth') || 'Épaisseur'}: {lineWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={lineWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1px</span>
              <span>50px</span>
            </div>
          </div>

          {/* Style */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {t('grid.lineStyle') || 'Style'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onStyleChange('solid')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  lineStyle === 'solid'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                title={t('grid.solid') || 'Plein'}
              >
                <svg width="100%" height="4" className="mb-1">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <div className="text-xs text-center mt-1 text-gray-700">{t('grid.solid') || 'Plein'}</div>
              </button>
              
              <button
                onClick={() => onStyleChange('dashed')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  lineStyle === 'dashed'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                title={t('grid.dashed') || 'Tirets'}
              >
                <svg width="100%" height="4" className="mb-1">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
                </svg>
                <div className="text-xs text-center mt-1 text-gray-700">{t('grid.dashed') || 'Tirets'}</div>
              </button>
              
              <button
                onClick={() => onStyleChange('dotted')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  lineStyle === 'dotted'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                title={t('grid.dotted') || 'Points'}
              >
                <svg width="100%" height="4" className="mb-1">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4" />
                </svg>
                <div className="text-xs text-center mt-1 text-gray-700">{t('grid.dotted') || 'Points'}</div>
              </button>
              
              <button
                onClick={() => onStyleChange('dash-dot')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  lineStyle === 'dash-dot'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                title={t('grid.dashDot') || 'Tiret-Point'}
              >
                <svg width="100%" height="4" className="mb-1">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5 2 5" />
                </svg>
                <div className="text-xs text-center mt-1 text-gray-700">{t('grid.dashDot') || 'Tiret-Pt'}</div>
              </button>
              
              <button
                onClick={() => onStyleChange('long-dash')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  lineStyle === 'long-dash'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                title={t('grid.longDash') || 'Tirets longs'}
              >
                <svg width="100%" height="4" className="mb-1">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="currentColor" strokeWidth="2" strokeDasharray="20 8" />
                </svg>
                <div className="text-xs text-center mt-1 text-gray-700">{t('grid.longDash') || 'Long'}</div>
              </button>
              
              <button
                onClick={() => onStyleChange('zigzag')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  lineStyle === 'zigzag'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                title={t('grid.zigzag') || 'Zigzag'}
              >
                <svg width="100%" height="4" className="mb-1">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4 4 4" />
                </svg>
                <div className="text-xs text-center mt-1 text-gray-700">{t('grid.zigzag') || 'Zigzag'}</div>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-2">{t('text.preview') || 'Aperçu'}:</p>
            <div className="flex items-center justify-center h-12">
              <svg width="100%" height={Math.max(lineWidth + 4, 20)} style={{ display: 'block' }}>
                <line
                  x1="0"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  strokeDasharray={
                    lineStyle === 'solid' ? 'none' :
                    lineStyle === 'dashed' ? '10 5' :
                    lineStyle === 'dotted' ? '2 4' :
                    lineStyle === 'dash-dot' ? '10 5 2 5' :
                    lineStyle === 'long-dash' ? '20 8' :
                    lineStyle === 'zigzag' ? '8 4 4 4' : 'none'
                  }
                />
              </svg>
            </div>
          </div>

      {/* Apply button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t('mobile.apply') || 'Appliquer'}
        </button>
      )}
    </div>
  );
};
