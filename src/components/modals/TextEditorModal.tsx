import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextElement } from '../../types/canvas';

interface TextEditorModalProps {
  show: boolean;
  textElement: TextElement | null;
  onSave: (id: string, updates: Partial<TextElement>) => void;
  onCancel: () => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
];

const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#4B0082',
];

const TextEditorModalInner: React.FC<TextEditorModalProps> = ({
  show,
  textElement,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fill, setFill] = useState('#000000');
  const [fontStyle, setFontStyle] = useState<'normal' | 'bold' | 'italic' | 'bold italic'>('normal');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');

  useEffect(() => {
    if (textElement) {
      setText(textElement.text);
      setFontSize(textElement.fontSize);
      setFontFamily(textElement.fontFamily);
      setFill(textElement.fill);
      setFontStyle(textElement.fontStyle || 'normal');
      setAlign(textElement.align || 'center');
    }
  }, [textElement]);

  if (!show || !textElement) return null;

  const handleSave = () => {
    onSave(textElement.id, {
      text: text.trim(),
      fontSize,
      fontFamily,
      fill,
      fontStyle,
      align,
    });
  };

  const toggleBold = () => {
    if (fontStyle === 'bold') setFontStyle('normal');
    else if (fontStyle === 'italic') setFontStyle('bold italic');
    else if (fontStyle === 'bold italic') setFontStyle('italic');
    else setFontStyle('bold');
  };

  const toggleItalic = () => {
    if (fontStyle === 'italic') setFontStyle('normal');
    else if (fontStyle === 'bold') setFontStyle('bold italic');
    else if (fontStyle === 'bold italic') setFontStyle('bold');
    else setFontStyle('italic');
  };

  const isBold = fontStyle === 'bold' || fontStyle === 'bold italic';
  const isItalic = fontStyle === 'italic' || fontStyle === 'bold italic';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('canvas.editText') || 'Éditer le texte'}</h3>
        
        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
          rows={3}
          autoFocus
          placeholder={t('text.placeholder') || 'Entrez votre texte...'}
        />

        {/* Font Family */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('text.font') || 'Police'}
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('text.size') || 'Taille'}: {fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Style buttons (Bold, Italic) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('text.style') || 'Style'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={toggleBold}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                isBold ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              B
            </button>
            <button
              onClick={toggleItalic}
              className={`px-4 py-2 rounded-lg italic transition-colors ${
                isItalic ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              I
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('text.align') || 'Alignement'}
          </label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAlign(a)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  align === a ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="h-5 w-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {a === 'left' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />}
                  {a === 'center' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />}
                  {a === 'right' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />}
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('text.color') || 'Couleur'}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setFill(color)}
                className={`w-full h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                  fill === color ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
            className="w-full mt-2 h-10 rounded-lg border border-gray-300"
          />
        </div>

        {/* Preview */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-2">{t('text.preview') || 'Aperçu'}:</p>
          <div
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              color: fill,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textAlign: align,
            }}
          >
            {text || t('text.placeholder') || 'Texte...'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('mobile.apply')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            {t('mobile.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TextEditorModal = memo(TextEditorModalInner);
