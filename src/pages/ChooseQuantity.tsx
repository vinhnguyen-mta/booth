import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import { translations } from '../i18n/translations';

export const ChooseQuantity: React.FC = () => {
  const navigate = useNavigate();
  const { 
    language, 
    selectedFrame, 
    quantity, 
    setQuantity, 
    totalPrice, 
    setCurrentStep 
  } = useAppStore();
  const t = translations[language];

  const handleBack = () => {
    setCurrentStep(1);
    navigate('/choose-frame');
  };

  const handleContinue = () => {
    setCurrentStep(3);
    navigate('/payment');
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
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (!selectedFrame) {
    navigate('/choose-frame');
    return null;
  }

  return (
    <Layout>
      <div className="step-content min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Frame Preview */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="section-card w-full"
            >
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl p-8 mb-6 relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, #F34B52 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>

                  <div
                      className="w-full h-80 flex items-center justify-center relative z-10"
                      dangerouslySetInnerHTML={{ __html: selectedFrame.svg }}
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-dark mb-2">
                    {language === 'vi' ? selectedFrame.name_vi : selectedFrame.name}
                  </h3>
                  <p className="text-xl font-bold text-primary mb-2">
                    {formatPrice(selectedFrame.price)}{t.currency}
                  </p>
                  <p className="text-gray-600">
                    {language === 'vi' ? 'Sẽ chụp 8 ảnh cho mỗi bản in' : 'Will take 8 photos for each print'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Quantity Control */}
            <div className="section-card">
              <div className="space-y-8">
                {/* Print Quantity Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                  <h2 className="text-2xl font-bold text-dark mb-6">{t.quantity}</h2>

                  <div className="flex items-center justify-center gap-6 mb-4">
                    <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="w-14 h-14 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                        aria-label="Decrease quantity"
                    >
                      <Minus className="w-6 h-6" />
                    </button>

                    <motion.div
                        key={quantity}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl"
                    >
                      {quantity}
                    </motion.div>

                    <button
                        onClick={incrementQuantity}
                        disabled={quantity >= 10}
                        className="w-14 h-14 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                        aria-label="Increase quantity"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>

                  <p className="text-gray-600 text-lg">
                    {language === 'vi'
                        ? `${quantity} bản in`
                        : `${quantity} prints`
                    }
                  </p>
                </motion.div>

                {/* Total Price */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                  <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
                    <h3 className="text-xl font-semibold mb-2 relative z-10">{t.totalPrice}</h3>
                    <div className="text-4xl font-bold relative z-10">
                      {formatPrice(totalPrice)}{t.currency}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <button
        onClick={handleBack}
        className="fixed-nav-button fixed-nav-back"
        aria-label={t.back}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="nav-button-text">{t.back}</span>
      </button>

      <button
        onClick={handleContinue}
        className="fixed-nav-button fixed-nav-continue"
      >
        {t.continue}
      </button>
    </Layout>
  );
};