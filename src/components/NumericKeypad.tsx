import React from "react";
import { motion } from "framer-motion";
import { Delete } from "lucide-react";

interface NumericKeypadProps {
  onNumberClick: (number: string) => void;
  onClear: () => void;
  onConfirm: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onNumberClick,
  onClear,
  onConfirm,
}) => {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {numbers.slice(0, 9).map((number, index) => (
        <motion.button
          key={number}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onNumberClick(number)}
          className="w-16 h-16 bg-primary hover:bg-primary/90 text-white font-bold text-xl rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          {number}
        </motion.button>
      ))}

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45 }}
        onClick={onClear}
        className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-500/30"
        aria-label="Clear"
      >
        <Delete className="w-5 h-5" />
      </motion.button>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => onNumberClick("0")}
        className="w-16 h-16 bg-primary hover:bg-primary/90 text-white font-bold text-xl rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/30"
      >
        0
      </motion.button>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        onClick={onConfirm}
        className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/30"
      >
        OK
      </motion.button>
    </div>
  );
};
