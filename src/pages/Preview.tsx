import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import { VideoPreview } from "../components/VideoPreview";
import { videoGenerator } from "../utils/videoGenerator";
import { translations } from "../i18n/translations";

export const Preview: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    finalImage,
    capturedImages,
    capturedVideos,
    totalPrice,
    setCurrentStep,
  } = useAppStore();
  const t = translations[language];

  const [generatedVideo, setGeneratedVideo] = React.useState<{
    blob: Blob;
    url: string;
  } | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = React.useState(false);

  const handleBack = () => {
    setCurrentStep(5);
    navigate("/filters");
  };

  const handleContinue = () => {
    setCurrentStep(8);
    navigate("/finish");
  };

  // Generate video from images
  const generateVideo = async () => {
    if (capturedImages.length === 0) return;

    setIsGeneratingVideo(true);
    try {
      // Convert image URLs to Image elements
      const images = await Promise.all(
        capturedImages.map((src) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
          });
        })
      );

      const videoBlob = await videoGenerator.createSlideshow(images, {
        duration: 6,
        width: 1920,
        height: 1080,
        format: "webm",
        quality: 0.9,
      });

      const videoUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideo({ blob: videoBlob, url: videoUrl });
    } catch (error) {
      console.error("Video generation failed:", error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Auto-generate video on mount
  React.useEffect(() => {
    if (capturedImages.length > 0 && !generatedVideo && !isGeneratingVideo) {
      generateVideo();
    }
  }, [capturedImages, generatedVideo, isGeneratingVideo]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  React.useEffect(() => {
    if (capturedImages.length > 0 && !generatedVideo && !isGeneratingVideo) {
      generateVideo();
    }
  }, [capturedImages, generatedVideo, isGeneratingVideo]);

  React.useEffect(() => {
    if (!finalImage) {
      navigate("/list-image");
    }
  }, [finalImage, navigate]);

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
            <h1 className="text-2xl font-bold text-dark">{t.previewTitle}</h1>
            <p className="text-gray-600 compact-text">{t.previewSubtitle}</p>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              {formatPrice(totalPrice)}
              {t.currency}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="step-content flex items-center justify-center compact-spacing bg-gray-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl w-full text-center"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Photo Preview */}
              <div className="bg-white rounded-2xl shadow-xl compact-spacing border border-gray-200">
                <h3 className="text-lg font-semibold text-dark mb-4">
                  {language === "vi" ? "Ảnh cuối cùng" : "Final Photo"}
                </h3>
                <div className="image-container aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={finalImage}
                    alt="Final photo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Video Preview */}
              <div className="bg-white rounded-2xl shadow-xl compact-spacing border border-gray-200">
                <h3 className="text-lg font-semibold text-dark mb-4">
                  {language === "vi" ? "Video ngắn" : "Short Video"}
                </h3>

                {isGeneratingVideo ? (
                  <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">
                        {language === "vi"
                          ? "Đang tạo video..."
                          : "Generating video..."}
                      </p>
                    </div>
                  </div>
                ) : generatedVideo ? (
                  <VideoPreview
                    videoBlob={generatedVideo.blob}
                    videoUrl={generatedVideo.url}
                    language={language}
                    className="aspect-video"
                  />
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                    <button
                      onClick={generateVideo}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                    >
                      {language === "vi" ? "Tạo video" : "Generate Video"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Original captured videos if any */}
            {capturedVideos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl compact-spacing border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-dark mb-4">
                  {language === "vi"
                    ? "Video gốc đã quay"
                    : "Original Recorded Videos"}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {capturedVideos.slice(0, 4).map((video, index) => (
                    <div
                      key={index}
                      className="relative bg-black rounded-lg overflow-hidden aspect-video"
                    >
                      <video
                        src={video}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.download = `photobooth-${Date.now()}.jpg`;
                  link.href = finalImage;
                  link.click();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                {language === "vi" ? "Xem trước" : "Preview Download"}
              </button>

              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      // Convert data URL to blob for sharing
                      const response = await fetch(finalImage);
                      const blob = await response.blob();
                      const file = new File([blob], "photobooth.jpg", {
                        type: "image/jpeg",
                      });

                      await navigator.share({
                        files: [file],
                        title: "My PhotoBooth Picture",
                      });
                    } catch (error) {
                      console.error("Error sharing:", error);
                    }
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors font-medium"
              >
                <Share className="w-4 h-4" />
                {language === "vi" ? "Chia sẻ" : "Share"}
              </button>
            </div>

            {/* Satisfaction Check */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl compact-spacing border border-gray-200"
            >
              <h3 className="text-xl font-bold text-dark mb-3">
                {language === "vi"
                  ? "Hài lòng với kết quả?"
                  : "Happy with the result?"}
              </h3>
              <p className="text-gray-600 mb-4 compact-text">
                {language === "vi"
                  ? "Bạn có thể quay lại để chỉnh sửa hoặc tiếp tục thanh toán để nhận ảnh."
                  : "You can go back to make changes or proceed to payment to get your photos."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  {language === "vi" ? "Chỉnh sửa thêm" : "Make Changes"}
                </button>

                <button
                  onClick={handleContinue}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
                >
                  {language === "vi"
                    ? "Tiếp tục thanh toán"
                    : "Proceed to Payment"}
                </button>
              </div>
            </motion.div>
          </motion.div>
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

      <button
        onClick={handleContinue}
        className="fixed-nav-button fixed-nav-continue"
      >
        {t.continue}
      </button>
    </Layout>
  );
};
