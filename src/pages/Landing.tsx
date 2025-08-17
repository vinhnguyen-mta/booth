import React from "react";
import { motion } from "framer-motion";
import { Camera, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import { translations } from "../i18n/translations";
import styles from "./Landing.module.css";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { language, setCurrentStep } = useAppStore();
  const t = translations[language];

  const handleStart = () => {
    setCurrentStep(1);
    navigate("/choose-frame");
  };

  return (
    <Layout>
      <div
        className="flex-1 flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: "#95adff1c" }}
      >
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
            className={`mb-8 ${styles.centered}`}
          >
            <div className={`mb-6 w-full ${styles.styleLogo}`}>
              <img
                src="/assets/logo-start.png"
                alt="PhotoBooth Logo"
                className={styles.logo}
                style={{ display: "block" }}
              />
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <button
              onClick={handleStart}
              className={styles.startButton}
              aria-label={t.startButton}
            >
              <span className={styles.playCircle}>
                <Play className="w-5 h-5 text-[#00167a]" />
              </span>
              {t.startButton}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};
