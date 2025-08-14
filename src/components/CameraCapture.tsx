// UPDATE: Enhanced CameraCapture component with video recording
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, RotateCcw, Upload, Check, Video } from 'lucide-react';
import { uploadPhoto, uploadVideo } from '../services/api';

interface CameraCaptureProps {
  onPhotoCapture: (imageUrl: string) => void;
  onVideoCapture: (videoUrl: string) => void;
  requiredPhotos: number;
  capturedCount: number;
  language: 'en' | 'vi';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCapture,
  onVideoCapture,
  requiredPhotos,
  capturedCount,
  language
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('user');
  const [hasCamera, setHasCamera] = useState(true);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [currentCamera]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: currentCamera,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // UPDATE: Don't mirror the video to prevent flipped capture
        videoRef.current.style.transform = 'none';
      }
      setStream(mediaStream);
      setHasCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setCurrentCamera(currentCamera === 'user' ? 'environment' : 'user');
  };

  const startCountdown = () => {
    if (isCapturing || capturedCount >= requiredPhotos) return;
    
    setIsCapturing(true);
    setCountdown(3);
    
    // UPDATE: Start video recording before countdown
    startVideoRecording();
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          capturePhotoAndVideo();
          setIsCapturing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // UPDATE: Start video recording
  const startVideoRecording = () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        saveVideo(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // UPDATE: Stop recording after 6 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 6000);
      
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  };

  const capturePhotoAndVideo = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // UPDATE: Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // UPDATE: Draw without flipping to prevent mirror effect
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    onPhotoCapture(imageData);
  };

  const saveVideo = async (blob: Blob) => {
    try {
      const videoUrl = URL.createObjectURL(blob);
      onVideoCapture(videoUrl);
      
      // TODO: Upload video to server
      // const uploadResult = await uploadVideo(blob, `video-${Date.now()}.webm`);
      // onVideoCapture(uploadResult.url);
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Chỉ cho phép upload đúng số lượng ảnh còn thiếu
    const remainingPhotos = requiredPhotos - capturedCount;
    const filesToProcess = Array.from(files).slice(0, remainingPhotos);
    
    filesToProcess.forEach(async (file) => {
      if (capturedCount >= requiredPhotos) return;
      
      try {
        const uploadResult = await uploadPhoto(file);
        onPhotoCapture(uploadResult.url);
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-black/5">
      {/* Progress indicator */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {[...Array(requiredPhotos)].map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index < capturedCount ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">
          {language === 'vi' 
            ? `${capturedCount}/${requiredPhotos} ảnh đã chụp`
            : `${capturedCount}/${requiredPhotos} photos taken`
          }
        </p>
      </div>

      {hasCamera ? (
        <div className="relative max-w-2xl w-full">
          {/* Video Preview */}
          <motion.div
            className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto max-h-96 object-cover"
              style={{ transform: 'none' }} // UPDATE: No mirror effect
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
            
            {/* Countdown Overlay */}
            {countdown > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-white text-9xl font-bold drop-shadow-2xl"
                >
                  {countdown}
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Camera Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={switchCamera}
              className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition-colors"
              aria-label="Switch Camera"
            >
              <RotateCcw className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={startCountdown}
              disabled={isCapturing || capturedCount >= requiredPhotos}
              className="w-20 h-20 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-xl transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30"
              aria-label="Capture Photo & Video"
            >
              {isRecording ? <Video className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition-colors"
              aria-label="Upload Photo"
            >
              <Upload className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      ) : (
        /* File Upload Fallback */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark mb-4">
              {language === 'vi' ? 'Camera không khả dụng' : 'Camera not available'}
            </h3>
            {/*<p className="text-gray-600 mb-6">*/}
            {/*  {language === 'vi' ? 'Tải ảnh từ thiết bị' : 'Upload photos from device'}*/}
            {/*</p>*/}
            {/*<button*/}
            {/*  onClick={() => fileInputRef.current?.click()}*/}
            {/*  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full transition-colors"*/}
            {/*>*/}
            {/*  {language === 'vi' ? 'Chọn ảnh từ thiết bị' : 'Choose Photos from Device'}*/}
            {/*</button>*/}
          </div>
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};