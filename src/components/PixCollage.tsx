import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Stage, Layer } from 'react-konva';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { PhotoIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { Capacitor } from '@capacitor/core';
import Konva from 'konva';
import { ImageElement as ImageComponent } from './canvas/ImageElement';
import { TextElement as TextComponent } from './canvas/TextElement';
import { EmojiElement as EmojiComponent } from './canvas/EmojiElement';
import { DesktopSidebar } from './toolbar/DesktopSidebar';
import { MobileToolbar } from './toolbar/MobileToolbar';
import { MobileFiltersPanel } from './panels/MobileFiltersPanel';
import { GridSelector } from './controls/GridSelector';
import { GridOverlay } from './canvas/GridOverlay';
import type { CanvasElement, ImageElement, TextElement, EmojiElement, TempCropData } from '../types/canvas';
import { canvasPresets } from '../types/canvas';
import { useGrid } from '../hooks/useGrid';
import { useImageHandlers } from '../hooks/useImageHandlers';

const PixCollage = () => {
  const { t, i18n } = useTranslation();

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 }); // Carré par défaut
  const [selectedPreset, setSelectedPreset] = useState('square');
  const [showCanvasSizeMenu, setShowCanvasSizeMenu] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [snapRotation, setSnapRotation] = useState(true);
  const [tempCropData, setTempCropData] = useState<TempCropData | null>(null);
  const [exportMode, setExportMode] = useState<'canvas' | 'content'>('content');
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [showGridSelector, setShowGridSelector] = useState(false);
  
  // Détection appareil mobile (tactile) et orientation
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [mobileToolbarCollapsed, setMobileToolbarCollapsed] = useState(false);
  
  // Zoom du canvas pour vue d'ensemble
  const [canvasZoom, setCanvasZoom] = useState(1); // 1 = 100%, 0.5 = 50%, etc.
  
  // État temporaire pour affichage instantané des filtres
  const [tempFilters, setTempFilters] = useState<NonNullable<ImageElement['filters']> | null>(null);
  const debouncedFilters = useDebounce(tempFilters, 300); // Augmenté pour réduire les re-renders

  const selectedElement = elements.find(el => el.id === selectedId);
  const selectedImage = selectedElement?.type === 'image' ? selectedElement : null;

  // Grid system integration
  const grid = useGrid({ canvasSize, elements, setElements });
  
  // Image handlers
  const { onDrop: onDropHandler } = useImageHandlers({
    elements,
    canvasSize,
    setElements,
    setSelectedId,
    setToast,
    scrollRef,
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);


  // Auto close filters when no selection or when cropping
  useEffect(() => {
    if (!selectedId || isCropping) setShowFilters(false);
  }, [selectedId, isCropping]);

  // Synchroniser tempFilters avec l'image sélectionnée
  useEffect(() => {
    if (selectedImage?.filters) {
      setTempFilters(selectedImage.filters);
    } else if (selectedImage) {
      setTempFilters({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: false,
        sepia: false,
      });
    } else {
      setTempFilters(null);
    }
  }, [selectedImage?.id]);

  // Appliquer les filtres débounced (optimisation performance)
  useEffect(() => {
    if (!debouncedFilters || !selectedId) return;
    
    setElements(prev => prev.map(el => {
      if (el.id === selectedId && el.type === 'image') {
        return { ...el, filters: debouncedFilters };
      }
      return el;
    }));
  }, [debouncedFilters, selectedId]);

  // Détection appareil mobile et orientation (SANS redimensionner canvas)
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Détection appareil mobile: Capacitor natif OU écran tactile < 768px
      const isMobile = Capacitor.isNativePlatform() || (w < 768 && 'ontouchstart' in window);
      const landscape = w > h;
      
      setIsMobileDevice(isMobile);
      setIsLandscape(landscape);
      
      // Canvas garde SA TAILLE FIXE choisie par l'utilisateur
      // On ne redimensionne plus automatiquement !
    };
    
    // Appel initial
    handleResize();
    
    // Écouter changements d'orientation pour UI seulement
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await onDropHandler(acceptedFiles, t('toast.imageAdded', { count: acceptedFiles.length }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onDropHandler, t]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    noClick: true,
  });

  const handleDelete = () => {
    if (selectedId) {
      setElements(elements.filter(img => img.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleClear = () => {
    setElements([]);
    setSelectedId(null);
  };

  const changeCanvasSize = (presetId: string) => {
    const preset = canvasPresets.find(p => p.id === presetId);
    if (preset) {
      setCanvasSize({ width: preset.width, height: preset.height });
      setSelectedPreset(presetId);
      setShowCanvasSizeMenu(false);
      setToast(`Canvas: ${preset.name} (${preset.width}×${preset.height})`);
    }
  };

  const zoomIn = () => {
    setCanvasZoom(prev => Math.min(prev + 0.1, 2)); // Max 200%
  };

  const zoomOut = () => {
    setCanvasZoom(prev => Math.max(prev - 0.1, 0.2)); // Min 20%
  };

  const zoomReset = () => {
    setCanvasZoom(1);
  };

  const zoomToFit = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerWidth = container.clientWidth - 40; // Padding
    const containerHeight = container.clientHeight - 80; // Padding + indicator
    
    const scaleX = containerWidth / canvasSize.width;
    const scaleY = containerHeight / canvasSize.height;
    const scale = Math.min(scaleX, scaleY, 1); // Ne pas zoomer plus que 100%
    
    setCanvasZoom(scale);
  };

  const addText = () => {
    const baseZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;
    const newText: TextElement = {
      type: 'text',
      id: Math.random().toString(36).substr(2, 9),
      text: t('canvas.newText') || 'New Text',
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 20,
      fontSize: 32,
      fontFamily: 'Arial',
      fill: '#000000',
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: baseZ + 1,
    };
    setElements([...elements, newText]);
    setSelectedId(newText.id);
  };

  const addEmoji = (emoji: string) => {
    const baseZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;
    const newEmoji: EmojiElement = {
      type: 'emoji',
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: canvasSize.width / 2 - 30,
      y: canvasSize.height / 2 - 30,
      fontSize: 64,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: baseZ + 1,
    };
    setElements([...elements, newEmoji]);
    setSelectedId(newEmoji.id);
  };

  const updateTextContent = (id: string, newText: string) => {
    setElements(elements.map(el => 
      el.id === id && el.type === 'text' ? { ...el, text: newText } : el
    ));
  };

  const handleTextDoubleClick = (id: string, currentText: string) => {
    setEditingTextId(id);
    setEditingTextValue(currentText);
  };

  const saveTextEdit = () => {
    if (editingTextId && editingTextValue.trim()) {
      updateTextContent(editingTextId, editingTextValue.trim());
    }
    setEditingTextId(null);
    setEditingTextValue('');
  };

  const cancelTextEdit = () => {
    setEditingTextId(null);
    setEditingTextValue('');
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    
    // Désélectionner temporairement pour cacher les contrôles
    const previousSelection = selectedId;
    setSelectedId(null);
    
    // Attendre que les contrôles soient masqués
    setTimeout(() => {
      const stage = stageRef.current!;
      let exportOptions: { pixelRatio: number; mimeType: string; x?: number; y?: number; width?: number; height?: number } = {
        pixelRatio: 2,
        mimeType: 'image/png',
      };

      if (exportMode === 'content') {
        const imageNodes = stage.find('Image') as Konva.Image[];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        imageNodes.forEach((node) => {
          if (!node.visible()) return;
          const r = node.getClientRect({ skipStroke: true, skipShadow: true });
          minX = Math.min(minX, r.x);
          minY = Math.min(minY, r.y);
          maxX = Math.max(maxX, r.x + r.width);
          maxY = Math.max(maxY, r.y + r.height);
        });
        if (isFinite(minX) && isFinite(minY) && isFinite(maxX) && isFinite(maxY)) {
          const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));
          const x = clamp(minX, 0, stage.width());
          const y = clamp(minY, 0, stage.height());
          const w = clamp(maxX, 0, stage.width()) - x;
          const h = clamp(maxY, 0, stage.height()) - y;
          if (w > 0 && h > 0) {
            exportOptions = { ...exportOptions, x, y, width: w, height: h };
          }
        }
      }

      const uri = stage.toDataURL(exportOptions);

      if (Capacitor.isNativePlatform()) {
        (async () => {
          try {
            const { Share } = await import('@capacitor/share');
            await Share.share({ title: 'Export PNG', url: uri });
            setToast(t('toast.exportReady'));
          } catch (e) {
            try {
              const base64 = uri.split(',')[1] || '';
              const { Filesystem, Directory } = await import('@capacitor/filesystem');
              const name = `collage-${Date.now()}.png`;
              await Filesystem.writeFile({
                path: name,
                data: base64,
                directory: Directory.Documents,
                recursive: true,
              });
              setToast(t('toast.exportSaved', { filename: name }));
            } catch {
              setToast(t('toast.exportUnavailable'));
            }
          }
        })();
      } else {
        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = uri;
        link.click();
        setToast(t('toast.exportDownloaded'));
      }
      
      // Restaurer la sélection
      setSelectedId(previousSelection);
    }, 100);
  };

  const handleTransform = (id: string, newAttrs: Partial<CanvasElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...newAttrs } as CanvasElement : el
    ));
  };

  const bringToFront = () => {
    if (!selectedId) return;
    const maxZIndex = Math.max(...elements.map(img => img.zIndex));
    setElements(elements.map(img => 
      img.id === selectedId ? { ...img, zIndex: maxZIndex + 1 } : img
    ));
  };

  const sendToBack = () => {
    if (!selectedId) return;
    const minZIndex = Math.min(...elements.map(img => img.zIndex));
    setElements(elements.map(img => 
      img.id === selectedId ? { ...img, zIndex: minZIndex - 1 } : img
    ));
  };

  const bringForward = () => {
    if (!selectedId) return;
    const currentImg = elements.find(img => img.id === selectedId);
    if (!currentImg) return;
    
    const higherImages = elements.filter(img => img.zIndex > currentImg.zIndex);
    if (higherImages.length === 0) return;
    
    const nextZIndex = Math.min(...higherImages.map(img => img.zIndex));
    const imgToSwap = elements.find(img => img.zIndex === nextZIndex);
    
    setElements(elements.map(img => {
      if (img.id === selectedId) return { ...img, zIndex: nextZIndex };
      if (imgToSwap && img.id === imgToSwap.id) return { ...img, zIndex: currentImg.zIndex };
      return img;
    }));
  };

  const sendBackward = () => {
    if (!selectedId) return;
    const currentImg = elements.find(img => img.id === selectedId);
    if (!currentImg) return;
    
    const lowerImages = elements.filter(img => img.zIndex < currentImg.zIndex);
    if (lowerImages.length === 0) return;
    
    const prevZIndex = Math.max(...lowerImages.map(img => img.zIndex));
    const imgToSwap = elements.find(img => img.zIndex === prevZIndex);
    
    setElements(elements.map(img => {
      if (img.id === selectedId) return { ...img, zIndex: prevZIndex };
      if (imgToSwap && img.id === imgToSwap.id) return { ...img, zIndex: currentImg.zIndex };
      return img;
    }));
  };

  // Mise à jour temporaire des filtres (affichage instantané, pas de re-render canvas)
  const updateTempFilter = useCallback((filterId: keyof NonNullable<ImageElement['filters']>, value: number | boolean) => {
    setTempFilters(prev => {
      if (!prev) return null;
      return { ...prev, [filterId]: value };
    });
  }, []);

  const resetFilters = () => {
    if (!selectedId) return;
    // Réinitialiser les filtres temporaires immédiatement
    setTempFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: false,
      sepia: false
    });
  };

  const startCrop = () => {
    if (!selectedId) return;
    const el = elements.find(i => i.id === selectedId);
    if (!el || el.type !== 'image') return;
    
    const displayWidth = el.width * el.scaleX;
    const displayHeight = el.height * el.scaleY;

    // Caler le cadre sur le bounding box du node image RÉEL (comme le Transformer)
    const stage = stageRef.current;
    const node = stage ? (stage.findOne(`.image-${selectedId}`) as Konva.Image | null) : null;
    const bbox = node ? node.getClientRect({ skipStroke: true, skipShadow: true }) : null;
    const initialCropData = bbox
      ? { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
      : { x: el.x, y: el.y, width: displayWidth, height: displayHeight };

    setTempCropData(initialCropData);
    setIsCropping(true);
  };

  const applyCrop = async () => {
    if (!selectedId || !tempCropData) return;
    
    const img = elements.find(i => i.id === selectedId);
    if (!img) return;
    
    const stage = stageRef.current;
    if (!stage) return;

    const targetName = `image-${selectedId}`;
    const imageNodes = stage.find('Image') as Konva.Image[];
    const rectNodes = stage.find('Rect');
    const trNodes = stage.find('Transformer');

    const visibilityBackup: Array<{ node: Konva.Node; visible: boolean }> = [];

    imageNodes.forEach((node) => {
      const keep = node.name() === targetName;
      if (!keep) {
        visibilityBackup.push({ node, visible: node.visible() });
        node.visible(false);
      }
    });
    rectNodes.forEach((node) => {
      visibilityBackup.push({ node, visible: node.visible() });
      node.visible(false);
    });
    trNodes.forEach((node) => {
      visibilityBackup.push({ node, visible: node.visible() });
      node.visible(false);
    });

    // Capturer exactement la zone du rectangle affiché (axe aligné)
    const stageW = stage.width();
    const stageH = stage.height();
    const capX = Math.max(0, Math.min(tempCropData.x, stageW));
    const capY = Math.max(0, Math.min(tempCropData.y, stageH));
    const capW = Math.max(1, Math.min(tempCropData.width, stageW - capX));
    const capH = Math.max(1, Math.min(tempCropData.height, stageH - capY));

    const uri = stage.toDataURL({
      x: capX,
      y: capY,
      width: capW,
      height: capH,
      pixelRatio: 1,
      mimeType: 'image/png',
    });

    visibilityBackup.forEach(({ node, visible }) => node.visible(visible));

    const newImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('Failed to load cropped image'));
      im.src = uri;
    });

    const newX = capX;
    const newY = capY;

    setElements(elements.map(i => {
      if (i.id === selectedId) {
        return {
          ...i,
          image: newImg,
          x: newX,
          y: newY,
          width: newImg.width,
          height: newImg.height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          crop: undefined,
        } as ImageElement;
      }
      return i;
    }));

    setTempCropData(null);
    setIsCropping(false);
  };

  const cancelCrop = () => {
    setTempCropData(null);
    setIsCropping(false);
  };

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const sortedImages = sortedElements.filter((el): el is ImageElement => el.type === 'image');
  const sortedTexts = sortedElements.filter((el): el is TextElement => el.type === 'text');
  const sortedEmojis = sortedElements.filter((el): el is EmojiElement => el.type === 'emoji');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-24 md:pb-0">
      <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {t('app.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">{t('app.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* Desktop Sidebar */}
          {!isMobileDevice && (
            <DesktopSidebar
              fileInputRef={fileInputRef}
              onFilesSelected={(files) => onDrop(Array.from(files))}
              onAddImages={() => (open ? open() : fileInputRef.current?.click())}
              canvasSize={canvasSize}
              onCanvasSizeChange={setCanvasSize}
              snapRotation={snapRotation}
              onSnapRotationToggle={() => setSnapRotation(!snapRotation)}
              selectedId={selectedId}
              onBringToFront={bringToFront}
              onBringForward={bringForward}
              onSendBackward={sendBackward}
              onSendToBack={sendToBack}
              isCropping={isCropping}
              onStartCrop={startCrop}
              onApplyCrop={applyCrop}
              onCancelCrop={cancelCrop}
              tempFilters={tempFilters}
              onUpdateFilter={updateTempFilter}
              onResetFilters={resetFilters}
              exportMode={exportMode}
              onExportModeChange={setExportMode}
              onDelete={handleDelete}
              onClear={handleClear}
              onExport={handleExport}
              hasElements={elements.length > 0}
              onAddText={addText}
              onAddEmoji={() => setShowEmojiPicker(true)}
              onShowGridSelector={() => setShowGridSelector(true)}
              onToggleGridOverlay={() => grid.setShowGridOverlay(!grid.showGridOverlay)}
              showGridOverlay={grid.showGridOverlay}
            />
          )}

          {/* Canvas Area */}
          <div className={`${isMobileDevice ? 'col-span-1' : 'lg:col-span-4'}`}>
            <div
              {...getRootProps()}
              className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6 transition-all duration-300 border-2 ${
                isDragActive 
                  ? 'border-indigo-400 bg-indigo-50/50 scale-[0.99]' 
                  : 'border-transparent hover:shadow-2xl'
              }`}
            >
              <input {...getInputProps()} />
              <div 
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-auto border border-gray-200 shadow-inner" 
                style={{ 
                  height: Math.min(canvasSize.height + 40, window.innerHeight - 200),
                  backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  touchAction: 'pan-x pan-y',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  overscrollBehavior: 'contain'
                }}
                ref={scrollRef}
              >
                {elements.length === 0 ? (
                  <div className="text-center text-gray-400 max-w-md">
                    <PhotoIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500 mb-2">{t('canvas.startCollage')}</p>
                    <p className="text-sm text-gray-400">
                      {t('canvas.dragImages')}
                    </p>
                  </div>
                ) : (
                  <div 
                    style={{ 
                      width: canvasSize.width, 
                      height: canvasSize.height,
                      border: '4px solid #4f46e5',
                      boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.1), 0 10px 40px rgba(0, 0, 0, 0.2)',
                      borderRadius: '4px',
                      position: 'relative',
                      transform: `scale(${canvasZoom})`,
                      transformOrigin: 'top left',
                      margin: canvasZoom < 1 ? '20px' : '0'
                    }}
                  >
                    {/* Canvas size indicator */}
                    <div className="absolute -top-8 left-0 text-xs font-medium text-indigo-600 bg-white/90 px-2 py-1 rounded-md shadow-sm">
                      {canvasSize.width} × {canvasSize.height} px • {Math.round(canvasZoom * 100)}%
                    </div>
                    <Stage
                      width={canvasSize.width}
                      height={canvasSize.height}
                      ref={stageRef}
                      onClick={(e) => {
                        const clickedOnEmpty = e.target === e.target.getStage();
                        if (clickedOnEmpty) {
                          setSelectedId(null);
                        }
                      }}
                    >
                      <Layer>
                        {sortedImages.map((img) => (
                          <ImageComponent
                            key={img.id}
                            imageData={img}
                            isSelected={img.id === selectedId}
                            onSelect={() => setSelectedId(img.id)}
                            onTransform={handleTransform}
                            snapRotation={snapRotation}
                            isCropping={isCropping && img.id === selectedId}
                            tempCropData={img.id === selectedId ? tempCropData : null}
                            onCropChange={setTempCropData}
                          />
                        ))}
                        {sortedTexts.map((txt) => (
                          <TextComponent
                            key={txt.id}
                            textData={txt}
                            isSelected={txt.id === selectedId}
                            onSelect={() => setSelectedId(txt.id)}
                            onTransform={handleTransform}
                            onDoubleClick={handleTextDoubleClick}
                          />
                        ))}
                        {sortedEmojis.map((emoji) => (
                          <EmojiComponent
                            key={emoji.id}
                            emojiData={emoji}
                            isSelected={emoji.id === selectedId}
                            onSelect={() => setSelectedId(emoji.id)}
                            onTransform={handleTransform}
                          />
                        ))}
                      </Layer>
                      
                      {/* Grid overlay */}
                      <GridOverlay
                        zones={grid.gridZones}
                        canvasWidth={canvasSize.width}
                        canvasHeight={canvasSize.height}
                        visible={grid.showGridOverlay}
                      />
                    </Stage>
                  </div>
                )}
              </div>
            </div>
            {elements.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                {t('canvas.imageCount', { count: elements.length })} • {canvasSize.width}×{canvasSize.height}px
                {selectedId && ` • ${t('canvas.imageSelected')}`}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Zoom controls */}
      <div className="fixed bottom-20 left-4 z-40 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          title="Zoom +"
        >
          <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          title="Zoom -"
        >
          <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={zoomReset}
          className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          title="100%"
        >
          <span className="text-xs font-bold text-gray-700">1:1</span>
        </button>
        <button
          onClick={zoomToFit}
          className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          title="Adapter à l'écran"
        >
          <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Toolbar */}
      {isMobileDevice && (
        <MobileToolbar
          isCollapsed={mobileToolbarCollapsed}
          onToggleCollapse={() => setMobileToolbarCollapsed(!mobileToolbarCollapsed)}
          isLandscape={isLandscape}
          isCropping={isCropping}
          selectedId={selectedId}
          selectedElementType={selectedElement?.type || null}
          selectedImageExists={!!selectedImage}
          hasElements={elements.length > 0}
          onAddImages={() => (open ? open() : fileInputRef.current?.click())}
          onEditText={() => selectedElement?.type === 'text' && handleTextDoubleClick(selectedElement.id, selectedElement.text)}
          onCrop={startCrop}
          onToggleFilters={() => setShowFilters(s => !s)}
          onAddText={addText}
          onAddEmoji={() => setShowEmojiPicker(true)}
          onExport={handleExport}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onDelete={handleDelete}
          onApplyCrop={applyCrop}
          onCancelCrop={cancelCrop}
        />
      )}
      
      {/* Mobile filters panel */}
      <MobileFiltersPanel
        show={isMobileDevice && showFilters && selectedId !== null && !isCropping}
        isLandscape={isLandscape}
        filters={tempFilters}
        onFilterChange={updateTempFilter}
        onReset={resetFilters}
        onClose={() => setShowFilters(false)}
      />
      {/* Canvas size selector */}
      <div className="fixed top-16 right-16 z-50">
        <button
          onClick={() => setShowCanvasSizeMenu(!showCanvasSizeMenu)}
          className="px-3 py-2 bg-white/95 backdrop-blur shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
          title="Taille du canvas"
        >
          <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" />
          </svg>
          <span className="text-xs font-medium text-gray-700">{canvasSize.width}×{canvasSize.height}</span>
        </button>
        {showCanvasSizeMenu && (
          <div className="absolute top-12 right-0 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden min-w-[200px]">
            {canvasPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => changeCanvasSize(preset.id)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  selectedPreset === preset.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-xs text-gray-500">{preset.width}×{preset.height}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language selector */}
      <div className="fixed top-16 right-4 z-50">
        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          title={t('mobile.language')}
        >
          <LanguageIcon className="h-5 w-5 text-gray-700" />
        </button>
        {showLangMenu && (
          <div className="absolute top-12 right-0 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden min-w-[140px]">
            <button
              onClick={() => { i18n.changeLanguage('en'); setShowLangMenu(false); }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${i18n.language === 'en' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
            >
              {t('languages.en')}
            </button>
            <button
              onClick={() => { i18n.changeLanguage('fr'); setShowLangMenu(false); }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${i18n.language === 'fr' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
            >
              {t('languages.fr')}
            </button>
          </div>
        )}
      </div>

      {/* Text editing dialog */}
      {editingTextId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={cancelTextEdit}>
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('canvas.editText') || 'Edit Text'}</h3>
            <textarea
              value={editingTextValue}
              onChange={(e) => setEditingTextValue(e.target.value)}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveTextEdit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {t('mobile.apply')}
              </button>
              <button
                onClick={cancelTextEdit}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                {t('mobile.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEmojiPicker(false)}>
          <div className="bg-white rounded-xl p-4 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 sticky top-0 bg-white">{t('canvas.selectEmoji') || 'Select Emoji'}</h3>
            <div className="grid grid-cols-8 gap-1">
              {[
                // Smileys & People
                '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾',
                // Gestures & Body
                '👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄','💋',
                // Hearts & Love
                '💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','💨',
                // Animals & Nature
                '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🐣','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🦟','🦗','🪳','🕷','🕸','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔',
                // Food & Drink
                '🍎','🍏','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽','🥣','🥡','🥢','🧂',
                // Activities & Sports
                '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷','🏂','🪂','🏋️','🤼','🤸','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖','🏵','🎗','🎫','🎟','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟','🎯','🎳','🎮','🎰','🧩',
                // Travel & Places
                '🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩','💺','🛰','🚀','🛸','🚁','🛶','⛵','🚤','🛥','🛳','⛴','🚢','⚓','🪝','⛽','🚧','🚦','🚥','🚏','🗺','🗿','🗽','🗼','🏰','🏯','🏟','🎡','🎢','🎠','⛲','⛱','🏖','🏝','🏜','🌋','⛰','🏔','🗻','🏕','⛺','🛖','🏠','🏡','🏘','🏚','🏗','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛','⛪','🕌','🕍','🛕','🕋','⛩','🛤','🛣','🗾','🎑','🏞','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙','🌃','🌌','🌉','🌁',
                // Objects
                '⌚','📱','📲','💻','⌨️','🖥','🖨','🖱','🖲','🕹','🗜','💾','💿','📀','📼','📷','📸','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','🎙','🎚','🎛','🧭','⏱','⏲','⏰','🕰','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯','🪔','🧯','🛢','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒','🛠','⛏','🪚','🔩','⚙️','🪤','🧱','⛓','🧲','🔫','💣','🧨','🪓','🔪','🗡','⚔️','🛡','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎','🔑','🗝','🚪','🪑','🛋','🛏','🛌','🧸','🪆','🖼','🪞','🪟','🛍','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒','🗓','📆','📅','🗑','📇','🗃','🗳','🗄','📋','📁','📂','🗂','🗞','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇','📐','📏','🧮','📌','📍','✂️','🖊','🖋','✒️','🖌','🖍','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓',
                // Symbols
                '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸','⏯','⏹','⏺','⏭','⏮','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥','🕦','🕧'
              ].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    addEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl p-1.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium sticky bottom-0"
            >
              {t('mobile.close')}
            </button>
          </div>
        </div>
      )}
      
      {/* Grid selector modal */}
      <GridSelector
        selectedGridId={grid.selectedGridId}
        onSelectGrid={grid.selectGrid}
        show={showGridSelector}
        onClose={() => setShowGridSelector(false)}
      />
    </div>
  );
};


export default PixCollage;
