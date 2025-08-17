import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import styles from './Css.module.css';

export const Filters: React.FC = () => {
  const navigate = useNavigate();
  const { language, selectedFrame, capturedImages = [], setCurrentStep, addCapturedImage, clearCapturedImages } = useAppStore();

  // redirect back to capture if no frame or no images
  useEffect(() => {
    if (!selectedFrame || !capturedImages || capturedImages.length === 0) {
      setCurrentStep(4);
      navigate('/capture');
    }
  }, [selectedFrame, capturedImages, navigate, setCurrentStep]);

  // layout / panels
  const panels = selectedFrame?.panels ?? 9;
  const layout = selectedFrame?.layout ?? 'grid-3x3';

  let cols = 3;
  if (layout === 'single') cols = 1;
  if (layout === 'strip-4') cols = 1;
  if (layout === 'grid-2x2') cols = 2;
  if (layout === 'grid-3x3') cols = 3;

  // Left: slots equal to panels (initially empty)
  const [assigned, setAssigned] = useState<Array<string | null>>(() => Array.from({ length: panels }, () => null));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Right: thumbnails from captured images (show up to 8)
  const THUMB_COUNT = 8;
  const thumbnails = capturedImages.slice(0, THUMB_COUNT);

  // reset assigned slots when frame or captured images change (start empty)
  useEffect(() => {
    setAssigned(Array.from({ length: panels }, () => null));
    setSelectedSlot(null);
  }, [panels, selectedFrame, capturedImages]);

  const handleSlotClick = (idx: number) => {
    // toggle selection
    setSelectedSlot((s) => (s === idx ? null : idx));
  };

  const handleThumbnailClick = (url: string) => {
    if (!url) return;
    // prevent duplicate use
    if (assigned.includes(url)) return;

    if (selectedSlot !== null) {
      setAssigned((prev) => {
        const next = [...prev];
        next[selectedSlot] = url;
        return next;
      });
      setSelectedSlot(null);
      return;
    }

    const emptyIndex = assigned.findIndex((v) => v === null);
    if (emptyIndex !== -1) {
      setAssigned((prev) => {
        const next = [...prev];
        next[emptyIndex] = url;
        return next;
      });
    }
  };

  const handleClearSlot = (idx: number) => {
    setAssigned((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setSelectedSlot(null);
  };

  const handleBack = () => {
    setCurrentStep(4);
    navigate('/capture');
  };

  const handleContinue = () => {
    setCurrentStep(6);

    clearCapturedImages()
    const selectedImages = assigned.filter((url): url is string => !!url);
    for (const image of selectedImages) {
      addCapturedImage(image);
    }

    navigate('/filter-image', { state: { assigned } });
  };

  // Check if an image is already used in the frame
  const isImageUsed = (url: string) => assigned.includes(url);

  // --- New: Left grid as 3x3 large preview (8 imgs + count tile) ---
  const LEFT_COLS = 3;
  const LEFT_ROWS = 3;
  const TILE_W = 160;
  const TILE_H = 120;
  const leftSlots = Array.from({ length: LEFT_COLS * LEFT_ROWS }); // 9 slots (8 thumbnails + last count)

  return (
    <Layout>
      <div className="flex items-center justify-center bg-white p-8 gap-12" style={{ position: 'relative' }}>
        {/* Left - larger 3x3 grid of thumbnails (last cell = count tile) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${LEFT_COLS}, ${TILE_W}px)`,
            gap: 8,
            padding: 8,
            maxWidth: LEFT_COLS * TILE_W + (LEFT_COLS - 1) * 8
          }}
        >
          {leftSlots.map((_, idx) => {
            // last cell reserved for count/tile
            if (idx === LEFT_COLS * LEFT_ROWS - 1) {
              return (
                <div
                  key={idx}
                  style={{
                    width: TILE_W,
                    height: TILE_H,
                    background: '#111827',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  <div style={{ fontSize: 12 }}>{language === 'vi' ? 'Vui lòng chọn ảnh' : 'Please select photos'}</div>
                  <div style={{ fontSize: 28, marginTop: 6 }}>
                    {assigned.filter(Boolean).length}/{panels}
                  </div>
                </div>
              );
            }

            const url = thumbnails[idx] ?? null;
            const isUsed = url ? isImageUsed(url) : false;

            return (
              <div
                key={idx}
                onClick={() => url && !isUsed && handleThumbnailClick(url)}
                style={{
                  width: TILE_W,
                  height: TILE_H,
                  border: '1px solid #e5e7eb',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundImage: url ? `url(${url})` : undefined,
                  backgroundColor: url ? undefined : '#f3f4f6',
                  cursor: url && !isUsed ? 'pointer' : 'default',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!url && <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{language === 'vi' ? 'Trống' : 'Empty'}</span>}

                {isUsed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(220, 38, 38, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 700
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right - dynamic frame with empty slots (panels) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 208px)`,
            gap: 8,
            padding: 8,
            maxWidth: cols * 208 + (cols - 1) * 8
          }}
        >
          {Array.from({ length: panels }).map((_, idx) => {
            const url = assigned[idx];
            const isSel = selectedSlot === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSlotClick(idx)}
                style={{
                  width: 208,
                  height: 144,
                  border: isSel ? '3px solid #0ea45e' : '1px dashed #d1d5db',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundImage: url ? `url(${url})` : undefined,
                  backgroundColor: url ? undefined : '#f8fafc',
                  position: 'relative'
                }}
              >
                {!url && <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{language === 'vi' ? 'Trống' : 'Empty'}</span>}
                {url && isSel && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClearSlot(idx); }}
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: 6,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 6px',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                    aria-label="Clear slot"
                  >
                    X
                  </button>
                )}
              </div>
            );
          })}

          {/* Continue button area */}
          <div style={{ width: 208, height: 144, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={handleContinue} className={styles.navButtonRight} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Filters;