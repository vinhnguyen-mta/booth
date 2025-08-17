// UPDATE: New reusable FrameSelector component
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Frame, getFrames, formatPrice } from "../services/api";
import styles from "./FrameSelector.module.css";

interface FrameSelectorProps {
  selectedFrame: Frame | null;
  onFrameSelect: (frame: Frame) => void;
  onBack?: () => void;
  onContinue?: () => void;
  language: "en" | "vi";
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedFrame,
  onFrameSelect,
  onBack,
  onContinue,
  language,
}) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadFrames();
  }, []);

  const loadFrames = async () => {
    try {
      const framesData = await getFrames();
      setFrames(framesData);
    } catch (error) {
      console.error("Error loading frames:", error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.5, 200);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* <button
        className={`${styles.navButton} ${styles.left}`}
        aria-label="Previous"
        onClick={() => {
          if (onBack) onBack();
          else scroll('left');
        }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button> */}

      <div className={styles.container} ref={containerRef}>
        {frames.slice(0, 8).map((frame, index) => {
          const isSelected = selectedFrame?.id === frame.id;
          return (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`${styles.item} ${isSelected ? styles.selected : ""}`}
              onClick={() => onFrameSelect(frame)}
            >
              <div className={styles.titleBadge}>
                <span>{language === "vi" ? frame.name_vi : frame.name}</span>
              </div>

              <div className={styles.previewWrap}>
                <div
                  className={styles.frameStroke}
                  dangerouslySetInnerHTML={{ __html: frame.svg }}
                />
              </div>

              <div className={styles.footer}>
                <div className={styles.panels}>
                  {frame.panels} {language === "vi" ? "ảnh" : "cut"}
                </div>
                <div className={styles.price}>{formatPrice(frame.price)}₫</div>
              </div>

              {isSelected && (
                <>
                  <div className={styles.checkBadge} aria-hidden>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Right arrow: chỉ render khi có selection */}
      {selectedFrame ? (
        <button
          className={`${styles.navButton} ${styles.right}`}
          aria-label="Next"
          onClick={() => {
            if (selectedFrame && onContinue) onContinue();
            else scroll("right");
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      ) : null}
    </div>
  );
};
