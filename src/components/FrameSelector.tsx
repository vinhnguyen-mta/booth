// UPDATE: New reusable FrameSelector component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Frame, getFrames, formatPrice } from '../services/api';

interface FrameSelectorProps {
  selectedFrame: Frame | null;
  onFrameSelect: (frame: Frame) => void;
  language: 'en' | 'vi';
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedFrame,
  onFrameSelect,
  language
}) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFrames();
  }, []);

  const loadFrames = async () => {
    try {
      const framesData = await getFrames();
      setFrames(framesData);
    } catch (error) {
      console.error('Error loading frames:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {frames.slice(0, 8).map((frame, index) => (
            <motion.div
                key={frame.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-3 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                    selectedFrame?.id === frame.id
                        ? 'border-primary shadow-xl scale-102 ring-2 ring-primary/20'
                        : 'border-transparent hover:border-primary/30 hover:scale-102'
                }`}
                onClick={() => onFrameSelect(frame)}
            >
              {/* Frame Preview */}
              <div className="aspect-[4/5] p-3 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #F34B52 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                <div
                    className="w-full h-full max-w-20 max-h-56 relative z-10 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: frame.svg }}
                />
              </div>

              {/* Frame Info */}
              <div className="p-3 bg-white border-t border-gray-100">
                <h3 className="text-sm font-bold text-dark mb-1">
                  {language === 'vi' ? frame.name_vi : frame.name}
                </h3>
                <p className="text-gray-600 text-xs mb-2">
                  {frame.panels} {language === 'vi' ? 'ảnh' : 'photos'}
                </p>
                <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(frame.price)}₫
          </span>
                  {selectedFrame?.id === frame.id && (
                      <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
        ))}
      </div>
  );
};