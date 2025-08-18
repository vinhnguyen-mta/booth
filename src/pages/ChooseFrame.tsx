import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import { FrameSelector } from "../components/FrameSelector";
import { Frame } from "../services/api";
import { translations } from "../i18n/translations";

export const ChooseFrame: React.FC = () => {
  const navigate = useNavigate();
  const { language, selectedFrame, setSelectedFrame, setCurrentStep } =
    useAppStore();
  const t = translations[language];

  const handleBack = () => {
    setCurrentStep(0);
    navigate("/");
  };

  useEffect(()=>{
      setSelectedFrame(null);
  }, [])

  const handleContinue = () => {
    if (selectedFrame) {
      setCurrentStep(2);
      navigate("/choose-quantity");
    }
  };

  const handleFrameSelect = (frame: Frame) => {
    // toggle selection: click again sẽ bỏ chọn
    if (selectedFrame?.id === frame.id) {
      setSelectedFrame(null);
    } else {
      setSelectedFrame(frame);
    }
  };

  return (
    <Layout>
      <div className="step-container">
        {/* Top banner title */}
        <div className="w-full flex justify-center mb-6 mt-5">
          <div
            style={{ backgroundColor: "#00167a" }}
            className="text-white rounded-t-3xl px-8 py-3 font-bold text-lg max-w-[620px] text-center"
          >
            Vui lòng chọn khung
          </div>
        </div>

        <div className="step-content compact-spacing">
          <div
            className="section-card"
            style={{ backgroundColor: "rgba(149, 173, 255, 0.11)" }}
          >
            <FrameSelector
              selectedFrame={selectedFrame}
              onFrameSelect={handleFrameSelect}
              onBack={handleBack}
              onContinue={handleContinue}
              language={language}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
