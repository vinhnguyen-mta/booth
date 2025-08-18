import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Layout } from "../components/Layout";
import styles from "./Css.module.css";
import clsx from "clsx";

export const ListImageSelected: React.FC = () => {
  const { capturedImages = [], selectedFrame, selectedImg } = useAppStore();

  const styleFrame = () => {
    switch (selectedFrame.code) {
      case "1x1_vertical_large":
        return "w-[30vw] h-[70vh]";
      case "1x2_vertical_large":
        return "w-[15vw] h-[35vh]";
      case "2x2_vertical_large":
        return "w-[150px] h-[200px]";
      case "1x4_vertical_small":
        return "w-[165px] h-[102px]";
      case "1x4_horizontal_large":
        return "w-[200px] h-[150px]";
      case "2x3_vertical_large":
        return "w-[150px] h-[200px]";
      case "2x4_vertical_large":
        return "w-[100px] h-[130px]";
      default:
        return "w-[30vw] h-[70vh]";
    }
  };

  const styleFrameBody = () => {
    switch (selectedFrame.code) {
      case "1x1_vertical_large":
        return "flex flex-col";
      case "1x2_vertical_large":
        return "flex flex-col";
      case "2x2_vertical_large":
        return "grid grid-cols-2 gap-4";
      case "1x4_vertical_small":
        return "flex flex-col";
      case "1x4_horizontal_large":
        return "grid grid-cols-2 gap-4";
      case "2x3_vertical_large":
        return "grid grid-cols-2 gap-4";
      case "2x4_vertical_large":
        return "grid grid-cols-2 gap-4";
      default:
        return "w-[30vw] h-[70vh]";
    }
  };

  return (
    <>
      <div
        className={clsx(
          "border-2 border-[#64646464] bg-white p-4 flex flex-col gap-4",
          styleFrameBody()
        )}
      >
        {[...Array(selectedFrame.slots)].map((_, idx) => {
          const url = selectedImg ?  selectedImg[idx] : null;
          return (
            <div
              key={idx}
              className={clsx(
                "bg-pink-50 bg-center bg-no-repeat border cursor-pointer flex items-center justify-center hover:opacity-80",
                styleFrame()
              )}
              style={
                url
                  ? {
                      backgroundImage: `url(${url})`,
                      backgroundSize: "auto 100%",
                    }
                  : {}
              }
            >
              {!url && <span className="text-gray-400 italic"></span>}
            </div>
          );
        })}
      </div>
    </>
  );
};
