import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import QRCode from "qrcode";
import styles from "./QRModal.module.css";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    amount: number;
    paymentId: string;
    expiresAt: string;
  };
  language: "en" | "vi";
  company: any;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  language,
  company
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
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
      const paymentUrl = `https://payment.example.com/pay/${paymentData.paymentId}?amount=${paymentData.amount}`;
      const dataUrl = await QRCode.toDataURL(company?.qr_code_path ? company?.qr_code_path : paymentUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: "#00167a",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
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
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.overlay}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <X className={styles.closeIcon} />
            </button>

            <header className={styles.header}>
              <h4 className={styles.title}>
                {language === "vi"
                  ? "VUI LÒNG QUÉT MÃ THANH TOÁN DƯỚI ĐÂY BẰNG ỨNG DỤNG NGÂN HÀNG HOẶC VÍ ĐIỆN TỬ CỦA BẠN"
                  : "PLEASE SCAN QR-CODE FOR PAYMENT"}
              </h4>

              <p>
                PLEASE SCAN QR-CODE WITH YOUR MOBILE BANKING OR E-WALLET
                APPLICATION
              </p>
            </header>

            <div className={styles.center}>
              <div className={styles.qrWrap}>
                <div className={styles.scanPill}>SCAN ME</div>

                <div className={styles.qrBox}>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className={styles.qrImage}
                    />
                  ) : (
                    <div className={styles.qrPlaceholder} />
                  )}
                </div>
              </div>

              <div className={styles.timer}>
                <Clock className={styles.timerIcon} />
                <span className={styles.timerText}>
                  {language === "vi" ? "Thời gian còn lại:" : "Time remaining:"}{" "}
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
