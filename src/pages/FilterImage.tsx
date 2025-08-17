import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import ImageCanvas from "../components/ImageCanvas";
import { FilterSelector } from "../components/FilterSelector.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import styles from "./Css.module.css";

export const FilterImage: React.FC = () => {
  const navigate = useNavigate();

  const {
    selectedFrame,
    capturedImages,
    selectedFilter,
    setSelectedFilter,
    setCurrentStep,
  } = useAppStore();
  const [fillMode, setFillMode] = useState(false);

  const handleBack = () => {
    setCurrentStep(2);
    navigate("/filters");
  };

  const handleNext = () => {
    useAppStore.getState().setPaymentStatus("success");
    setCurrentStep(4);
    navigate("/export-image", { state: { fillMode, capturedImages } });
  };

  if (!selectedFrame || capturedImages.length === 0) return null;

  return (
    <Layout>
      <div className={styles.stepContainer}>
        <div
          className="flex items-center justify-center bg-white"
          style={{ gap: "12rem" }}
        >
          <ImageCanvas selectedImages={capturedImages} fillMode={fillMode} />

          {/* Nội dung bên phải */}
          <div className="flex flex-col gap-8">
            {/* Chỉnh sửa ảnh */}
            <div className="flex items-center justify-between w-full px-4 mb-5">
              <div style={{ width: "64px" }} />
              {/* placeholder để cân giữa */}
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                56
              </div>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#1f3a93] text-white rounded-full hover:opacity-90 transition"
              >
                Print
              </button>
            </div>

            <div>
              <h2 className="text-lg font-normal mb-4">Chỉnh Sửa Ảnh</h2>
              <FilterSelector
                selectedFilter={selectedFilter}
                onFilterSelect={setSelectedFilter}
              />
            </div>

            {/* Khung cơ bản */}
            <div>
              <h2 className="text-lg font-normal mb-4">Khung cơ bản</h2>
              <div className="flex gap-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-black" />
                ))}
              </div>
            </div>

            {/* Khung ảnh Onibooth */}
            <div>
              <h2 className="text-lg font-normal mb-4">Khung ảnh Onibooth</h2>
              <div className="flex items-center gap-3">
                <button className="w-9 h-9 border border-black rounded-full flex items-center justify-center">
                  &lt;
                </button>
                <div className="flex gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-black" />
                  ))}
                </div>
                <button className="w-9 h-9 border border-black rounded-full flex items-center justify-center">
                  &gt;
                </button>
              </div>
              {/* Pagination */}
              <div className="flex gap-2 mt-4 justify-center">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Left / Right arrows (same style as other screens) */}
        {/*<button*/}
        {/*    aria-label="Prev"*/}
        {/*    onClick={handleBack}*/}
        {/*    className={styles.navButtonLeft}*/}
        {/*>*/}
        {/*    <ChevronLeft className="w-5 h-5"/>*/}
        {/*</button>*/}

        {/*<button*/}
        {/*    aria-label="Next"*/}
        {/*    onClick={handleNext}*/}
        {/*    className={styles.navButtonRight}*/}
        {/*>*/}
        {/*    <ChevronRight className="w-5 h-5"/>*/}
        {/*</button>*/}
      </div>
    </Layout>
  );
};
