import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface ExportProgressModalProps {
  show: boolean;
  progress: number; // 0 to 100
}

const ExportProgressModalInner: React.FC<ExportProgressModalProps> = ({
  show,
  progress,
}) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t('export.inProgress') || 'Export en cours...'}
          </h3>
          <p className="text-gray-600">
            {t('export.pleaseWait') || 'Veuillez patienter'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t('export.progress') || 'Progression'}</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center">
          {t('export.doNotClose') || 'Ne fermez pas cette fenêtre'}
        </p>
      </div>
    </div>
  );
};

export const ExportProgressModal = memo(ExportProgressModalInner);
