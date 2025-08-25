import React, { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import styles from "./Css.module.css";
import { useAppStore } from "../store/useAppStore.ts";
import { print } from "../services/api.ts";

export const ExportImage: React.FC = () => {
  const navigate = useNavigate();
  const { finalImage } = useAppStore();
  const location = useLocation();
  const { fillMode, capturedImages } = location.state || {};

  const timeoutRef = useRef<number | null>(null);
  const navigatedRef = useRef(false);
  const aliveRef = useRef(false);
  const didRunRef = useRef(false);

  const goNext = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    navigate("/qr-download", { state: { fillMode, capturedImages } });
  };

  const handleNext = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    goNext();
  };

  useEffect(() => {
    if (didRunRef.current) {
      return;
    }
    didRunRef.current = true;

    aliveRef.current = true;

    (async () => {
      try {
        await print(finalImage);

        if (!aliveRef.current || navigatedRef.current) return;

        timeoutRef.current = window.setTimeout(() => {
          if (!navigatedRef.current) {
            goNext();
          }
        }, 10000);
      } catch (e) {
        console.error("Error loading filters:", e);
      }
    })();

    return () => {
      aliveRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Layout>
      <div className={styles.stepContainer}>
        <div className="flex flex-col items-center py-8">
          <div className="text-xl font-normal text-center mb-5">
            Ảnh của bạn sẽ được in ngay. Vui lòng chờ trong giây lát.
          </div>

          <img
            src={finalImage}
            alt="Ảnh đã chọn"
            className="border rounded shadow"
          />

          {/* Text dưới */}
          <div className="text-lg font-normal text-center mt-5">
            cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
          </div>
        </div>

        <button
          aria-label="Next"
          onClick={handleNext}
          className={styles.navButtonRight}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </Layout>
  );
};
