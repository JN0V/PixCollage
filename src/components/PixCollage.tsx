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
import { StickerComponent } from './canvas/StickerElement';
import { MobileToolbar } from './toolbar/MobileToolbar';
import { MobileFiltersPanel } from './panels/MobileFiltersPanel';
import { GridSelector } from './controls/GridSelector';
import { GridLineSettings } from './controls/GridLineSettings';
import { GridOverlay } from './canvas/GridOverlay';
import { GridModeLayer } from './canvas/GridModeLayer';
import { NewCompositionModal } from './modals/NewCompositionModal';
import { TextEditorModal } from './modals/TextEditorModal';
import { ExportProgressModal } from './modals/ExportProgressModal';
import { StickerPicker } from './modals/StickerPicker';
import type { CanvasElement, ImageElement, TextElement, EmojiElement, StickerElement, TempCropData } from '../types/canvas';
import { canvasPresets } from '../types/canvas';
import { useGrid } from '../hooks/useGrid';
import { useImageHandlers } from '../hooks/useImageHandlers';
import { useElementActions } from '../hooks/useElementActions';
import { useTextEmoji } from '../hooks/useTextEmoji';
import { useStickers } from '../hooks/useStickers';

const PixCollage = () => {
  const { t, i18n } = useTranslation();

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 }); // Carré par défaut
  const [selectedPreset, setSelectedPreset] = useState('square');
  const [showCanvasSizeMenu, setShowCanvasSizeMenu] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [snapRotation] = useState(true); // Snap rotation always enabled
  const [tempCropData, setTempCropData] = useState<TempCropData | null>(null);
  const exportMode = 'content'; // Always export content only (not full canvas)
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [editingTextElement, setEditingTextElement] = useState<TextElement | null>(null);
  const [showGridSelector, setShowGridSelector] = useState(false);
  const [showNewComposition, setShowNewComposition] = useState(true); // Show at startup
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showLineSettings, setShowLineSettings] = useState(false);
  
  // Orientation basée sur les dimensions de la fenêtre (plus de distinction desktop/mobile)
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
  
  // Element actions (delete, z-order, crop)
  const elementActions = useElementActions({
    elements,
    setElements,
    selectedId,
    setSelectedId,
    setIsCropping,
    tempCropData,
    setTempCropData,
  });
  
  // Temporary dummy states for useTextEmoji compatibility
  const [_editingTextId, _setEditingTextId] = useState<string | null>(null);
  const [_editingTextValue, _setEditingTextValue] = useState('');
  
  // Text and Emoji handlers
  const textEmoji = useTextEmoji({
    elements,
    setElements,
    setSelectedId,
    setEditingTextId: _setEditingTextId,
    setEditingTextValue: _setEditingTextValue,
    canvasSize,
  });
  
  // Sticker handlers
  const stickers = useStickers({
    elements,
    setElements,
    canvasSize,
  });
  
  // Override handleTextDoubleClick to use new modal
  const handleTextDoubleClick = (id: string) => {
    const text = elements.find(el => el.id === id && el.type === 'text') as TextElement | undefined;
    if (text) setEditingTextElement(text);
  };

  // Add text and open editor immediately
  const addTextWithEditor = () => {
    textEmoji.addText();
    // Find the last text element (just added)
    setTimeout(() => {
      const lastText = elements.filter(el => el.type === 'text').pop() as TextElement | undefined;
      if (lastText) {
        setEditingTextElement(lastText);
      }
    }, 0);
  };

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

  // Détection orientation basée sur dimensions fenêtre (plus de distinction desktop/mobile)
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Orientation: paysage si largeur > hauteur, portrait sinon
      const landscape = w > h;
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

  // Using elementActions.handleDelete and elementActions.handleClear from hook

  const zoomIn = () => {
    setCanvasZoom(prev => Math.min(prev + 0.1, 2)); // Max 200%
  };

  const zoomOut = () => {
    setCanvasZoom(prev => Math.max(prev - 0.1, 0.2)); // Min 20%
  };

  const zoomReset = () => {
    setCanvasZoom(1);
  };
  
  // Two-finger pan gesture for scrolling the container
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Two fingers - pan the scroll container
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        if (lastTouchCenter.current) {
          const dx = lastTouchCenter.current.x - centerX;
          const dy = lastTouchCenter.current.y - centerY;
          scrollContainer.scrollLeft += dx;
          scrollContainer.scrollTop += dy;
        }
        
        lastTouchCenter.current = { x: centerX, y: centerY };
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      lastTouchCenter.current = null;
    };
    
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollContainer.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const zoomToFit = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerWidth = container.clientWidth - 40; // Padding
    const containerHeight = container.clientHeight - 80; // Padding + indicator
    
    const scaleX = containerWidth / canvasSize.width;
    const scaleY = containerHeight / canvasSize.height;
    const scale = Math.min(scaleX, scaleY, 1); // Ne pas zoomer plus que 100%
    
    setCanvasZoom(scale);
  }, [canvasSize]);

  // Auto-zoom to fit when entering grid mode or changing grid template
  useEffect(() => {
    if (grid.gridMode === 'grid' && grid.gridZones.length > 0) {
      // Small delay to ensure layout is ready
      setTimeout(() => {
        zoomToFit();
      }, 100);
    }
  }, [grid.gridMode, grid.gridZones.length, zoomToFit]);

  // Using textEmoji.addText, textEmoji.addEmoji, textEmoji.handleTextDoubleClick,
  // textEmoji.saveTextEdit, textEmoji.cancelTextEdit from hook

  const handleExport = async () => {
    if (!stageRef.current) return;
    
    setIsExporting(true);
    setExportProgress(5);
    
    // Désélectionner temporairement pour cacher les contrôles
    const previousSelection = selectedId;
    setSelectedId(null);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    setExportProgress(15);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    setExportProgress(25);
    
    // Attendre que les contrôles soient masqués
    setTimeout(async () => {
      const stage = stageRef.current!;
      let exportOptions: { pixelRatio: number; mimeType: string; x?: number; y?: number; width?: number; height?: number } = {
        pixelRatio: 2,
        mimeType: 'image/png',
      };

      setExportProgress(35);
      
      // In grid mode, always export full canvas. In free mode with content export, crop to content.
      if (exportMode === 'content' && grid.gridMode === 'free') {
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
      } else if (grid.gridMode === 'grid') {
        // Grid mode: export full canvas with exact dimensions
        exportOptions = {
          ...exportOptions,
          x: 0,
          y: 0,
          width: canvasSize.width,
          height: canvasSize.height
        };
      }

      setExportProgress(45);
      await new Promise(resolve => setTimeout(resolve, 50));
      setExportProgress(55);
      
      const uri = stage.toDataURL(exportOptions);
      
      setExportProgress(75);
      await new Promise(resolve => setTimeout(resolve, 50));
      setExportProgress(85);

      if (Capacitor.isNativePlatform()) {
        (async () => {
          try {
            setExportProgress(90);
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
          } finally {
            setExportProgress(100);
            setTimeout(() => {
              setIsExporting(false);
              setExportProgress(0);
            }, 500);
          }
        })();
      } else {
        setExportProgress(90);
        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = uri;
        link.click();
        setToast(t('toast.exportDownloaded'));
        setExportProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
        }, 500);
      }
      
      // Restaurer la sélection
      setSelectedId(previousSelection);
    }, 200);
  };

  const handleTransform = (id: string, newAttrs: Partial<CanvasElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...newAttrs } as CanvasElement : el
    ));
  };

  // Using elementActions.bringToFront, elementActions.sendToBack,
  // elementActions.bringForward, elementActions.sendBackward from hook

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

  // Crop functions moved to elementActions hook

  // Handle new composition choices
  const handleStartFreeMode = useCallback(() => {
    grid.setGridMode('free');
    setShowNewComposition(false);
  }, [grid]);

  const handleStartGridMode = (gridId: string) => {
    grid.setGridMode('grid');
    grid.selectGrid(gridId);
    
    // Auto-adapt canvas format based on orientation
    if (isLandscape) {
      // Landscape orientation - prefer 16:9 format
      setCanvasSize({ width: 1920, height: 1080 });
      setSelectedPreset('landscape');
    } else {
      // Portrait orientation - prefer 9:16 format  
      setCanvasSize({ width: 1080, height: 1920 });
      setSelectedPreset('ig-story');
    }
    setShowNewComposition(false);
  };
  
  // New composition - reset everything
  const handleNewComposition = () => {
    elementActions.handleClear(); // Clear all elements
    grid.clearGrid(); // Clear grid zones
    grid.setGridMode('free'); // Reset to free mode
    setCanvasZoom(1); // Reset zoom
    setShowNewComposition(true); // Show composition modal
  };

  // Handle adding image to a specific grid zone
  const handleAddToZone = useCallback((zoneId: string) => {
    const zone = grid.gridZones.find(z => z.id === zoneId);
    if (!zone) return;

    // Calculate zone absolute dimensions
    const zoneAbsX = zone.x * canvasSize.width;
    const zoneAbsY = zone.y * canvasSize.height;
    const zoneAbsWidth = zone.width * canvasSize.width;
    const zoneAbsHeight = zone.height * canvasSize.height;

    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Load image to get dimensions
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = reject;
        image.src = url;
      });

      // Calculate scale to fill zone (cover mode)
      const scaleX = zoneAbsWidth / img.width;
      const scaleY = zoneAbsHeight / img.height;
      const scale = Math.max(scaleX, scaleY); // Cover mode - image may overflow

      const baseZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;

      const newImage: ImageElement = {
        type: 'image',
        id: Math.random().toString(36).substr(2, 9),
        image: img,
        x: zoneAbsX + (zoneAbsWidth - img.width * scale) / 2, // Center in zone
        y: zoneAbsY + (zoneAbsHeight - img.height * scale) / 2,
        width: img.width,
        height: img.height,
        rotation: 0,
        scaleX: scale,
        scaleY: scale,
        zIndex: baseZ + 1,
      };

      setElements(prev => [...prev, newImage]);
      setSelectedId(newImage.id);
      grid.assignElementToZone(zoneId, newImage.id);
    };
    input.click();
  }, [grid, canvasSize, elements, setElements, setSelectedId]);

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const sortedImages = sortedElements.filter((el): el is ImageElement => el.type === 'image');
  const sortedTexts = sortedElements.filter((el): el is TextElement => el.type === 'text');
  const sortedEmojis = sortedElements.filter((el): el is EmojiElement => el.type === 'emoji');
  const sortedStickers = sortedElements.filter((el): el is StickerElement => el.type === 'sticker');

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
        
        {/* Canvas Area - Always full width (no sidebar) */}
        <div>
          <div>
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
                {elements.length === 0 && grid.gridMode === 'free' ? (
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
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
                      {grid.gridMode === 'grid' ? (
                        <>
                          {/* Images clipped in zones */}
                          <GridModeLayer
                            zones={grid.gridZones}
                            elements={elements}
                            canvasWidth={canvasSize.width}
                            canvasHeight={canvasSize.height}
                            selectedId={selectedId}
                            onSelectElement={setSelectedId}
                            onTransform={handleTransform}
                            onAddToZone={handleAddToZone}
                            snapRotation={snapRotation}
                            lineColor={grid.gridLineColor}
                            lineWidth={grid.gridLineWidth}
                            lineStyle={grid.gridLineStyle}
                          />
                          {/* Texts and emojis NOT clipped - drawn on entire grid */}
                          <Layer>
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
                            {sortedStickers.map((sticker) => (
                              <StickerComponent
                                key={sticker.id}
                                sticker={sticker}
                                isSelected={sticker.id === selectedId}
                                onSelect={() => setSelectedId(sticker.id)}
                                onTransform={handleTransform}
                                snapRotation={snapRotation}
                              />
                            ))}
                          </Layer>
                        </>
                      ) : (
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
                              onDoubleClick={textEmoji.handleTextDoubleClick}
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
                          {sortedStickers.map((sticker) => (
                            <StickerComponent
                              key={sticker.id}
                              sticker={sticker}
                              isSelected={sticker.id === selectedId}
                              onSelect={() => setSelectedId(sticker.id)}
                              onTransform={handleTransform}
                              snapRotation={snapRotation}
                            />
                          ))}
                        </Layer>
                      )}
                      
                      {/* Grid overlay */}
                      <GridOverlay
                        zones={grid.gridZones}
                        canvasWidth={canvasSize.width}
                        canvasHeight={canvasSize.height}
                        visible={grid.showGridOverlay}
                        lineColor={grid.gridLineColor}
                        lineWidth={grid.gridLineWidth}
                        lineStyle={grid.gridLineStyle}
                      />
                    </Stage>
                  </div>
                )}
              </div>
            </div>
            {(elements.length > 0 || grid.gridMode === 'grid') && (
              <div className="mt-4 text-center text-sm text-gray-500">
                {grid.gridMode === 'grid' 
                  ? `${grid.gridZones.length} ${t('grid.zones')} • ${canvasSize.width}×${canvasSize.height}px`
                  : `${t('canvas.imageCount', { count: elements.length })} • ${canvasSize.width}×${canvasSize.height}px`
                }
                {selectedId && ` • ${t('canvas.imageSelected')}`}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Toolbar - Always visible (adapts to portrait/landscape) */}
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
        onEditText={() => selectedElement?.type === 'text' && handleTextDoubleClick(selectedElement.id)}
        onCrop={elementActions.startCrop}
        onToggleFilters={() => setShowFilters(s => !s)}
        onAddText={addTextWithEditor}
        onAddEmoji={() => setShowEmojiPicker(true)}
        onShowStickerPicker={() => setShowStickerPicker(true)}
        onShowGridSelector={() => setShowGridSelector(true)}
        gridMode={grid.gridMode}
        onExport={handleExport}
        onShowLineSettings={() => setShowLineSettings(true)}
        onShowCanvasSizeMenu={() => setShowCanvasSizeMenu(true)}
        canvasSize={canvasSize}
        canvasZoom={canvasZoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        onNewComposition={handleNewComposition}
        onBringForward={elementActions.bringForward}
        onSendBackward={elementActions.sendBackward}
        onDelete={elementActions.handleDelete}
        onApplyCrop={elementActions.applyCrop}
        onCancelCrop={elementActions.cancelCrop}
      />
      
      {/* Filters panel */}
      <MobileFiltersPanel
        show={showFilters && selectedId !== null && !isCropping}
        isLandscape={isLandscape}
        filters={tempFilters}
        onFilterChange={updateTempFilter}
        onReset={resetFilters}
        onClose={() => setShowFilters(false)}
      />
      {/* Canvas size selector modal */}
      {showCanvasSizeMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCanvasSizeMenu(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">
              {t('canvas.size') || 'Taille du canvas'}
            </h4>
            <div className="space-y-2">
              {canvasPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setCanvasSize({ width: preset.width, height: preset.height });
                    setSelectedPreset(preset.id);
                    setShowCanvasSizeMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm rounded-lg transition-colors ${
                    selectedPreset === preset.id 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.name} <span className="text-xs opacity-75">({preset.width}×{preset.height})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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

      {/* Grid Line Settings Modal */}
      {showLineSettings && grid.gridMode === 'grid' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLineSettings(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <GridLineSettings
              lineColor={grid.gridLineColor}
              lineWidth={grid.gridLineWidth}
              lineStyle={grid.gridLineStyle}
              onColorChange={grid.setGridLineColor}
              onWidthChange={grid.setGridLineWidth}
              onStyleChange={grid.setGridLineStyle}
              onClose={() => setShowLineSettings(false)}
            />
          </div>
        </div>
      )}

      {/* Text Editor Modal */}
      <TextEditorModal
        show={!!editingTextElement}
        textElement={editingTextElement}
        onSave={(id, updates) => {
          setElements(prev => prev.map(el => 
            el.id === id && el.type === 'text' ? { ...el, ...updates } as TextElement : el
          ));
          setEditingTextElement(null);
        }}
        onCancel={() => setEditingTextElement(null)}
      />

      {/* Export Progress Modal */}
      <ExportProgressModal
        show={isExporting}
        progress={exportProgress}
      />

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
                    textEmoji.addEmoji(emoji);
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

      {/* Sticker picker */}
      <StickerPicker
        show={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelectSticker={(stickerId, category) => {
          stickers.addSticker(stickerId, category);
        }}
      />
      
      {/* New Composition Modal - shown at startup */}
      <NewCompositionModal
        show={showNewComposition}
        isLandscape={isLandscape}
        onSelectFree={handleStartFreeMode}
        onSelectGrid={handleStartGridMode}
        onClose={() => setShowNewComposition(false)}
      />

      {/* Grid selector modal - for changing grid after starting */}
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
