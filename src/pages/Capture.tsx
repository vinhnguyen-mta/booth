import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import { CameraCapture } from '../components/CameraCapture';
import { getAppConfig } from '../services/api';
import { translations } from '../i18n/translations';

export const Capture: React.FC = () => {
  const navigate = useNavigate();
  
  const { 
    language, 
    selectedFrame, 
    capturedImages,
    capturedVideos,
    addCapturedImage,
    addCapturedVideo,
    clearCapturedImages,
    clearCapturedVideos,
    setCurrentStep 
  } = useAppStore();
  const t = translations[language];

  const [requiredPhotos, setRequiredPhotos] = useState(8);
  const [loading, setLoading] = useState(true);

  // Load config from API
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await getAppConfig();
      setRequiredPhotos(config.defaultPhotoCount);
    } catch (error) {
      console.error('Error loading config:', error);
      setRequiredPhotos(8); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    clearCapturedImages();
    clearCapturedVideos();
    setCurrentStep(3);
    navigate('/payment');
  };

  const handleContinue = () => {
    setCurrentStep(5);
    navigate('/filters');
  };

  const handlePhotoCapture = (imageUrl: string) => {
    addCapturedImage(imageUrl);
  };

  const handleVideoCapture = (videoUrl: string) => {
    addCapturedVideo(videoUrl);
  };

  if (!selectedFrame) {
    navigate('/choose-frame');
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{language === 'vi' ? 'Đang tải cấu hình...' : 'Loading configuration...'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {/*<div className="flex items-center justify-between p-6 border-b bg-white/50 backdrop-blur-sm">*/}
        {/*  <button*/}
        {/*    onClick={handleBack}*/}
        {/*    className="flex items-center gap-2 text-dark hover:text-primary transition-colors"*/}
        {/*    aria-label={t.back}*/}
        {/*  >*/}
        {/*    <ArrowLeft className="w-5 h-5" />*/}
        {/*    {t.back}*/}
        {/*  </button>*/}
        {/*  */}
        {/*  <div className="text-center">*/}
        {/*    <h1 className="text-2xl font-bold text-dark">{t.cameraTitle}</h1>*/}
        {/*    <p className="text-gray-600">{t.cameraSubtitle}</p>*/}
        {/*    <p className="text-sm text-primary font-medium mt-1">*/}
        {/*      {language === 'vi' */}
        {/*        ? `Chụp ${requiredPhotos} ảnh`*/}
        {/*        : `Take ${requiredPhotos} photos`*/}
        {/*      }*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*  */}
        {/*  <div className="text-right">*/}
        {/*    <span className="text-primary font-bold">*/}
        {/*      {capturedImages.length}/{requiredPhotos}*/}
        {/*    </span>*/}
        {/*    <div className="text-sm text-gray-600">{t.photosTaken}</div>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Camera/Upload Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/5 pb-20">
            <CameraCapture
                onPhotoCapture={handlePhotoCapture}
                onVideoCapture={handleVideoCapture}
                requiredPhotos={requiredPhotos}
                capturedCount={capturedImages.length}
                language={language}
            />
          </div>

          {/* Captured Photos Sidebar */}
          {capturedImages.length > 0 && (
              <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="w-full lg:w-96 xl:w-[400px] bg-white border-l p-6 overflow-y-auto mx-auto flex flex-col justify-between"
              >
                <h3 className="text-xl font-bold text-dark mb-6">
                  {language === 'vi' ? 'Ảnh đã chụp' : 'Captured Photos'}
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                  {capturedImages.map((image, index) => (
                      <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square shadow-lg border-2 border-gray-200"
                      >
                        <img
                            src={image}
                            alt={`Captured photo ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                      </motion.div>
                  ))}
                </div>
              </motion.div>
          )}
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

      {capturedImages.length === requiredPhotos && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handleContinue}
          className="fixed-nav-button fixed-nav-continue"
        >
          {t.continue}
        </motion.button>
      )}
    </Layout>
  );
};