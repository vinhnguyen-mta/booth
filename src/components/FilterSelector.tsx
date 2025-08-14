// UPDATE: New reusable FilterSelector component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, getFilters } from '../services/api';

interface FilterSelectorProps {
  selectedFilter: string;
  onFilterSelect: (filterId: string) => void;
  language: 'en' | 'vi';
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  selectedFilter,
  onFilterSelect,
  language
}) => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const filtersData = await getFilters();
      setFilters(filtersData);
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setLoading(false);
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
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
      {filters.map((filter, index) => (
        <motion.button
          key={filter.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onFilterSelect(filter.id)}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
            selectedFilter === filter.id
              ? 'border-primary bg-primary/10 text-primary shadow-lg ring-2 ring-primary/20'
              : 'border-gray-200 hover:border-primary/30 text-gray-700 hover:shadow-md'
          }`}
        >
          {/* Filter preview */}
          <div className="w-full h-16 mb-3 rounded-lg overflow-hidden bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 relative">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200"
              style={{ filter: filter.preview_filter || filter.css_filter }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                <span className="text-lg">{filter.icon}</span>
              </div>
            </div>
          </div>
          
          <div className="font-semibold text-base mb-1">
            {language === 'vi' ? filter.name_vi : filter.name}
          </div>
          <div className="text-xs opacity-75">
            {language === 'vi' ? filter.description_vi : filter.description}
          </div>
        </motion.button>
      ))}
    </div>
  );
};