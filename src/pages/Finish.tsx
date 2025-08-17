import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Share, QrCode, RotateCcw, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import { translations } from "../i18n/translations";
import QRCode from "qrcode";

export const Finish: React.FC = () => {
  const navigate = useNavigate();
  const { language, finalImage, resetSession } = useAppStore();
  const t = translations[language];

  const [shareQR, setShareQR] = React.useState<string>("");

  useEffect(() => {
    generateShareQR();
  }, []);

  const generateShareQR = async () => {
    try {
      // Mock share URL - in real app, this would be actual cloud storage URL
      const shareUrl = `https://photobooth.example.com/share/${Date.now()}`;
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#F34B52",
          light: "#FFFFFF",
        },
      });
      setShareQR(qrDataUrl);
    } catch (error) {
      console.error("Error generating share QR:", error);
    }
  };

  const handleDownload = () => {
    if (!finalImage) return;

    // Tạo canvas chất lượng cao để xuất
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Sử dụng độ phân giải cao nhất
      const scale = Math.min(window.devicePixelRatio || 1, 3); // Tối đa 3x
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      // Cài đặt chất lượng cao nhất
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.scale(scale, scale);

      // Vẽ ảnh với chất lượng cao
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

      // Xuất với chất lượng cao nhất (PNG không nén)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `photobooth-${new Date().toISOString().slice(0, 10)}-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png"); // PNG không nén cho chất lượng cao nhất
    };
  };

  const handleShare = async () => {
    if (!finalImage) return;

    if (navigator.share) {
      try {
        const response = await fetch(finalImage);
        const blob = await response.blob();
        const file = new File([blob], "photobooth.jpg", { type: "image/jpeg" });

        await navigator.share({
          files: [file],
          title: "My PhotoBooth Picture",
          text: "Check out my awesome PhotoBooth picture!",
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // Fallback to copy URL
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert(
          language === "vi"
            ? "Link đã được sao chép!"
            : "Link copied to clipboard!",
        );
      }
    }
  };

  const handleNewSession = () => {
    resetSession();
    navigate("/");
  };

  const handlePrint = () => {
    if (!finalImage) return;

    // Tạo canvas chất lượng cao cho in
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Độ phân giải 300 DPI cho in (tương đương)
      const printScale = 4; // 4x cho chất lượng in cao
      canvas.width = img.naturalWidth * printScale;
      canvas.height = img.naturalHeight * printScale;

      // Cài đặt chất lượng cao nhất cho in
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.scale(printScale, printScale);

      // Vẽ ảnh chất lượng cao
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

      // Tạo data URL chất lượng cao cho in
      const highQualityDataUrl = canvas.toDataURL("image/png", 1.0);

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>PhotoBooth Print - High Quality</title>
              <style>
                @page { 
                  size: A4; 
                  margin: 0.5in; 
                }
                body { 
                  margin: 0; 
                  padding: 0; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh;
                  background: white;
                }
                img { 
                  max-width: 100%; 
                  max-height: 100vh; 
                  object-fit: contain;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
                  image-rendering: -webkit-optimize-contrast;
                  image-rendering: crisp-edges;
                }
                @media print {
                  body { padding: 0; }
                  img { 
                    width: 100%; 
                    height: auto; 
                    box-shadow: none;
                    image-rendering: auto;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${highQualityDataUrl}" alt="PhotoBooth High Quality Print" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    };
  };

  if (!finalImage) {
    navigate("/");
    return null;
  }

  return (
    <Layout showLanguageToggle={false}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-white"
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </svg>
              </motion.div>

              {/* Sparkle effects */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    delay: 0.8 + i * 0.1,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                  style={{
                    top: `${20 + Math.cos((i * 60 * Math.PI) / 180) * 60}px`,
                    left: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 60}px`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-dark mb-4"
          >
            {t.finalTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 mb-12"
          >
            {t.finalSubtitle}
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Final Image Display */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-4"
            >
              <img
                src={finalImage}
                alt="Final photobooth result"
                className="w-full h-auto rounded-lg"
              />
            </motion.div>

            {/* Actions Panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-6"
            >
              {/* Primary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  {t.downloadPhotos}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Share className="w-5 h-5" />
                  {t.sharePhotos}
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Printer className="w-5 h-5" />
                {t.printPhotos}
              </button>

              {/* QR Code for Digital Access */}
              {shareQR && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <QrCode className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold text-dark">
                      {language === "vi"
                        ? "Truy cập kỹ thuật số"
                        : "Digital Access"}
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={shareQR}
                      alt="Share QR Code"
                      className="w-24 h-24"
                    />
                    <div className="text-center sm:text-left">
                      <p className="text-gray-600 text-sm mb-2">
                        {language === "vi"
                          ? "Quét mã QR để tải ảnh về điện thoại"
                          : "Scan QR code to download to your phone"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === "vi"
                          ? "Ảnh có thể truy cập trong 7 ngày"
                          : "Photos available for 7 days"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* New Session Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="pt-6 border-t"
              >
                <button
                  onClick={handleNewSession}
                  className="w-full flex items-center justify-center gap-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-4 px-6 rounded-2xl transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t.newSession}
                </button>
              </motion.div>

              {/* Thank You Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-center p-4 bg-primary/5 rounded-lg"
              >
                <p className="text-primary font-medium">
                  {language === "vi"
                    ? "🎉 Cảm ơn bạn đã sử dụng PhotoBooth! 🎉"
                    : "🎉 Thank you for using PhotoBooth! 🎉"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {language === "vi"
                    ? "Hãy chia sẻ những khoảnh khắc đẹp!"
                    : "Share your beautiful moments!"}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};
