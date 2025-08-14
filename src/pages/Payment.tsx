import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Layout } from '../components/Layout';
import { NumericKeypad } from '../components/NumericKeypad';
import { QRModal } from '../components/QRModal';
import { createPayment, validateVoucher, getPaymentMethods, PaymentMethod } from '../services/api';
import { translations } from '../i18n/translations';

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { 
    language, 
    totalPrice,
    setPaymentMethod,
    setCurrentStep 
  } = useAppStore();
  const t = translations[language];

  const [voucherCode, setVoucherCode] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const finalPrice = totalPrice - discountApplied;

  // UPDATE: Load payment methods from API
  React.useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    setCurrentStep(2);
    navigate('/choose-quantity');
  };

  const handleVoucherInput = (digit: string) => {
    if (voucherCode.length < 8) {
      setVoucherCode(voucherCode + digit);
    }
  };

  const handleVoucherClear = () => {
    setVoucherCode('');
  };

  // UPDATE: Use API for voucher validation
  const handleVoucherConfirm = async () => {
    if (voucherCode.length === 0) return;
    
    try {
      const result = await validateVoucher(voucherCode);
      if (result.valid) {
        setDiscountApplied(result.discountAmount);
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
    }
  };

  const handleCashPayment = () => {
    setPaymentMethod('cash');
    setShowCashModal(true);
  };

  const handleQRPayment = async () => {
    setPaymentMethod('qr');
    try {
      // TODO: Create real payment
      const paymentData = await createPayment(finalPrice);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handlePaymentSuccess = () => {
    // UPDATE: Tạm thời pass qua thanh toán cho demo
    useAppStore.getState().setPaymentStatus('success');
    setCurrentStep(4);
    navigate('/capture');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const mockPaymentData = {
    amount: finalPrice,
    paymentId: `pay_${Date.now()}`,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
  };

  const getIconComponent = (iconName: string) => {
    // UPDATE: Dynamic icon loading based on payment method
    const icons: Record<string, any> = {
      'banknote': () => <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">💵</div>,
      'smartphone': () => <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">📱</div>,
      'credit-card': () => <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">💳</div>
    };
    return icons[iconName]() || icons['banknote']();
  };
  return (
    <Layout>
      <div className="step-container">
        {/* Header */}
        {/*<div className="step-header flex items-center justify-between compact-spacing border-b bg-white/50 backdrop-blur-sm">*/}
        {/*  <button*/}
        {/*    onClick={handleBack}*/}
        {/*    className="flex items-center gap-2 text-dark hover:text-primary transition-colors"*/}
        {/*    aria-label={t.back}*/}
        {/*  >*/}
        {/*    <ArrowLeft className="w-5 h-5" />*/}
        {/*    {t.back}*/}
        {/*  </button>*/}
        {/*  */}
        {/*  <div className="text-center">*/}
        {/*    <h1 className="text-2xl font-bold text-dark">{t.paymentTitle}</h1>*/}
        {/*    <p className="text-gray-600 compact-text">{t.paymentSubtitle}</p>*/}
        {/*  </div>*/}
        {/*  */}
        {/*  <div className="w-20" />*/}
        {/*</div>*/}

        <div className="step-content min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Payment Methods */}
              <div className="section-card">
                {/* Price Summary */}
                <motion.div
                    initial={{ y: 20 }}
                    onClick={handlePaymentSuccess}
                    className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl compact-spacing mb-9"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="compact-text text-gray-700">{t.totalPrice}:</span>
                    <span className="text-lg font-bold text-gray-800">
              {formatPrice(totalPrice)}{t.currency}
            </span>
                  </div>

                  {discountApplied > 0 && (
                      <div className="flex items-center justify-between mb-2 text-green-600">
                        <span>{language === 'vi' ? 'Giảm giá:' : 'Discount:'}</span>
                        <span>-{formatPrice(discountApplied)}{t.currency}</span>
                      </div>
                  )}

                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-dark">{t.paymentAmount}:</span>
                      <span className="text-2xl font-bold text-primary">
                {formatPrice(finalPrice)}{t.currency}
              </span>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Options */}
                <div className="compact-grid">
                  {loading ? (
                      <div className="col-span-full flex items-center justify-center compact-spacing">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                  ) : (
                      paymentMethods.map((method, index) => (
                          <motion.button
                              key={method.id}
                              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                              onClick={method.id === 'cash' ? handleCashPayment : handleQRPayment}
                              className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30 rounded-xl compact-spacing transition-all duration-300 hover:shadow-lg group"
                          >
                            <div className="text-center">
                              <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                                {getIconComponent(method.icon)}
                              </div>
                              <h3 className="text-lg font-bold text-dark mb-2">
                                {language === 'vi' ? method.name_vi : method.name}
                              </h3>
                              <p className="text-gray-600 compact-text">
                                {language === 'vi' ? method.description_vi : method.description}
                              </p>
                            </div>
                          </motion.button>
                      ))
                  )}
                </div>
              </div>

              {/* Voucher Section */}
              <div className="section-card">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                  <h3 className="text-base font-semibold text-dark mb-4">{t.voucherCode}</h3>

                  <div className="mb-4">
                    <input
                        type="text"
                        value={voucherCode}
                        readOnly
                        placeholder="________"
                        className="w-full text-center text-xl font-mono bg-gray-50 border-2 border-gray-200 rounded-lg compact-spacing focus:border-primary focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="mb-6">
                    <NumericKeypad
                        onNumberClick={handleVoucherInput}
                        onClear={handleVoucherClear}
                        onConfirm={handleVoucherConfirm}
                    />
                  </div>

                  {discountApplied > 0 && (
                      <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-green-50 border-2 border-green-200 rounded-lg compact-spacing text-center"
                      >
                        <div className="text-green-600 font-medium">
                          {language === 'vi' ? '🎉 Mã giảm giá đã áp dụng!' : '🎉 Voucher applied!'}
                        </div>
                        <div className="text-green-800 font-bold">
                          -{formatPrice(discountApplied)}{t.currency}
                        </div>
                      </motion.div>
                  )}

                  {/* Voucher Examples */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      {language === 'vi' ? 'Mã giảm giá có sẵn:' : 'Available voucher codes:'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white rounded border">
                        <code className="font-mono text-primary">12345678</code>
                        <span className="text-gray-600">-20,000₫</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border">
                        <code className="font-mono text-primary">SAVE10K</code>
                        <span className="text-gray-600">-10,000₫</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border">
                        <code className="font-mono text-primary">NEWUSER</code>
                        <span className="text-gray-600">-15%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>


        {/* Cash Payment Modal */}
        <AnimatePresence>
          {showCashModal && (
            <CashPaymentModal
              isOpen={showCashModal}
              onClose={() => setShowCashModal(false)}
              amount={finalPrice}
              onPaymentComplete={handlePaymentSuccess}
              language={language}
            />
          )}
        </AnimatePresence>

        {/* QR Payment Modal */}
        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          paymentData={mockPaymentData}
          language={language}
        />
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
    </Layout>
  );
};

// Cash Payment Modal Component
const CashPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentComplete: () => void;
  language: 'en' | 'vi';
}> = ({ isOpen, onClose, amount, onPaymentComplete, language }) => {
  const [insertedAmount, setInsertedAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const simulateCashInsertion = () => {
    setIsProcessing(true);
    const denominations = [500000, 200000, 100000, 50000, 20000, 10000];
    let remaining = amount - insertedAmount;
    
    const insertInterval = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(insertInterval);
        setIsProcessing(false);
        setTimeout(onPaymentComplete, 1000);
        return;
      }
      
      const randomDenomination = denominations[Math.floor(Math.random() * denominations.length)];
      const insertAmount = Math.min(randomDenomination, remaining);
      
      setInsertedAmount(prev => prev + insertAmount);
      remaining -= insertAmount;
    }, 1500);
  };

  useEffect(() => {
    if (isOpen) {
      // Auto-start cash insertion simulation after 2 seconds
      const timer = setTimeout(() => {
        simulateCashInsertion();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <div className="mb-6">
          <motion.div
            animate={{ 
              scale: isProcessing ? [1, 1.1, 1] : 1,
              rotate: isProcessing ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              duration: 1, 
              repeat: isProcessing ? Infinity : 0 
            }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Banknote className="w-12 h-12 text-green-600" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-dark mb-2">
            {language === 'vi' ? 'Vui lòng cho tiền vào' : 'Please insert money'}
          </h3>
          
          <p className="text-gray-600">
            {language === 'vi' 
              ? 'Đưa tiền mặt vào khe nhận tiền bên dưới'
              : 'Insert cash into the bill acceptor below'
            }
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-lg">
            <span>{language === 'vi' ? 'Cần thanh toán:' : 'Amount due:'}</span>
            <span className="font-bold text-primary">{formatPrice(amount)}₫</span>
          </div>
          
          <div className="flex justify-between text-lg">
            <span>{language === 'vi' ? 'Đã nhận:' : 'Received:'}</span>
            <span className="font-bold text-green-600">{formatPrice(insertedAmount)}₫</span>
          </div>
          
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>{language === 'vi' ? 'Còn lại:' : 'Remaining:'}</span>
            <span className="text-red-600">
              {formatPrice(Math.max(0, amount - insertedAmount))}₫
            </span>
          </div>
        </div>

        {insertedAmount >= amount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4"
          >
            <div className="text-green-600 font-bold text-lg">
              {language === 'vi' ? '✅ Thanh toán thành công!' : '✅ Payment successful!'}
            </div>
          </motion.div>
        )}

        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          {language === 'vi' ? 'Hủy' : 'Cancel'}
        </button>
      </motion.div>
    </motion.div>
  );
};