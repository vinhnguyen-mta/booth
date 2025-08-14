import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import QRCode from 'qrcode';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    amount: number;
    paymentId: string;
    expiresAt: string;
  };
  language: 'en' | 'vi';
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  language
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (isOpen && paymentData) {
      generateQRCode();
      calculateTimeLeft();
      
      const timer = setInterval(() => {
        calculateTimeLeft();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, paymentData]);

  const generateQRCode = async () => {
    try {
      // Mock payment URL - in real app, this would be from backend
      const paymentUrl = `https://payment.example.com/pay/${paymentData.paymentId}?amount=${paymentData.amount}`;
      const dataUrl = await QRCode.toDataURL(paymentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#F34B52',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const expires = new Date(paymentData.expiresAt).getTime();
    const difference = expires - now;
    
    if (difference > 0) {
      setTimeLeft(Math.floor(difference / 1000));
    } else {
      setTimeLeft(0);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-dark">
                {language === 'vi' ? 'Quét mã QR để thanh toán' : 'Scan QR to Pay'}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              {qrDataUrl && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white p-4 rounded-lg shadow-inner inline-block mb-4"
                >
                  <img src={qrDataUrl} alt="Payment QR Code" className="w-48 h-48" />
                </motion.div>
              )}
              
              <div className="text-2xl font-bold text-primary mb-2">
                {formatPrice(paymentData.amount)}₫
              </div>
              
              <p className="text-gray-600 text-sm">
                {language === 'vi' 
                  ? 'Sử dụng ứng dụng ngân hàng để quét mã QR'
                  : 'Use your banking app to scan the QR code'
                }
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {language === 'vi' ? 'Thời gian còn lại:' : 'Time remaining:'} {formatTime(timeLeft)}
              </span>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="mb-2 font-medium">
                {language === 'vi' ? 'Hướng dẫn:' : 'Instructions:'}
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{language === 'vi' ? 'Mở ứng dụng ngân hàng' : 'Open your banking app'}</li>
                <li>{language === 'vi' ? 'Chọn chức năng quét QR' : 'Select QR scan function'}</li>
                <li>{language === 'vi' ? 'Quét mã QR trên màn hình' : 'Scan the QR code on screen'}</li>
                <li>{language === 'vi' ? 'Xác nhận thanh toán' : 'Confirm payment'}</li>
              </ol>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};