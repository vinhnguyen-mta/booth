import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import { FrameSelector } from '../components/FrameSelector';
import { Frame } from '../services/api';
import { translations } from '../i18n/translations';

export const ChooseFrame: React.FC = () => {
  const navigate = useNavigate();
  const { language, selectedFrame, setSelectedFrame, setCurrentStep } = useAppStore();
  const t = translations[language];

  const handleBack = () => {
    setCurrentStep(0);
    navigate('/');
  };

  const handleContinue = () => {
    if (selectedFrame) {
      setCurrentStep(2);
      navigate('/choose-quantity');
    }
  };

  const handleFrameSelect = (frame: Frame) => {
    setSelectedFrame(frame);
  };

  return (
    <Layout>
      <div className="step-container">
        {/* Header */}
        {/*<div className="step-header flex items-center justify-between compact-spacing border-b bg-white/50 backdrop-blur-sm p-2">*/}
        {/*  <button*/}
        {/*      onClick={handleBack}*/}
        {/*      className="flex items-center gap-2 text-dark hover:text-primary transition-colors text-sm"*/}
        {/*      aria-label={t.back}*/}
        {/*  >*/}
        {/*    <ArrowLeft className="w-4 h-4" />*/}
        {/*    {t.back}*/}
        {/*  </button>*/}

        {/*  <div className="text-center">*/}
        {/*    <h1 className="text-lg font-bold text-dark">{t.chooseFrameTitle}</h1>*/}
        {/*    <p className="text-gray-600 compact-text text-sm">{t.chooseFrameSubtitle}</p>*/}
        {/*  </div>*/}

        {/*  <div className="w-12" /> /!* Spacer (nhỏ lại) *!/*/}
        {/*</div>*/}


        {/* UPDATE: Content with section-based layout */}
        <div className="step-content compact-spacing">
          <div className="section-card">
            <FrameSelector
              selectedFrame={selectedFrame}
              onFrameSelect={handleFrameSelect}
              language={language}
            />
          </div>
        </div>

        {/* Continue Button */}
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

      {selectedFrame && (
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