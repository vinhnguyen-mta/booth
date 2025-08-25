// UPDATE: New reusable FilterSelector component
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, getFilters, getIcons } from "../services/api";

interface FilterSelectorProps {
  selectedFilter: string | null;
  onFilterSelect: (filterId: string| null) => void;
  language: "en" | "vi";
}

export const  FilterSelector: React.FC<FilterSelectorProps> = ({
  selectedFilter,
  onFilterSelect,
  language,
}) => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0); // thay cho page

  const itemsPerPage = 5;

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filtersData = await getFilters();
        console.log("filtersData", filtersData);
        setFilters(filtersData);
      } catch (error) {
        console.error("Error loading filters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilters();
  }, []);

  const currentFilters = filters.slice(index, index + itemsPerPage);

  const handleNext = () => {
    if (index < filters.length - 1) {
      setIndex(index + 1);
    }
  };

  const handleBack = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Nút back */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center">
          <button
            onClick={handleBack}
            disabled={index === 0}
            className="w-9 h-9 border border-black rounded-full flex items-center justify-center"
          >
            &lt;
          </button>
        </div>
        <span className="mt-1 text-sm invisible">abc</span>
      </div>

      {/* Nút reset */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 flex items-center justify-center">
          <button onClick={() => onFilterSelect(null)}>
            <img
              src="/assets/reset.png"
              alt="reset"
              className="w-9 h-9 object-contain"
            />
          </button>
        </div>
        <span className="mt-1 text-sm">Reset</span>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        {currentFilters.map((filter, index) => (
          <div key={index} className="flex flex-col items-center">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onFilterSelect(filter.name)}
              className={`flex items-center justify-center w-20 h-20 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                selectedFilter === filter.name
                  ? "border-primary bg-primary/10 text-primary shadow-lg ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-primary/30 text-gray-700 hover:shadow-md"
              }`}
            >
              {/* Filter preview */}
              <div className="w-16 h-16 rounded-lg overflow-hidden relative">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200"
                  style={{ filter: filter.preview_filter || filter.css_filter }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                    <span className="text-lg">{filter.icon}</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Label */}
            <span className="mt-1 text-sm">
              {" "}
              {language === "vi" ? filter.name_vi : filter.name}
            </span>
          </div>
        ))}
      </div>

      {/* Nút next */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center">
          <button
            onClick={handleNext}
            disabled={index >= filters.length - 1}
            className="w-9 h-9 border border-black rounded-full flex items-center justify-center"
          >
            &gt;
          </button>
        </div>
        <span className="mt-1 text-sm invisible">abc</span>
      </div>
    </div>
  );
};
