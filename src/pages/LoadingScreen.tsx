import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAppStore } from "../store/useAppStore";
import styles from "./LoadingScreen.module.css";

export const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setCurrentStep } = useAppStore();

  useEffect(() => {
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      useAppStore.getState().setPaymentStatus("success");
      setCurrentStep(5);
      navigate("/capture");
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>HƯỚNG DẪN CHỤP</h1>

          <div className={styles.instructions}>
            <p>
              Vui lòng tạo dáng, nhìn thẳng vào ống kính và giữ nguyên tư thế
              cho đến khi chụp xong mới bắt đầu.
            </p>
          </div>

          <div className={styles.loadingBar}>
            <div className={styles.progress}>
              <div className={styles.heart}>❤</div>
            </div>
          </div>

          <div className={styles.loadingText}>Loading...</div>
        </div>
      </div>
    </Layout>
  );
};

export default LoadingScreen;
