import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { skinSmoothingProcessor } from "../utils/skinSmoothing";

interface SkinSmoothingControlProps {
  image: HTMLImageElement | HTMLCanvasElement | null;
  onImageProcessed: (processedImage: HTMLCanvasElement) => void;
  language: "en" | "vi";
}

export const SkinSmoothingControl: React.FC<SkinSmoothingControlProps> = ({
  image,
  onImageProcessed,
  language,
}) => {
  const [smoothingAmount, setSmoothingAmount] = useState(40);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<
    HTMLImageElement | HTMLCanvasElement | null
  >(null);

  // Store original image on first load
  React.useEffect(() => {
    if (image && !originalImage) {
      setOriginalImage(image);
    }
  }, [image, originalImage]);

  const applySmoothing = useCallback(
    async (amount: number) => {
      if (!originalImage) return;

      setIsProcessing(true);
      try {
        const processedImage = await skinSmoothingProcessor.applySkinSmoothing(
          originalImage,
          {
            amount,
            preserveDetails: true,
            faceDetection: true,
          },
        );

        onImageProcessed(processedImage);
      } catch (error) {
        console.error("Skin smoothing failed:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [originalImage, onImageProcessed],
  );

  const handleSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const amount = parseInt(event.target.value);
      setSmoothingAmount(amount);
      applySmoothing(amount);
    },
    [applySmoothing],
  );

  const resetToOriginal = useCallback(() => {
    if (originalImage) {
      setSmoothingAmount(0);

      // Convert to canvas if needed
      if (originalImage instanceof HTMLImageElement) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        onImageProcessed(canvas);
      } else {
        onImageProcessed(originalImage);
      }
    }
  }, [originalImage, onImageProcessed]);

  const presetLevels = [
    { label: language === "vi" ? "Nhẹ" : "Light", value: 25 },
    { label: language === "vi" ? "Vừa" : "Medium", value: 45 },
    { label: language === "vi" ? "Mạnh" : "Strong", value: 70 },
  ];

  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-dark">
          {language === "vi" ? "Làm mịn da" : "Skin Smoothing"}
        </h3>
        {isProcessing && (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />
        )}
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {presetLevels.map((preset) => (
          <button
            key={preset.value}
            onClick={() => {
              setSmoothingAmount(preset.value);
              applySmoothing(preset.value);
            }}
            disabled={isProcessing}
            className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
              smoothingAmount === preset.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 hover:border-primary/30 text-gray-700"
            } disabled:opacity-50`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Slider control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            {language === "vi" ? "Mức độ" : "Amount"}
          </label>
          <span className="text-sm text-primary font-medium">
            {smoothingAmount}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={smoothingAmount}
          onChange={handleSliderChange}
          disabled={isProcessing}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #F34B52 0%, #F34B52 ${smoothingAmount}%, #e5e7eb ${smoothingAmount}%, #e5e7eb 100%)`,
          }}
        />
      </div>

      {/* Reset button */}
      <button
        onClick={resetToOriginal}
        disabled={isProcessing || smoothingAmount === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition-colors text-sm"
      >
        <RotateCcw className="w-4 h-4" />
        {language === "vi" ? "Khôi phục gốc" : "Reset to Original"}
      </button>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f34b52;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f34b52;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  );
};
