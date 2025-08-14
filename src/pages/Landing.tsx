import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import { translations } from '../i18n/translations';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { language, setCurrentStep } = useAppStore();
  const t = translations[language];

  const handleStart = () => {
    setCurrentStep(1);
    navigate('/choose-frame');
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ y: -30 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-xl mb-6">
              <Camera className="w-16 h-16 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-dark mb-4 font-display">
              {t.welcomeTitle}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              {t.welcomeSubtitle}
            </p>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold text-xl px-12 py-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30"
              aria-label={t.startButton}
            >
              <Camera className="w-6 h-6" />
              {t.startButton}
            </button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-dark mb-2">
                {language === 'vi' ? 'Chụp ảnh chuyên nghiệp' : 'Professional Photos'}
              </h3>
              <p className="text-gray-600">
                {language === 'vi' ? 'Chất lượng cao với nhiều khung ảnh đẹp' : 'High quality with beautiful frames'}
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-dark mb-2">
                {language === 'vi' ? 'Hiệu ứng đa dạng' : 'Amazing Effects'}
              </h3>
              <p className="text-gray-600">
                {language === 'vi' ? 'Bộ lọc và hiệu ứng phong phú' : 'Rich filters and effects'}
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-accent rounded-full" />
              </div>
              <h3 className="font-semibold text-dark mb-2">
                {language === 'vi' ? 'Thanh toán dễ dàng' : 'Easy Payment'}
              </h3>
              <p className="text-gray-600">
                {language === 'vi' ? 'Nhiều hình thức thanh toán' : 'Multiple payment options'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};