import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import styles from "./Css.module.css";
import ImageCanvas from "../components/ImageCanvas.tsx";
import { useAppStore } from "../store/useAppStore.ts";
import QRCode from "qrcode";

export const QRDownload: React.FC = () => {
  const navigate = useNavigate();

  const {
    finalImage,
    capturedVideos,
    resetSession,
    selectedImg,
    selectedFrame,
  } = useAppStore();
  const handleBack = () => {
    navigate("/export-image", { state: { fillMode, capturedImages } });
  };

  const handleNext = () => {
    resetSession();
    navigate("/landing");
  };

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    generateQRCode();
    console.log("capturedVideos", capturedVideos);
    console.log("selectedFrame", selectedFrame);
    
  }, []);

  const generateQRCode = async () => {
    try {
      const paymentUrl = `https://payment.example.com/pay/`;
      const dataUrl = await QRCode.toDataURL(paymentUrl, {
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

  const location = useLocation();
  const { fillMode, capturedImages } = location.state || {}; // lấy state truyền qua

  return (
    <Layout>
      <div className={styles.stepContainer}>
        <div className="flex flex-col items-center py-8">
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 border-2 border-[#00167a] rounded-3xl overflow-hidden">
                <img
                  src={selectedImg ? selectedImg[0] : null}
                  alt="Ảnh đã chọn"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            {capturedVideos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl compact-spacing border border-gray-200 mb-6">
                <div className="flex flex-col gap-4">
                  {capturedVideos
                    .slice(0, selectedFrame.slots)
                    .map((video, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 relative bg-black rounded-lg overflow-hidden aspect-video"
                      >
                        <video
                          className=""
                          src={video}
                          loop
                          autoPlay
                          playsInline
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {/*<ImageCanvas selectedImages={capturedImages} fillMode={fillMode}/>*/}
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 border-2 border-[#00167a] rounded-3xl flex items-center justify-center">
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-[90%] h-[90%] object-contain block"
                />
              </div>
              <div className="bg-[#00167a] text-white font-bold px-4 py-1 rounded-full -mt-4">
                Scan QR Code
              </div>
            </div>
          </div>

          {/* Nút End */}
          <div className="absolute bottom-8 right-8">
            <button
              onClick={handleNext}
              className="bg-[#00167a] text-white font-bold px-6 py-1 rounded-full"
            >
              Chụp Tiếp
            </button>
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
