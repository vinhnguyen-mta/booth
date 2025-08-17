import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import styles from "./Css.module.css";

export const End: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentStep } = useAppStore();

  const handleBack = () => {
    setCurrentStep(2);
    navigate("/password");
  };

  const handleNext = () => {
    setCurrentStep(4);
    navigate("/");
  };

  return (
    <Layout>
      <div className={styles.stepContainer}>
        <div className="flex items-center justify-center h-screen bg-white">
          <img
            src="/assets/logo-start.png"
            alt="niBooth Logo"
            className="max-w-full h-auto"
          />
        </div>

        {/* Left / Right arrows (same style as other screens) */}
        <button
          aria-label="Prev"
          onClick={handleBack}
          className={styles.navButtonLeft}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          aria-label="Next"
          onClick={handleNext}
          className={styles.navButtonRight}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </Layout>
  );
};
