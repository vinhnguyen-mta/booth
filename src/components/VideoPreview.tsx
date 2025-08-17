import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Download,
  Share,
  QrCode,
  Volume2,
  VolumeX,
} from "lucide-react";
import { qrGenerator } from "../utils/qrGenerator";

interface VideoPreviewProps {
  videoBlob: Blob;
  videoUrl: string;
  onDownload?: () => void;
  onShare?: () => void;
  language: "en" | "vi";
  className?: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoBlob,
  videoUrl,
  onDownload,
  onShare,
  language,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<{
    dataUrl: string;
    downloadUrl: string;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const generateQR = async () => {
    try {
      const result = await qrGenerator.generateVideoQR(
        videoBlob,
        "photobooth-video.webm",
      );
      setQrData({
        dataUrl: result.qr.dataUrl,
        downloadUrl: result.downloadUrl,
      });
      setShowQR(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `photobooth-video-${Date.now()}.webm`;
    link.click();
    onDownload?.();
  };

  const handleShare = async () => {
    if (
      navigator.share &&
      navigator.canShare?.({ files: [new File([videoBlob], "video.webm")] })
    ) {
      try {
        await navigator.share({
          files: [
            new File([videoBlob], "photobooth-video.webm", {
              type: videoBlob.type,
            }),
          ],
          title: "PhotoBooth Video",
          text: "Check out my PhotoBooth video!",
        });
      } catch (error) {
        console.error("Share failed:", error);
        // Fallback to QR code
        generateQR();
      }
    } else {
      // Fallback to QR code
      generateQR();
    }
    onShare?.();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Video container */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          playsInline
          muted={isMuted}
        />

        {/* Play/Pause overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
          onClick={togglePlay}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isPlaying ? 0 : 1 }}
            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <Play className="w-8 h-8 text-gray-800 ml-1" />
          </motion.div>
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #F34B52 0%, #F34B52 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`,
              }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={generateQR}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title={language === "vi" ? "Tạo QR code" : "Generate QR code"}
              >
                <QrCode className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={handleShare}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title={language === "vi" ? "Chia sẻ" : "Share"}
              >
                <Share className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={handleDownload}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title={language === "vi" ? "Tải xuống" : "Download"}
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && qrData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-center mb-4">
              {language === "vi"
                ? "Quét để tải video"
                : "Scan to Download Video"}
            </h3>

            <div className="flex justify-center mb-4">
              <img src={qrData.dataUrl} alt="QR Code" className="w-48 h-48" />
            </div>

            <p className="text-sm text-gray-600 text-center mb-4">
              {language === "vi"
                ? "Sử dụng camera điện thoại để quét mã QR"
                : "Use your phone camera to scan the QR code"}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(qrData.downloadUrl);
                  alert(
                    language === "vi" ? "Đã sao chép link!" : "Link copied!",
                  );
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
              >
                {language === "vi" ? "Sao chép link" : "Copy Link"}
              </button>

              <button
                onClick={() => setShowQR(false)}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors"
              >
                {language === "vi" ? "Đóng" : "Close"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
