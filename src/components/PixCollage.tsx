import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text } from 'react-konva';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { 
  PhotoIcon, 
  ArrowDownTrayIcon, 
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  ScissorsIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Capacitor } from '@capacitor/core';

interface BaseElement {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
}

interface ImageElement extends BaseElement {
  type: 'image';
  image: HTMLImageElement;
  width: number;
  height: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    grayscale: boolean;
    sepia: boolean;
  };
}

interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  width?: number;
}

interface EmojiElement extends BaseElement {
  type: 'emoji';
  emoji: string;
  fontSize: number;
}

type CanvasElement = ImageElement | TextElement | EmojiElement;

interface TempCropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PixCollage = () => {
  const { t, i18n } = useTranslation();
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
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
  
  // État temporaire pour affichage instantané des filtres
  const [tempFilters, setTempFilters] = useState<NonNullable<ImageElement['filters']> | null>(null);
  const debouncedFilters = useDebounce(tempFilters, 300); // Augmenté pour réduire les re-renders

  const selectedElement = elements.find(el => el.id === selectedId);
  const selectedImage = selectedElement?.type === 'image' ? selectedElement : null;

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

  // Initialize canvas size based on viewport on first load (mobile-friendly)
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768;
    if (!isMobile) return;
    const padH = 40; // horizontal padding
    const padV = 260; // header + bottom toolbar approx
    let targetW = Math.min(1080, Math.max(320, w - padH));
    let targetH: number;
    if (h > w) {
      // Portrait default ~ 4:5
      const maxH = Math.max(240, h - padV);
      targetH = Math.round(targetW * 5 / 4);
      if (targetH > maxH) {
        targetH = maxH;
        targetW = Math.round(targetH * 4 / 5);
      }
    } else {
      // Landscape default ~ 16:9
      const maxH = Math.max(240, h - padV);
      targetH = Math.round(targetW * 9 / 16);
      if (targetH > maxH) {
        targetH = maxH;
        targetW = Math.round(targetH * 16 / 9);
      }
    }
    setCanvasSize({ width: targetW, height: targetH });
  }, []);

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const loaded = await Promise.all(acceptedFiles.map(f => loadImage(f)));
    const baseZ = elements.length > 0 ? Math.max(...elements.map(img => img.zIndex)) : 0;
    const created: ImageElement[] = loaded.map((img, i) => {
      const scale = Math.min(
        canvasSize.width / 3 / img.width,
        canvasSize.height / 3 / img.height
      );
      const displayW = img.width * scale;
      const displayH = img.height * scale;
      const jitter = (i - (loaded.length - 1) / 2) * 16;
      const maxX = Math.max(0, canvasSize.width - displayW);
      const maxY = Math.max(0, canvasSize.height - displayH);
      const cxRaw = (canvasSize.width - displayW) / 2 + jitter;
      const cyRaw = (canvasSize.height - displayH) / 2 + jitter;
      const cx = Math.min(Math.max(0, cxRaw), maxX);
      const cy = Math.min(Math.max(0, cyRaw), maxY);
      return {
        type: 'image',
        id: Math.random().toString(36).substr(2, 9),
        image: img,
        x: cx,
        y: cy,
        width: img.width,
        height: img.height,
        rotation: 0,
        scaleX: scale,
        scaleY: scale,
        zIndex: baseZ + i + 1,
      };
    });
    setElements(prev => [...prev, ...created]);
    setSelectedId(created[created.length - 1]?.id ?? null);
    setToast(t('toast.imageAdded', { count: created.length }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const targetLeft = Math.max(0, (canvasSize.width - el.clientWidth) / 2);
      const targetTop = Math.max(0, (canvasSize.height - el.clientHeight) / 2);
      el.scrollTo({ left: targetLeft, top: targetTop, behavior: 'smooth' });
    });
  }, [canvasSize, elements.length]);

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

  const handleTransform = (id: string, newAttrs: Partial<BaseElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...newAttrs } : el
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
          {/* Sidebar */}
          <div className="hidden md:block lg:col-span-1 space-y-3 sm:space-y-4">
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
                    onDrop(Array.from(e.target.files));
                  }
                }}
                className="hidden"
              />
              <div className="space-y-2">
                <button
                  onClick={() => (open ? open() : fileInputRef.current?.click())}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                >
                  <PhotoIcon className="h-5 w-5" />
                  {t('sidebar.add')}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={addText}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('canvas.addText')}
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(true)}
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
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{t('sidebar.width')}</label>
                  <input
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{t('sidebar.height')}</label>
                  <input
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setCanvasSize({ width: 1920, height: 1080 })}
                    className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {t('sidebar.fullHD')}
                  </button>
                  <button
                    onClick={() => setCanvasSize({ width: 1080, height: 1080 })}
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
                  onClick={() => setSnapRotation(!snapRotation)}
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
              <p className="text-xs text-gray-500 mt-2">
                {t('sidebar.snapDesc')}
              </p>
            </div>

            {/* Z-Order Controls */}
            {selectedId && (
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="font-semibold text-gray-800 mb-3">{t('sidebar.zOrder')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={bringToFront}
                    className="px-3 py-2 text-xs font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                    title="Premier plan"
                  >
                    <ChevronDoubleUpIcon className="h-4 w-4" />
                    Premier
                  </button>
                  <button
                    onClick={bringForward}
                    className="px-3 py-2 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-1"
                    title="Avancer"
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                    Avancer
                  </button>
                  <button
                    onClick={sendBackward}
                    className="px-3 py-2 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors flex items-center justify-center gap-1"
                    title="Reculer"
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                    Reculer
                  </button>
                  <button
                    onClick={sendToBack}
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
                  onClick={startCrop}
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
                {/* Alerte rotation supprimée: le recadrage est désormais fiable */}
                <div className="space-y-2">
                  <button
                    onClick={applyCrop}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Appliquer
                  </button>
                  <button
                    onClick={cancelCrop}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            {selectedId && !isCropping && (
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
                      <span className="text-indigo-600">{tempFilters?.brightness ?? 100}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={tempFilters?.brightness ?? 100}
                      onChange={(e) => updateTempFilter('brightness', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex justify-between">
                      <span>Contraste</span>
                      <span className="text-indigo-600">{tempFilters?.contrast ?? 100}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={tempFilters?.contrast ?? 100}
                      onChange={(e) => updateTempFilter('contrast', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex justify-between">
                      <span>Saturation</span>
                      <span className="text-indigo-600">{tempFilters?.saturation ?? 100}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={tempFilters?.saturation ?? 100}
                      onChange={(e) => updateTempFilter('saturation', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex justify-between">
                      <span>Flou</span>
                      <span className="text-indigo-600">{tempFilters?.blur ?? 0}px</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={tempFilters?.blur ?? 0}
                      onChange={(e) => updateTempFilter('blur', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Grayscale & Sepia */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => updateTempFilter('grayscale', !tempFilters?.grayscale)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        tempFilters?.grayscale
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      N&B
                    </button>
                    <button
                      onClick={() => updateTempFilter('sepia', !tempFilters?.sepia)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        tempFilters?.sepia
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      Sépia
                    </button>
                  </div>

                  <button
                    onClick={resetFilters}
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
                    <span className="text-indigo-600">{exportMode === 'content' ? 'Contenu' : 'Canvas complet'}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExportMode('content')}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        exportMode === 'content' ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Contenu
                    </button>
                    <button
                      onClick={() => setExportMode('canvas')}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        exportMode === 'canvas' ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Canvas
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={!selectedId}
                  className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md disabled:hover:shadow-sm"
                >
                  <TrashIcon className="h-4 w-4" />
                  Supprimer
                </button>
                <button
                  onClick={handleClear}
                  className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                >
                  <TrashIcon className="h-4 w-4" />
                  Tout effacer
                </button>
                <button
                  onClick={handleExport}
                  disabled={elements.length === 0}
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

          {/* Canvas Area */}
          <div className="lg:col-span-4">
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
                  <div style={{ width: canvasSize.width, height: canvasSize.height }}>
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
                            snapRotation={snapRotation}
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
                            snapRotation={snapRotation}
                          />
                        ))}
                      </Layer>
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
      {/* Mobile bottom toolbar */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        {toast && (
          <div className="mb-2 mx-auto w-fit px-3 py-1.5 rounded bg-black/80 text-white text-xs shadow">
            {toast}
          </div>
        )}
        <div className="mx-auto mb-3 max-w-xl px-3">
          <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-lg rounded-2xl border border-gray-200 p-3">
            {!isCropping ? (
              <div className="grid grid-cols-3 gap-2">
                {/* Ligne 1 */}
                <button 
                  onClick={() => (open ? open() : fileInputRef.current?.click())} 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-600 text-white shadow-sm active:scale-95 transition-transform"
                >
                  <PhotoIcon className="h-5 w-5" />
                  <span>{t('mobile.add')}</span>
                </button>
                
                {selectedElement?.type === 'text' ? (
                  <button 
                    onClick={() => handleTextDoubleClick(selectedElement.id, selectedElement.text)} 
                    className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-blue-600 text-white active:scale-95 transition-transform"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <span>{t('mobile.edit')}</span>
                  </button>
                ) : (
                  <button 
                    onClick={startCrop} 
                    disabled={!selectedImage} 
                    className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                  >
                    <ScissorsIcon className="h-5 w-5" />
                    <span>{t('mobile.crop')}</span>
                  </button>
                )}
                
                <button 
                  onClick={() => setShowFilters((s) => !s)} 
                  disabled={!selectedImage} 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>{t('mobile.effects')}</span>
                </button>
                
                {/* Ligne 2 */}
                <button 
                  onClick={addText} 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-blue-100 text-blue-700 active:scale-95 transition-transform"
                >
                  <span className="text-lg font-bold">T</span>
                  <span>Texte</span>
                </button>
                
                <button 
                  onClick={() => setShowEmojiPicker(true)} 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-yellow-100 text-yellow-700 active:scale-95 transition-transform"
                >
                  <span className="text-xl">😊</span>
                  <span>Emoji</span>
                </button>
                
                <button 
                  onClick={handleExport} 
                  disabled={elements.length === 0} 
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>{t('mobile.export')}</span>
                </button>
                
                {/* Ligne 3 - Z-order et Delete */}
                <button
                  onClick={bringForward}
                  disabled={!selectedId}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-50 text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <ArrowUpIcon className="h-5 w-5" />
                  <span>{t('mobile.forward')}</span>
                </button>
                
                <button
                  onClick={sendBackward}
                  disabled={!selectedId}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-indigo-50 text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <ArrowDownIcon className="h-5 w-5" />
                  <span>{t('mobile.backward')}</span>
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={!selectedId}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3 min-h-[56px] text-xs font-medium rounded-xl bg-red-50 text-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>Suppr.</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={applyCrop} 
                  className="flex items-center justify-center gap-2 px-4 py-4 min-h-[56px] text-sm font-medium rounded-xl bg-green-600 text-white active:scale-95 transition-transform"
                >
                  <CheckIcon className="h-5 w-5" />
                  {t('mobile.apply')}
                </button>
                <button 
                  onClick={cancelCrop} 
                  className="flex items-center justify-center gap-2 px-4 py-4 min-h-[56px] text-sm font-medium rounded-xl bg-gray-600 text-white active:scale-95 transition-transform"
                >
                  <XMarkIcon className="h-5 w-5" />
                  {t('mobile.cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile filters bottom sheet */}
      {showFilters && selectedId && !isCropping && (
        <div className="fixed inset-x-0 bottom-16 z-50 md:hidden">
          <div className="mx-auto max-w-xl px-3">
            <div className="bg-white/95 backdrop-blur border border-gray-200 shadow-xl rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-800">{t('sidebar.filters')}</div>
                <button className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-700 font-medium" onClick={() => setShowFilters(false)}>{t('mobile.close')}</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 flex justify-between">
                    <span>{t('sidebar.brightness')}</span>
                    <span className="text-indigo-600">{tempFilters?.brightness ?? 100}%</span>
                  </label>
                  <input type="range" min="0" max="200" value={tempFilters?.brightness ?? 100} onChange={(e) => updateTempFilter('brightness', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 flex justify-between">
                    <span>{t('sidebar.contrast')}</span>
                    <span className="text-indigo-600">{tempFilters?.contrast ?? 100}%</span>
                  </label>
                  <input type="range" min="0" max="200" value={tempFilters?.contrast ?? 100} onChange={(e) => updateTempFilter('contrast', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 flex justify-between">
                    <span>{t('sidebar.saturation')}</span>
                    <span className="text-indigo-600">{tempFilters?.saturation ?? 100}%</span>
                  </label>
                  <input type="range" min="0" max="200" value={tempFilters?.saturation ?? 100} onChange={(e) => updateTempFilter('saturation', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 flex justify-between">
                    <span>{t('sidebar.blur')}</span>
                    <span className="text-indigo-600">{tempFilters?.blur ?? 0}px</span>
                  </label>
                  <input type="range" min="0" max="20" value={tempFilters?.blur ?? 0} onChange={(e) => updateTempFilter('blur', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => updateTempFilter('grayscale', !tempFilters?.grayscale)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${tempFilters?.grayscale ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('sidebar.grayscale')}</button>
                  <button onClick={() => updateTempFilter('sepia', !tempFilters?.sepia)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${tempFilters?.sepia ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-700'}`}>{t('sidebar.sepia')}</button>
                </div>
                <button onClick={resetFilters} className="w-full px-3 py-2 text-xs font-medium bg-red-100 text-red-700 rounded-lg">{t('sidebar.resetFilters')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Language selector */}
      <div className="fixed top-4 right-4 z-50">
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
    </div>
  );
};

interface ImageComponentProps {
  imageData: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, newAttrs: Partial<ImageElement>) => void;
  snapRotation: boolean;
  isCropping: boolean;
  tempCropData: { x: number; y: number; width: number; height: number } | null;
  onCropChange: (data: { x: number; y: number; width: number; height: number } | null) => void;
}

const ImageComponent = ({ imageData, isSelected, onSelect, onTransform, snapRotation, isCropping, tempCropData, onCropChange }: ImageComponentProps) => {
  const imageRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const cropRef = useRef<Konva.Rect>(null);
  const cropTrRef = useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected && !isCropping && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isCropping]);

  React.useEffect(() => {
    if (isCropping && isSelected && tempCropData) {
      // Attendre que le rectangle soit rendu
      setTimeout(() => {
        if (cropTrRef.current && cropRef.current) {
          cropTrRef.current.nodes([cropRef.current]);
          cropTrRef.current.getLayer()?.batchDraw();
          
          // Le transformer est attaché au rect de crop une fois rendu
        }
      }, 50); // Augmenter le délai pour s'assurer que tout est rendu
    }
  }, [isCropping, isSelected, tempCropData, imageData.x, imageData.y]);

  // Apply filters
  React.useEffect(() => {
    const node = imageRef.current;
    if (!node) return;

    // Ne pas appliquer de filtres en mode crop pour éviter les problèmes de rendu
    if (isCropping) {
      node.clearCache();
      node.filters([]);
      node.getLayer()?.batchDraw();
      return;
    }

    const { filters: imgFilters } = imageData;

    // Si pas de filtres, ne rien toucher
    if (!imgFilters) {
      return;
    }

    // Réinitialiser les filtres d'abord
    node.clearCache();
    node.filters([]);

    if (imgFilters) {
      const filtersToApply: any[] = [];
      
      // Brightness, Contrast
      if (imgFilters.brightness !== 100 || imgFilters.contrast !== 100) {
        filtersToApply.push(Konva.Filters.Brighten);
        filtersToApply.push(Konva.Filters.Contrast);
      }

      if (imgFilters.blur > 0) {
        filtersToApply.push(Konva.Filters.Blur);
      }

      if (imgFilters.grayscale) {
        filtersToApply.push(Konva.Filters.Grayscale);
      }

      if (imgFilters.sepia) {
        filtersToApply.push(Konva.Filters.Sepia);
      }

      // Apply saturation using HSL
      if (imgFilters.saturation !== 100) {
        filtersToApply.push(Konva.Filters.HSL);
      }

      if (filtersToApply.length > 0) {
        node.filters(filtersToApply);
        node.brightness((imgFilters.brightness - 100) / 100);
        node.contrast((imgFilters.contrast - 100) / 100);
        node.blurRadius(imgFilters.blur || 0);
        node.saturation((imgFilters.saturation - 100) / 100);
        
        // NE PAS cacher immédiatement - le cache sera appliqué après un délai
        // Cela permet une manipulation fluide pendant l'ajustement des filtres
      }
    }

    node.getLayer()?.batchDraw();
    
    // Cache différé: appliquer le cache seulement après 800ms sans changement
    // Cela optimise le rendu final sans ralentir les ajustements
    const cacheTimer = setTimeout(() => {
      if (!node || !imgFilters) return;
      
      const filtersActive = 
        imgFilters.brightness !== 100 || 
        imgFilters.contrast !== 100 ||
        imgFilters.saturation !== 100 ||
        imgFilters.blur > 0 ||
        imgFilters.grayscale ||
        imgFilters.sepia;
        
      if (filtersActive) {
        const layer = node.getLayer();
        const stage = layer?.getStage();
        if (stage) {
          const textNodes = stage.find('Text') as Konva.Text[];
          const textNodesVisibility = textNodes.map(n => n.visible());
          textNodes.forEach(n => n.visible(false));
          
          node.cache();
          
          textNodes.forEach((n, i) => n.visible(textNodesVisibility[i]));
        } else {
          node.cache();
        }
        node.getLayer()?.batchDraw();
      }
    }, 800);
    
    return () => clearTimeout(cacheTimer);
  }, [imageData.filters, isCropping]); // Ne dépendre QUE des filtres, pas de toute l'imageData

  const snapToGrid = (rotation: number): number => {
    if (!snapRotation) return rotation;
    
    const snapAngles = [0, 90, 180, 270, 360];
    const threshold = 10; // degrees
    
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    for (const snapAngle of snapAngles) {
      if (Math.abs(normalizedRotation - snapAngle) < threshold) {
        return snapAngle;
      }
    }
    
    return rotation;
  };

  return (
    <>
      <KonvaImage
        ref={imageRef}
        id={`image-${imageData.id}`}
        name={`image-${imageData.id}`}
        image={imageData.image}
        x={imageData.x}
        y={imageData.y}
        width={imageData.width}
        height={imageData.height}
        scaleX={imageData.scaleX}
        scaleY={imageData.scaleY}
        rotation={imageData.rotation}
        crop={imageData.crop}
        draggable={!isCropping}
        onClick={onSelect}
        onTap={onSelect}
        opacity={1}
        onDragStart={() => {
          // Ne JAMAIS clearCache - les filtres restent visibles
          // Accepter une légère perte de performance au lieu de filtres qui disparaissent
        }}
        onDragEnd={(e) => {
          if (!isCropping) {
            onTransform(imageData.id, {
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
        onTransformStart={() => {
          // Ne JAMAIS clearCache - les filtres restent visibles
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;
          
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          let rotation = node.rotation();

          // Apply snap to rotation
          rotation = snapToGrid(rotation);

          onTransform(imageData.id, {
            x: node.x(),
            y: node.y(),
            rotation,
            scaleX,
            scaleY,
          });
        }}
      />
      {isSelected && !isCropping && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
      {isCropping && tempCropData && isSelected && (
        <>
          {/* Rectangle de crop rouge */}
          <Rect
            key={`crop-rect-${tempCropData.x}-${tempCropData.y}-${tempCropData.width}-${tempCropData.height}`}
            ref={cropRef}
            x={tempCropData.x}
            y={tempCropData.y}
            width={tempCropData.width}
            height={tempCropData.height}
            stroke="#FF0000"
            strokeWidth={5}
            dash={[15, 10]}
            fill="rgba(255, 0, 0, 0.05)"
            draggable
            dragBoundFunc={(pos) => {
              // Utiliser le bounding box du NODE IMAGE RÉEL (comme le Transformer)
              const stage = cropRef.current?.getStage();
              const imgNode = stage ? (stage.findOne(`.image-${imageData.id}`) as Konva.Image | null) : null;
              const boundingBox = imgNode
                ? imgNode.getClientRect({ skipStroke: true, skipShadow: true })
                : { x: imageData.x, y: imageData.y, width: imageData.width * imageData.scaleX, height: imageData.height * imageData.scaleY } as any;
              const minX = boundingBox.x;
              const minY = boundingBox.y;
              const maxX = boundingBox.x + boundingBox.width - tempCropData.width;
              const maxY = boundingBox.y + boundingBox.height - tempCropData.height;
              return {
                x: Math.max(minX, Math.min(pos.x, maxX)),
                y: Math.max(minY, Math.min(pos.y, maxY))
              };
            }}
            onDragEnd={(e: KonvaEventObject<DragEvent>) => {
              const node = e.target;
              const newX = node.x();
              const newY = node.y();
              onCropChange({
                x: newX,
                y: newY,
                width: tempCropData.width,
                height: tempCropData.height
              });
            }}
            onTransformEnd={(e: KonvaEventObject<Event>) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              
              // Réinitialiser le scale
              node.scaleX(1);
              node.scaleY(1);
              
              const newWidth = Math.max(20, node.width() * scaleX);
              const newHeight = Math.max(20, node.height() * scaleY);
              const newX = node.x();
              const newY = node.y();
              
              node.width(newWidth);
              node.height(newHeight);
              
              // Utiliser le bounding box du NODE IMAGE RÉEL pour les limites maximales
              const stage = cropRef.current?.getStage();
              const imgNode = stage ? (stage.findOne(`.image-${imageData.id}`) as Konva.Image | null) : null;
              const boundingBox = imgNode
                ? imgNode.getClientRect({ skipStroke: true, skipShadow: true })
                : { x: imageData.x, y: imageData.y, width: imageData.width * imageData.scaleX, height: imageData.height * imageData.scaleY } as any;
              const finalWidth = Math.min(newWidth, boundingBox.width - (newX - boundingBox.x));
              const finalHeight = Math.min(newHeight, boundingBox.height - (newY - boundingBox.y));

              onCropChange({
                x: newX,
                y: newY,
                width: finalWidth,
                height: finalHeight
              });
            }}
          />
          <Transformer
            ref={cropTrRef}
            rotateEnabled={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'middle-left', 'middle-right', 'bottom-center']}
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </>
      )}
    </>
  );
};

interface TextComponentProps {
  textData: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, newAttrs: Partial<BaseElement>) => void;
  snapRotation: boolean;
  onDoubleClick: (id: string, currentText: string) => void;
}

const TextComponent = ({ textData, isSelected, onSelect, onTransform, snapRotation, onDoubleClick }: TextComponentProps) => {
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        text={textData.text}
        x={textData.x}
        y={textData.y}
        fontSize={textData.fontSize}
        fontFamily={textData.fontFamily}
        fill={textData.fill}
        rotation={textData.rotation}
        scaleX={textData.scaleX}
        scaleY={textData.scaleY}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => onDoubleClick(textData.id, textData.text)}
        onDblTap={() => onDoubleClick(textData.id, textData.text)}
        onDragEnd={(e: KonvaEventObject<DragEvent>) => {
          onTransform(textData.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e: KonvaEventObject<Event>) => {
          const node = e.target;
          const rotation = snapRotation ? Math.round(node.rotation() / 90) * 90 : node.rotation();
          onTransform(textData.id, {
            x: node.x(),
            y: node.y(),
            rotation,
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotationSnaps={snapRotation ? [0, 90, 180, 270] : []}
          borderStroke="#4F46E5"
          borderStrokeWidth={2}
          anchorFill="#4F46E5"
          anchorStroke="#fff"
          anchorSize={8}
        />
      )}
    </>
  );
};

interface EmojiComponentProps {
  emojiData: EmojiElement;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, newAttrs: Partial<BaseElement>) => void;
  snapRotation: boolean;
}

const EmojiComponent = ({ emojiData, isSelected, onSelect, onTransform, snapRotation }: EmojiComponentProps) => {
  const emojiRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && emojiRef.current) {
      trRef.current.nodes([emojiRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={emojiRef}
        text={emojiData.emoji}
        x={emojiData.x}
        y={emojiData.y}
        fontSize={emojiData.fontSize}
        rotation={emojiData.rotation}
        scaleX={emojiData.scaleX}
        scaleY={emojiData.scaleY}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e: KonvaEventObject<DragEvent>) => {
          onTransform(emojiData.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e: KonvaEventObject<Event>) => {
          const node = e.target;
          const rotation = snapRotation ? Math.round(node.rotation() / 90) * 90 : node.rotation();
          onTransform(emojiData.id, {
            x: node.x(),
            y: node.y(),
            rotation,
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotationSnaps={snapRotation ? [0, 90, 180, 270] : []}
          borderStroke="#9333EA"
          borderStrokeWidth={2}
          anchorFill="#9333EA"
          anchorStroke="#fff"
          anchorSize={8}
        />
      )}
    </>
  );
};

export default PixCollage;
