import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import { NumericKeypad } from "../components/NumericKeypad";
import styles from "./Css.module.css";
import { getSessionToken } from "../services/api";
import { toast } from "../components/Toast";

export const Password: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentStep, setSessionToken } = useAppStore();

  const [voucherCode, setVoucherCode] = useState("");

  // Thêm useEffect để kiểm tra độ dài password
  useEffect(() => {
    if (voucherCode.length === 6) {
      // Có thể thêm logic kiểm tra mật khẩu đúng ở đây
      setTimeout(() => {
        // navigate("/landing");
        getToken(voucherCode);
      }, 300); // Delay nhỏ để người dùng thấy đủ 6 số
    }
  }, [voucherCode]);

  const handleBack = () => {
    setCurrentStep(2);
    navigate("/qr-download");
  };

  const getToken = async (password: string) => {
    try {
      const methods = await getSessionToken(password);
      if (methods?.session_token) {
        setSessionToken(methods.session_token);
        navigate("/landing");
      } else {
        toast.error("Sai mật khẩu. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const handleVoucherInput = (digit: string) => {
    if (voucherCode.length < 6) {
      // Đổi từ 8 thành 6
      setVoucherCode((v) => v + digit);
    }
  };

  const handleVoucherClear = () => setVoucherCode("");

  const handleNext = () => {
    // useAppStore.getState().setPaymentStatus("success");
    // setCurrentStep(4);
    // navigate("/end");
    getToken(voucherCode);
  };

  return (
    <Layout>
      <div className={styles.stepContainer}>
        <div className={styles.content}>
          <div className={styles.voucherCard}>
            <img
              src="/assets/close.png"
              alt="Đóng"
              style={{ float: "right" }}
              width={35}
            />
            <label className={styles.voucherLabel}>
              <img
                src="/assets/shut-down.png"
                alt="shut down"
                style={{ display: "inline", marginRight: "10px" }}
                width={35}
              />
              TRUY CẬP GIAO DIỆN CHỤP
            </label>
            <div className={styles.voucherRow}>
              <div className={styles.passwordLeft}>
                <div className={styles.passwordLeftTop}>
                  <div className={styles.passwordLeftEn}>Enter password</div>
                  <div className={styles.passwordLeftVn}>Nhập mật khẩu</div>
                </div>
                <div className={styles.voucherInput}>
                  <span className={styles.voucherText}>
                    {voucherCode || "______"}
                  </span>
                </div>
              </div>
              <div className={styles.keypadWrap}>
                <NumericKeypad
                  onNumberClick={handleVoucherInput}
                  onClear={handleVoucherClear}
                  onConfirm={handleNext}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Left / Right arrows (same style as other screens) */}
        {/* <button
                    aria-label="Prev"
                    onClick={handleBack}
                    className={styles.navButtonLeft}
                >
                    <ChevronLeft className="w-5 h-5"/>
                </button>

                <button
                    aria-label="Next"
                    onClick={handleNext}
                    className={styles.navButtonRight}
                >
                    <ChevronRight className="w-5 h-5"/>
                </button> */}
      </div>
    </Layout>
  );
};
