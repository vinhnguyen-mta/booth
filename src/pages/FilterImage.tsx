import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import ImageCanvas from "../components/ImageCanvas";
import { FilterSelector } from "../components/FilterSelector.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import styles from "./Css.module.css";
import { FilterSelectorIcons } from "../components/FilterSelectorIcons.tsx";
import { ListImageSelected } from "./ListImageSelected.tsx";
import { FilterSelectorFrame } from "../components/FilterSelectorIconsFrame.tsx";

export const FilterImage: React.FC = () => {
  const navigate = useNavigate();

  const {
    selectedFrame,
    capturedImages,
    selectedFilter,
    setSelectedFilter,
    setCurrentStep,
    icons,
    setIcons,
    frames,
    setFrame,
    selectedImg
  } = useAppStore();
  const [fillMode, setFillMode] = useState(false);

  const handleBack = () => {
    setCurrentStep(2);
    navigate("/filters");
  };

  const handleNext = () => {
    useAppStore.getState().setPaymentStatus("success");
    setCurrentStep(4);
    navigate("/export-image", { state: { fillMode, selectedImg } });
  };

  if (!selectedFrame || capturedImages.length === 0) return null;

  return (
    <Layout>
      <div className={styles.stepContainer}>
        <div
          className="flex items-center justify-center bg-white"
          style={{ gap: "12rem" }}
        >
          <ImageCanvas selectedImages={selectedImg} fillMode={fillMode} />

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
              <h2 className="text-lg font-normal mb-4">Khung ảnh Onibooth</h2>
              <FilterSelector
                selectedFilter={selectedFilter}
                onFilterSelect={setSelectedFilter}
              />
            </div>

            {/* Khung cơ bản */}
            <div>
              <h2 className="text-lg font-normal mb-4">Icons</h2>
              <FilterSelectorIcons
                selectedFilter={icons}
                onFilterSelect={setIcons}
              />
            </div>

            {/* Khung ảnh Onibooth */}
            <div>
              <h2 className="text-lg font-normal mb-4">Khung ảnh Onibooth</h2>
              <FilterSelectorFrame
                selectedFilter={frames}
                onFilterSelect={setFrame}
                selectedFrame={selectedFrame}
              />
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
