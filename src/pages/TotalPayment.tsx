import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import styles from "./TotalPayment.module.css";

export const TotalPayment: React.FC = () => {
  const navigate = useNavigate();
  const { language, totalPrice, setCurrentStep } = useAppStore();

  const handleBack = () => {
    setCurrentStep(3); // assume Payment step is 3
    navigate("/payment");
  };

  const handleNext = () => {
    // tiếp tục sang bước tiếp theo (ví dụ Capture)
    setCurrentStep(5);
    navigate("/capture");
  };

  const handleDotClick = () => {
    setCurrentStep(4);
    navigate("/loading");
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

  return (
    <Layout>
      <div className={styles.container}>
        {/* Close X button top-right -> go to /landing */}
        <button
          aria-label="Close"
          onClick={() => {
            setCurrentStep(0);
            navigate("/landing");
          }}
          style={{
            position: "fixed", // changed -> fixed to pin to viewport top-right
            right: 12,
            top: 12,
            zIndex: 10000,
            width: 40,
            height: 40,
            borderRadius: 20,
            border: "none",
            background: "#e6f0ff", // light blue bg
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#0b5fff",
          }}
        >
          <X size={18} />
        </button>

        <header className={styles.header}>
          <h1 className={styles.title}>TOTAL PAYMENT</h1>
          <p className={styles.note}>
            Hệ thống không trả lại tiền thừa. Hãy liên hệ thu ngân để đổi tiền
            lẻ (nếu cần hỗ trợ)
          </p>
          <p className={styles.note2}>
            The system does not return excess money. Please prepare the exact
            amount
          </p>
        </header>

        <main className={styles.main}>
          <div className={styles.col}>
            <div className={styles.colTitle}>SỐ TIỀN ĐÃ NHẬN ĐƯỢC</div>
            <div className={styles.colTitle2}>AMOUNT RECEIVED</div>
            <div className={styles.amount}>{formatPrice(totalPrice)} VND</div>
            <div className={styles.colSub} />
          </div>

          <div className={styles.colCenter}>
            <div className={styles.iconWrap}>
              <div className={styles.icon}>
                <img src="/assets/cash-payment.png" alt="Banknote Icon" />
              </div>
            </div>

            <div
              style={{ cursor: "pointer", display: "flex", gap: "6px" }}
              onClick={handleDotClick}
            >
              <div className={styles.centerDot}></div>
              <div className={`${styles.centerDot} ${styles.dot2}`}></div>
              <div className={`${styles.centerDot} ${styles.dot3}`}></div>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>
              VUI LÒNG CHO THÊM TIỀN VÀO MÁY
            </div>
            <div className={styles.colTitle2}>PLEASE INSERT BANKNOTE</div>
            <div className={styles.amount}>{formatPrice(0)} VND</div>
          </div>
        </main>

        <button
          aria-label="Prev"
          className={styles.navButtonLeft}
          onClick={handleBack}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* <button
          aria-label="Next"
          className={styles.navButtonRight}
          onClick={handleNext}
        >
          <ChevronRight className="w-5 h-5" />
        </button> */}
      </div>
    </Layout>
  );
};

export default TotalPayment;
