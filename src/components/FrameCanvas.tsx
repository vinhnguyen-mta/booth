import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

interface FrameCanvasProps {
  images: string[];
  frameConfig: {
    width: number;
    height: number;
    dpi: number;
    aspect: number;
  };
  mode?: 'cover' | 'contain';
  maxScale?: number;
  onRender?: (canvas: HTMLCanvasElement) => void;
}

// UPDATE: Enhanced frame canvas with viewport-fit and quality controls
export const FrameCanvas: React.FC<FrameCanvasProps> = ({
  images,
  frameConfig,
  mode = 'cover',
  maxScale = 1.2,
  onRender
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [sourceResolution, setSourceResolution] = useState({ width: 0, height: 0 });
  const [showQualityWarning, setShowQualityWarning] = useState(false);

  const { selectedFrame, selectedFilter } = useAppStore();

  // UPDATE: Calculate optimal canvas size for viewport
  const calculateCanvasSize = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 };
    
    const container = containerRef.current;
    const maxHeight = window.innerHeight * 0.92; // 92vh max
    const maxWidth = container.clientWidth * 0.9;
    
    const aspectRatio = frameConfig.aspect || (frameConfig.width / frameConfig.height);
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.floor(width), height: Math.floor(height) };
  }, [frameConfig]);

  // UPDATE: Enhanced render function with quality control
  const renderFrame = useCallback(async () => {
    if (!canvasRef.current || !selectedFrame || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = calculateCanvasSize();
    
    // Set highest DPI for maximum quality
    const dpr = Math.min(window.devicePixelRatio || 1, 3); // Tăng lên 3x cho chất lượng cao nhất
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Cài đặt chất lượng rendering cao nhất
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Load and draw images
    const imagePromises = images.map(src => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // UPDATE: Track source resolution for quality warnings
          if (sourceResolution.width === 0) {
            setSourceResolution({ width: img.naturalWidth, height: img.naturalHeight });
            
            // Check if upscaling beyond recommended limit
            const scaleX = width / img.naturalWidth;
            const scaleY = height / img.naturalHeight;
            const maxScaleUsed = Math.max(scaleX, scaleY);
            
            if (maxScaleUsed > maxScale) {
              setShowQualityWarning(true);
            }
          }
          resolve(img);
        };
        img.onerror = reject;
        img.src = src;
      });
    });

    try {
      const loadedImages = await Promise.all(imagePromises);
      
      // Apply filter
      if (selectedFilter !== 'original') {
        const filter = getFilterCSS(selectedFilter);
        ctx.filter = filter;
      }

      // Draw images based on layout with pan/zoom
      drawImagesWithLayout(ctx, loadedImages, selectedFrame.layout, width, height, scale, pan, mode);

      // Reset filter for frame overlay
      ctx.filter = 'none';
      
      // Draw frame overlay
      await drawFrameOverlay(ctx, selectedFrame.svg, width, height);

      if (onRender) {
        onRender(canvas);
      }
    } catch (error) {
      console.error('Error rendering frame:', error);
    }
  }, [images, selectedFrame, selectedFilter, scale, pan, mode, maxScale, calculateCanvasSize, sourceResolution]);

  // UPDATE: Pan and zoom handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(maxScale, prev * delta)));
  }, [maxScale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset pan/zoom
  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  return (
    <div 
      ref={containerRef}
      className="frame-viewport relative w-full flex items-center justify-center"
      style={{ maxHeight: '92vh', contain: 'layout' }}
    >
      {/* UPDATE: Quality warning */}
      {showQualityWarning && (
        <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-sm z-20">
          ⚠️ Chất lượng có thể giảm. Hãy chọn ảnh nguồn lớn hơn.
        </div>
      )}
      
      {/* UPDATE: Canvas with proper containment */}
      <canvas
        ref={canvasRef}
        className="frame-canvas border border-gray-200 shadow-lg rounded-lg cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* UPDATE: Controls positioned outside frame */}
      <div className="frame-controls absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-300 rounded-lg text-sm font-medium shadow-sm"
        >
          Reset View
        </button>
        <div className="px-3 py-1 bg-white/90 border border-gray-300 rounded-lg text-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

// UPDATE: Helper functions for image processing
function getFilterCSS(filterId: string): string {
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
}

function drawImagesWithLayout(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  layout: string,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  pan: { x: number; y: number },
  mode: 'cover' | 'contain'
) {
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(scale, scale);

  const padding = 20;
  
  switch (layout) {
    case 'single':
      if (images[0]) {
        drawImageFit(ctx, images[0], padding, padding, canvasWidth - padding * 2, canvasHeight - padding * 2, mode);
      }
      break;
    
    case 'strip-4':
      const stripHeight = (canvasHeight - padding * 5) / 4;
      images.slice(0, 4).forEach((img, index) => {
        const y = padding + index * (stripHeight + padding);
        drawImageFit(ctx, img, padding * 2, y, canvasWidth - padding * 4, stripHeight, mode);
      });
      break;
    
    case 'grid-2x2':
      const gridWidth = (canvasWidth - padding * 3) / 2;
      const gridHeight = (canvasHeight - padding * 3) / 2;
      images.slice(0, 4).forEach((img, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = padding + col * (gridWidth + padding);
        const y = padding + row * (gridHeight + padding);
        drawImageFit(ctx, img, x, y, gridWidth, gridHeight, mode);
      });
      break;
  }
  
  ctx.restore();
}

function drawImageFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  mode: 'cover' | 'contain'
) {
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
  } else { // contain
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
}

async function drawFrameOverlay(
  ctx: CanvasRenderingContext2D,
  svgString: string,
  width: number,
  height: number
) {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
}