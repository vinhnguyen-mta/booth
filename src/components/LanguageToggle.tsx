import React from "react";
import { Globe } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "vi" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-white transition-colors"
      aria-label={`Switch to ${language === "en" ? "Vietnamese" : "English"}`}
    >
      <Globe className="w-4 h-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">
        {language === "en" ? "VI" : "EN"}
      </span>
    </button>
  );
};
