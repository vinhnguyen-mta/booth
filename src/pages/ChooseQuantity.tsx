import React from "react";
import { motion } from "framer-motion";
import { Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import { translations } from "../i18n/translations";
import { FrameSelector } from "../components/FrameSelector";

export const ChooseQuantity: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    selectedFrame,
    quantity,
    setQuantity,
    totalPrice,
    setCurrentStep,
  } = useAppStore();
  const t = translations[language];

  const handleBack = () => {
    setCurrentStep(1);
    navigate("/choose-frame");
  };

  const handleContinue = () => {
    setCurrentStep(3);
    navigate("/payment");
  };

  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  if (!selectedFrame) {
    navigate("/choose-frame");
    return null;
  }

  return (
    <Layout>
      <div className="step-content min-h-screen flex items-center relative">
        {/* Top centered banner */}
        {/* <div className="w-full absolute top-8 right-10 flex justify-end z-20">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
            56
          </div>
        </div> */}
        <div className="w-full absolute top-8 left-0 flex justify-center z-20">
          <div className="bg-[#00167a] text-white rounded-b-xl px-6 py-2 font-bold text-lg text-center max-w-[520px]">
            Vui lòng chọn số lượng ảnh in
          </div>
        </div>

        {/* Left / Right nav arrows (styled to match other screens) */}
        <button
          aria-label="Prev"
          onClick={handleBack}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-[#00167a] text-white flex items-center justify-center shadow-lg z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          aria-label="Next"
          onClick={handleContinue}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-[#00167a] text-white flex items-center justify-center shadow-lg z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="max-w-5xl w-full mx-auto px-6">
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Frame preview */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 flex items-center justify-center"
              style={{ width: "100%" }}
            >
              <div className="w-56 md:w-64 lg:w-72 h-[320px] lg:h-[420px] flex items-center justify-center">
                <img src={selectedFrame.image} alt="preview" />
              </div>
            </motion.div>

            {/* Quantity controls & price (centered like image) */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl text-gray-700 disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold shadow-sm">
                  {quantity}
                </div>

                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 10}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl text-gray-700 disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mt-2">
                <div
                  className={`font-bold text-base text-[#00167a]`}
                  style={{ fontSize: "2.5rem" }}
                >
                  {formatPrice(totalPrice)}
                  {t.currency}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
