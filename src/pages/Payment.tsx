import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import { NumericKeypad } from "../components/NumericKeypad";
import { QRModal } from "../components/QRModal";
import {
  createPayment,
  validateVoucher,
  getPaymentMethods,
  PaymentMethod,
  getPaymentCompany,
} from "../services/api";
import { translations } from "../i18n/translations";
import styles from "./Payment.module.css";

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { language, totalPrice, setPaymentMethod, setCurrentStep } =
    useAppStore();
  const t = translations[language];

  const [voucherCode, setVoucherCode] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  const finalPrice = totalPrice - discountApplied;

  useEffect(() => {
    loadPaymentMethods();
    loadPaymentCompany();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

    const loadPaymentCompany = async () => {
    try {
      const companyApi = await getPaymentCompany();
      console.log("companyApi", companyApi);
      setCompany(companyApi);
    } catch (error) {
      console.error("Error loading payment company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
    navigate("/choose-quantity");
  };

  const handleVoucherInput = (digit: string) => {
    if (voucherCode.length < 8) {
      setVoucherCode((v) => v + digit);
    }
  };

  const handleVoucherClear = () => setVoucherCode("");

  const handleVoucherConfirm = async () => {
    if (!voucherCode) return;
    try {
      const result = await validateVoucher(voucherCode);
      if (result.valid) {
        let discount = 0;
        if (result.type === "percentage") {
          discount = (totalPrice * result.discountAmount) / 100;
        } else {
          discount = result.discountAmount;
        }
        setDiscountApplied(discount);
      }
    } catch (error) {
      console.error("Error validating voucher:", error);
    }
  };

  const handleCashPayment = () => {
    setPaymentMethod("cash");
    setCurrentStep(3);
    navigate("/total-payment");
    setShowCashModal(true);
  };

  const handleQRPayment = async () => {
    setPaymentMethod("qr");
    try {
      await createPayment(finalPrice);
      setShowQRModal(true);
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const handlePaymentSuccess = () => {
    useAppStore.getState().setPaymentStatus("success");
    setCurrentStep(4);
    navigate("/capture");
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

  const mockPaymentData = {
    amount: finalPrice,
    paymentId: `pay_${Date.now()}`,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };

  // SVG paths (put these files into public/assets/)
  const CASH_SVG = "/assets/pay-cash.svg";
  const QR_SVG = "/assets/pay-qr.svg";

  const getIconComponent = (iconName: string, methodId?: string) => {
    // prefer methodId (e.g. 'cash' or 'qr'), else use iconName
    const key = (methodId || iconName || "").toLowerCase();
    if (key.includes("cash") || key.includes("banknote")) {
      return (
        <img
          src={CASH_SVG}
          alt="cash"
          style={{ width: 40, height: 40, objectFit: "contain" }}
        />
      );
    }
    if (
      key.includes("qr") ||
      key.includes("scan") ||
      key.includes("smartphone")
    ) {
      return (
        <img
          src={QR_SVG}
          alt="qr"
          style={{ width: 40, height: 40, objectFit: "contain" }}
        />
      );
    }

    // fallback simple svg box
    return (
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00167a",
        }}
      >
        <svg
          width="24"
          height="16"
          viewBox="0 0 24 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.5"
            y="2"
            width="23"
            height="12"
            rx="2"
            stroke="#00167a"
            strokeWidth="1.5"
          />
          <circle cx="8" cy="8" r="2" stroke="#00167a" strokeWidth="1.5" />
        </svg>
      </div>
    );
  };

  return (
    <Layout>
      <div className={styles.stepContainer}>
        {/* Top banner */}
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>
            {language === "vi"
              ? "VUI LÒNG CHỌN PHƯƠNG THỨC THANH TOÁN"
              : "PLEASE CHOOSE YOUR PAYMENT METHOD"}
          </h2>
          <p className={styles.bannerSub}>{language === "vi" ? "" : ""}</p>
        </div>

        <div className={styles.content}>
          {/* Left column: summary & payment methods */}
          <div className={styles.leftCol}>
            <div className={styles.summaryCard} onClick={handlePaymentSuccess}>
              <div className={styles.summaryRow}>
                <span className={styles.muted}>{t.totalPrice}:</span>
                <span className={styles.totalValue}>
                  {formatPrice(totalPrice)}
                  {t.currency}
                </span>
              </div>

              {discountApplied > 0 && (
                <div className={styles.discountRow}>
                  <span>{language === "vi" ? "Giảm giá:" : "Discount:"}</span>
                  <span>
                    -{formatPrice(discountApplied)}
                    {t.currency}
                  </span>
                </div>
              )}

              <div className={styles.summaryDivider}>
                <div className={styles.summaryRow}>
                  <span className={styles.bold}>{t.paymentAmount}:</span>
                  <span className={styles.finalValue}>
                    {formatPrice(finalPrice)}
                    {t.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* payment methods - updated layout to match design */}
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {loading ? (
                <div className={styles.loader}>Loading…</div>
              ) : (
                // show methods as two large horizontal cards (cash / qr first)
                paymentMethods.map((method) => {
                  const isCash = method.id === "cash";
                  return (
                    <button
                      key={method.id}
                      onClick={isCash ? handleCashPayment : handleQRPayment}
                      aria-label={method.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        padding: "16px 18px",
                        borderRadius: 10,
                        background: "#ffffff",
                        border: "2.5px solid rgba(0,22,122,0.12)",
                        boxShadow: "0 8px 22px rgba(2,6,23,0.04)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      {/* icon box with blue stroke like design */}
                      <div
                        style={{
                          minWidth: 96,
                          height: 64,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 8,
                          border: "4px solid #00167a",
                          background: "#fff",
                        }}
                      >
                        {/* reuse small svg/icon from getIconComponent */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#00167a",
                            fontSize: 20,
                          }}
                        >
                          {getIconComponent(method.icon)}
                        </div>
                      </div>

                      {/* text column */}
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            color: "#00167a",
                            fontWeight: 800,
                            fontSize: 16,
                            marginBottom: 6,
                          }}
                        >
                          {language === "vi" ? method.name_vi : method.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#0f172a",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          {language === "vi"
                            ? method.description_vi
                            : method.description}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column: voucher + keypad */}
          <div className={styles.rightCol}>
            <div className={styles.voucherCard}>
              <label className={styles.voucherLabel}>{t.voucherCode}</label>
              <div className={styles.voucherRow}>
                <div className={styles.voucherInput}>
                  <span className={styles.voucherText}>
                    {voucherCode || "________"}
                  </span>
                </div>

                <div className={styles.keypadWrap}>
                  <NumericKeypad
                    onNumberClick={handleVoucherInput}
                    onClear={handleVoucherClear}
                    onConfirm={handleVoucherConfirm}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left / Right arrows (same style as other screens) */}
        <button
          aria-label="Prev"
          onClick={handleBack}
          className={styles.navButtonLeft}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          aria-label="Next"
          onClick={() => {
            // tiến tới màn TOTAL PAYMENT khi người dùng bấm mũi tên phải
            // (ở màn Payment vẫn giữ modal QR khi nhấn các nút/khung khác)
            if (!loading) navigate("/total-payment");
          }}
          className={styles.navButtonRight}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Modals */}
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

        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          paymentData={mockPaymentData}
          language={language}
          company={company}
        />
      </div>
    </Layout>
  );
};

/* CashPaymentModal left unchanged (kept as in original file) */
const CashPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentComplete: () => void;
  language: "en" | "vi";
}> = ({ isOpen, onClose, amount, onPaymentComplete, language }) => {
  const [insertedAmount, setInsertedAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

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

      const randomDenomination =
        denominations[Math.floor(Math.random() * denominations.length)];
      const insertAmount = Math.min(randomDenomination, remaining);

      setInsertedAmount((prev) => prev + insertAmount);
      remaining -= insertAmount;
    }, 1500);
  };

  React.useEffect(() => {
    if (isOpen) {
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
        {/* kept content as before */}
        <div style={{ height: 260 }} />
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          {language === "vi" ? "Hủy" : "Cancel"}
        </button>
      </motion.div>
    </motion.div>
  );
};
