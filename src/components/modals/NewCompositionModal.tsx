import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { gridTemplates } from '../../types/grid';

interface NewCompositionModalProps {
  show: boolean;
  isLandscape: boolean;
  onSelectFree: () => void;
  onSelectGrid: (gridId: string) => void;
  onClose: () => void;
}

const NewCompositionModalInner: React.FC<NewCompositionModalProps> = ({
  show,
  onSelectFree,
  onSelectGrid,
  onClose,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'choice' | 'grid'>('choice');

  // Reset step when modal is shown
  useEffect(() => {
    if (show) {
      setStep('choice');
    }
  }, [show]);

  if (!show) return null;

  const handleFreeMode = () => {
    onSelectFree();
    onClose();
  };

  const handleGridSelect = (gridId: string) => {
    onSelectGrid(gridId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {step === 'choice' ? (
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t('composition.newTitle') || 'Nouvelle Composition'}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('composition.subtitle') || 'Choisissez comment vous souhaitez composer votre image'}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Mode Libre */}
              <button
                onClick={handleFreeMode}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-indigo-500 transition-all p-6 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <svg className="w-6 h-6 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('composition.freeMode') || 'Mode Libre'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('composition.freeDesc') || 'Positionnez vos images librement sur le canvas sans contraintes'}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="text-indigo-600 font-medium group-hover:underline">
                    {t('composition.start') || 'Commencer'} →
                  </span>
                </div>
              </button>

              {/* Mode Grille */}
              <button
                onClick={() => setStep('grid')}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all p-6 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('composition.gridMode') || 'Mode Grille'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('composition.gridDesc') || 'Choisissez une grille prédéfinie et remplissez les zones'}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="text-purple-600 font-medium group-hover:underline">
                    {t('composition.selectLayout') || 'Choisir une disposition'} →
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('choice')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('common.back') || 'Retour'}
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('grid.selectGrid') || 'Sélectionner une grille'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gridTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleGridSelect(template.id)}
                  className="group relative aspect-square rounded-xl border-2 border-gray-200 hover:border-purple-500 overflow-hidden transition-all hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-4 h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full h-full bg-white rounded-lg shadow-sm p-2">
                        {/* Visual preview of grid zones */}
                        <div className="relative w-full h-full border border-gray-200 rounded overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {template.zones.map((zone) => {
                              if (zone.clipPath && zone.clipPath.length > 0) {
                                // Polygon zone
                                const pathData = zone.clipPath.map((p, i) => 
                                  `${i === 0 ? 'M' : 'L'} ${(zone.x + p.x * zone.width) * 100} ${(zone.y + p.y * zone.height) * 100}`
                                ).join(' ') + ' Z';
                                return (
                                  <path
                                    key={zone.id}
                                    d={pathData}
                                    fill="rgba(147, 51, 234, 0.15)"
                                    stroke="rgb(147, 51, 234)"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                );
                              } else {
                                // Rectangle zone
                                return (
                                  <rect
                                    key={zone.id}
                                    x={zone.x * 100}
                                    y={zone.y * 100}
                                    width={zone.width * 100}
                                    height={zone.height * 100}
                                    fill="rgba(147, 51, 234, 0.15)"
                                    stroke="rgb(147, 51, 234)"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                );
                              }
                            })}
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {template.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {template.zones.length} {t('grid.zones') || 'zones'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const NewCompositionModal = memo(NewCompositionModalInner);
