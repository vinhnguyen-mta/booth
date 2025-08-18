import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import styles from "./Css.module.css";
import { useLocation } from "react-router-dom";
import { useAppStore } from "../store/useAppStore.ts";
import { print } from "../services/api.ts";

export const ExportImage: React.FC = () => {
  const navigate = useNavigate();
  const { finalImage } = useAppStore();

  useEffect(() => {
    const loadPrint = async () => {
      try {
        await print(finalImage);
        setTimeout(() => {
          navigate("/qr-download", { state: { fillMode, capturedImages } });
        }, 10000);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };
    loadPrint();
  }, []);

  const handleBack = () => {
    navigate("/filter-image");
  };

  const handleNext = () => {
    navigate("/qr-download", { state: { fillMode, capturedImages } });
  };

  const location = useLocation();
  const { fillMode, capturedImages } = location.state || {}; // lấy state truyền qua

  return (
    <Layout>
      <div className={styles.stepContainer}>
        <div className="flex flex-col items-center py-8">
          {/* Text trên */}
          <div className="text-xl font-normal text-center mb-5">
            Ảnh của bạn sẽ được in ngay. Vui lòng chờ trong giây lát.
          </div>
          <img
            src={finalImage}
            alt="Ảnh đã chọn"
            style={{ width: "400px", height: "400px" }}
          />

          {/* Text dưới */}
          <div className="text-lg font-normal text-center mt-5">
            cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
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
          onClick={handleNext}
          className={styles.navButtonRight}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </Layout>
  );
};
