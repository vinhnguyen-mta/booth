import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import { FilterSelector } from '../components/FilterSelector';
import { SkinSmoothingControl } from '../components/SkinSmoothingControl';
import { translations } from '../i18n/translations';

export const Filters: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    language, 
    selectedFrame, 
    capturedImages,
    selectedFilter,
    setSelectedFilter,
    setFinalImage,
    setCurrentStep
  } = useAppStore();
  const t = translations[language];
  
  const [fillMode, setFillMode] = useState(false);
  const [processedImage, setProcessedImage] = useState<HTMLCanvasElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(true);

  // Initialize selected images based on frame panels
  useEffect(() => {
    if (selectedFrame && capturedImages.length > 0) {
      const requiredCount = selectedFrame.panels;
      const initialSelection = capturedImages.slice(0, requiredCount);
      setSelectedImages(initialSelection);
    }
  }, [selectedFrame, capturedImages]);

  useEffect(() => {
    if (selectedImages.length > 0) {
      generatePreview();
    }
  }, [selectedFilter, selectedImages, fillMode]);

  const generatePreview = async () => {
    if (!canvasRef.current || !selectedFrame || selectedImages.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on frame layout
    canvas.width = 800;
    canvas.height = selectedFrame.layout === 'strip-4' ? 1200 : 800;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images based on layout
    await drawImagesWithLayout(ctx, selectedImages, selectedFrame.layout);

    // Draw frame overlay
    await drawFrameOverlay(ctx, selectedFrame.svg);

    // Save final image
    const finalImageData = canvas.toDataURL('image/jpeg', 0.9);
    setFinalImage(finalImageData);
    setFinalImage(finalImageData);
  };

  const drawImagesWithLayout = async (
    ctx: CanvasRenderingContext2D,
    images: string[],
    layout: string
  ) => {
    const imagePromises = images.map(src => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    });

    const loadedImages = await Promise.all(imagePromises);

    // Apply filter
    if (selectedFilter !== 'original') {
      const filter = getFilterCSS(selectedFilter);
      ctx.filter = filter;
    }

    switch (layout) {
      case 'single':
        if (loadedImages[0]) {
          drawImageFit(ctx, loadedImages[0], 50, 50, 700, 700, fillMode ? 'cover' : 'contain');
        }
        break;
      
      case 'strip-4':
        loadedImages.slice(0, 4).forEach((img, index) => {
          const y = 50 + index * 275;
          drawImageFit(ctx, img, 100, y, 600, 250, fillMode ? 'cover' : 'contain');
        });
        break;
      
      case 'grid-2x2':
        loadedImages.slice(0, 4).forEach((img, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = 50 + col * 350;
          const y = 50 + row * 350;
          drawImageFit(ctx, img, x, y, 300, 300, fillMode ? 'cover' : 'contain');
        });
        break;

      case 'grid-3x3':
        loadedImages.slice(0, 9).forEach((img, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          const x = 50 + col * 233;
          const y = 50 + row * 233;
          drawImageFit(ctx, img, x, y, 200, 200, fillMode ? 'cover' : 'contain');
        });
        break;
    }

    ctx.filter = 'none';
  };

  const drawImageFit = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    mode: 'cover' | 'contain'
  ) => {
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = width / height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (mode === 'cover') {
      if (imgAspect > boxAspect) {
        drawHeight = height;
        drawWidth = height * imgAspect;
        drawX = x - (drawWidth - width) / 2;
        drawY = y;
      } else {
        drawWidth = width;
        drawHeight = width / imgAspect;
        drawX = x;
        drawY = y - (drawHeight - height) / 2;
      }
    } else {
      if (imgAspect > boxAspect) {
        drawWidth = width;
        drawHeight = width / imgAspect;
        drawX = x;
        drawY = y + (height - drawHeight) / 2;
      } else {
        drawHeight = height;
        drawWidth = height * imgAspect;
        drawX = x + (width - drawWidth) / 2;
        drawY = y;
      }
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  const drawFrameOverlay = async (ctx: CanvasRenderingContext2D, svgString: string) => {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  };

  const getFilterCSS = (filterId: string): string => {
    const filters: Record<string, string> = {
      'bw': 'grayscale(100%)',
      'warm': 'sepia(30%) saturate(120%) hue-rotate(15deg)',
      'cold': 'hue-rotate(180deg) saturate(120%)',
      'vintage': 'sepia(50%) contrast(120%) brightness(90%)',
      'cartoon': 'contrast(150%) saturate(150%) brightness(110%)',
      'blur': 'blur(1px) brightness(110%)',
      'dramatic': 'contrast(140%) saturate(80%) brightness(95%)',
      'retro': 'sepia(40%) hue-rotate(320deg) saturate(120%)',
      'neon': 'saturate(200%) contrast(120%) brightness(110%)'
    };
    return filters[filterId] || 'none';
  };

  const handleBack = () => {
    setCurrentStep(4);
    navigate('/capture');
  };

  const handleContinue = () => {
    setCurrentStep(6);
    navigate('/preview');
  };
  
  const handleImageProcessed = (image: HTMLCanvasElement) => {
    setProcessedImage(image);
    const finalImageData = image.toDataURL('image/jpeg', 0.95);
    setFinalImage(finalImageData);
  };

  const handleImageSelect = (imageUrl: string, slotIndex: number) => {
    const newSelection = [...selectedImages];
    newSelection[slotIndex] = imageUrl;
    setSelectedImages(newSelection);
  };

  const removeSelectedImage = (slotIndex: number) => {
    const newSelection = [...selectedImages];
    newSelection.splice(slotIndex, 1);
    setSelectedImages(newSelection);
  };0

  if (!selectedFrame || capturedImages.length === 0) {
    navigate('/capture');
    return null;
  }

  const requiredSlots = selectedFrame.panels;

  return (
    <Layout>
      <div className="step-container">
        {/* Header */}
        <div className="step-header flex items-center justify-between compact-spacing border-b bg-white/50 backdrop-blur-sm">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-dark hover:text-primary transition-colors"
            aria-label={t.back}
          >
            <ArrowLeft className="w-5 h-5" />
            {t.back}
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark">{t.filtersTitle}</h1>
            <p className="text-gray-600 compact-text">{t.filtersSubtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Fill mode toggle */}
            <button
              onClick={() => setFillMode(!fillMode)}
              className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-colors"
              title={fillMode ? 'Switch to Contain' : 'Fill Frame'}
            >
              {fillMode ? (
                <ToggleRight className="w-5 h-5 text-primary" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              <span className="compact-text font-medium">
                {language === 'vi' ? 'Lấp đầy' : 'Fill'}
              </span>
            </button>

            {/* Image selector toggle */}
            <button
              onClick={() => setShowImageSelector(!showImageSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-colors"
            >
              <span className="compact-text font-medium">
                {language === 'vi' ? 'Chọn ảnh' : 'Select Photos'}
              </span>
            </button>
          </div>
        </div>

        <div className="step-content section-grid sidebar compact-spacing">
          {/* Preview Area */}
          <div className="section-card bg-gray-50 flex flex-col">
            {/* Image Selector */}
            {showImageSelector && (
              <div className="mb-6 p-4 bg-white rounded-lg border-2 border-primary/20">
                <h3 className="font-semibold text-dark mb-4">
                  {language === 'vi' 
                    ? `Chọn ${requiredSlots} ảnh cho khung:`
                    : `Select ${requiredSlots} photos for frame:`
                  }
                </h3>
                
                {/* Selected Images Slots */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {Array.from({ length: requiredSlots }).map((_, slotIndex) => (
                    <div
                      key={slotIndex}
                      className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden"
                    >
                      {selectedImages[slotIndex] ? (
                        <>
                          <img
                            src={selectedImages[slotIndex]}
                            alt={`Selected ${slotIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeSelectedImage(slotIndex)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                            {slotIndex + 1}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {slotIndex + 1}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Available Images */}
                <div className="grid grid-cols-6 gap-2">
                  {capturedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const nextEmptySlot = selectedImages.findIndex(img => !img);
                        if (nextEmptySlot !== -1) {
                          handleImageSelect(image, nextEmptySlot);
                        }
                      }}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors relative"
                      disabled={selectedImages.includes(image)}
                    >
                      <img
                        src={image}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImages.includes(image) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Frame Preview */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg w-full"
              >
                <div className={`image-container aspect-[4/5] bg-white rounded-lg shadow-lg relative ${fillMode ? 'fill-mode' : ''}`}>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-lg"
                  />
                  <div className="safe-area-guide" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Filter Sidebar */}
          <div className="section-card">
            {/* Skin Smoothing Control */}
            <div className="mb-6">
              <SkinSmoothingControl
                image={selectedImages.length > 0 ? (() => {
                  const img = new Image();
                  img.src = selectedImages[0];
                  return img;
                })() : null}
                onImageProcessed={handleImageProcessed}
                language={language}
              />
            </div>
            
            <h3 className="text-base font-semibold text-dark mb-4">{t.filters}</h3>
            
            <FilterSelector
              selectedFilter={selectedFilter}
              onFilterSelect={setSelectedFilter}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <button
        onClick={handleBack}
        className="fixed-nav-button fixed-nav-back"
        aria-label={t.back}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="nav-button-text">{t.back}</span>
      </button>

      {selectedImages.length === requiredSlots && (
        <button
          onClick={handleContinue}
          className="fixed-nav-button fixed-nav-continue"
        >
          {t.continue}
        </button>
      )}
    </Layout>
  );
};