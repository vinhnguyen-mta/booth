import React, { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";

interface ImageCanvasProps {
  selectedImages: string[];
  fillMode?: boolean;
  onImageProcessed?: (canvas: HTMLCanvasElement) => void;
}

const filters: Record<string, string> = {
  bw: "grayscale(100%)",
  warm: "sepia(30%) saturate(120%) hue-rotate(15deg)",
  cold: "hue-rotate(180deg) saturate(120%)",
  vintage: "sepia(50%) contrast(120%) brightness(90%)",
  cartoon: "contrast(150%) saturate(150%) brightness(110%)",
  blur: "blur(1px) brightness(110%)",
  dramatic: "contrast(140%) saturate(80%) brightness(95%)",
  retro: "sepia(40%) hue-rotate(320deg) saturate(120%)",
  neon: "saturate(200%) contrast(120%) brightness(110%)",
};

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  selectedImages,
  fillMode = false,
  onImageProcessed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectedFrame, selectedFilter, setFinalImage, frames } =
    useAppStore();

  useEffect(() => {
    if (selectedFrame && selectedImages?.length > 0) {
      renderCanvas();
    }
  }, [selectedImages, selectedFilter, fillMode, selectedFrame]);

  const listResizeHeight = [
    "1x3_horizontal_small",
    "1x4_vertical_small",
    "2x3_vertical_large",
    "2x4_vertical_large",
  ];

  const renderCanvas = async () => {
    if (!canvasRef.current || !selectedFrame) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // setup size
    canvas.width = 800;
    canvas.height = listResizeHeight.includes(selectedFrame.code) ? 1200 : 800;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // apply filter
    ctx.filter =
      selectedFilter && selectedFilter !== "original"
        ? filters[selectedFilter] || "none"
        : "none";

    await drawImagesWithLayout(
      ctx,
      selectedImages,
      selectedFrame.code,
      fillMode
    );

    // reset filter for frame
    ctx.filter = "none";

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setFinalImage(dataUrl);

    await drawFrameOverlay(ctx, selectedFrame.svg);

    // callback + store
    if (onImageProcessed) onImageProcessed(canvas);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-[400px] border rounded shadow ${
        listResizeHeight.includes(selectedFrame.code)
          ? selectedFrame.code === "2x4_vertical_large" ||
            selectedFrame.code === "1x4_vertical_small"
            ? selectedFrame.code === "1x4_vertical_small"
              ? "w-[300px] h-[700px]"
              : "h-[700px]"
            : "h-[600px]"
          : selectedFrame.code === "1x4_horizontal_large"
          ? "h-[400px]"
          : "h-[600px]"
      }`}
    />
  );
};

export default ImageCanvas;

// helpers
async function drawImagesWithLayout(
  ctx: CanvasRenderingContext2D,
  images: string[],
  layout: string,
  fillMode: boolean
) {
  const loadedImages = await Promise.all(
    images.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        })
    )
  );

  const spacingX = 20;
  const spacingY = 20;
  switch (layout) {
    case "1x1_vertical_large":
      if (loadedImages[0]) {
        drawImageFit(ctx, loadedImages[0], 40, 120, 800, 600, "stretch");
      }
      break;
    case "1x2_vertical_large":
      loadedImages.slice(0, 2).forEach((img, index) => {
        const y = 140 + index * (250 + 40);
        drawImageFit(ctx, img, 40, y, 700, 250, "stretch");
      });
      break;
    case "2x2_vertical_large":
      loadedImages.slice(0, 4).forEach((img, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 72 + col * 350;
        const y = 100 + row * 350;
        drawImageFit(ctx, img, x, y, 300, 300, "stretch");
      });
      break;
    case "1x4_vertical_small":
      loadedImages.slice(0, 4).forEach((img, index) => {
        const y = 40 + index * (250 + 40);
        drawImageFit(ctx, img, 60, y, 680, 250, "stretch");
      });

      break;
    case "1x4_horizontal_large":
      loadedImages.slice(0, 4).forEach((img, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 40 + col * 380;
        const y = 180 + row * 280;
        drawImageFit(ctx, img, x, y, 340, 200, "stretch");
      });
      break;
    case "2x3_vertical_large":
      const imgWidth = 350;
      const imgHeight = 260;

      loadedImages.slice(0, 6).forEach((img, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 44 + col * (imgWidth + spacingX);
        const y = 200 + row * (imgHeight + spacingY);
        drawImageFit(ctx, img, x, y, imgWidth, imgHeight, "stretch");
      });
      break;
    case "2x4_vertical_large":
      const imgWidth2X4 = 350;
      const imgHeight2X4 = 250;

      loadedImages.slice(0, 8).forEach((img, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);

        const x = 40 + col * (imgWidth2X4 + spacingX);
        const y = 100 + row * (imgHeight2X4 + spacingY);

        drawImageFit(ctx, img, x, y, imgWidth2X4, imgHeight2X4, "stretch");
      });
      break;
    case "1x3_horizontal_small":
      loadedImages.slice(0, 8).forEach((img, index) => {
        const y = 80 + index * (250 + 100);
        drawImageFit(ctx, img, 100, y, 600, 300, fillMode);
      });
      break;
  }
}

function drawImageFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  fillMode: boolean | "stretch"
) {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const boxAspect = width / height;

  let drawWidth, drawHeight, drawX, drawY;

  if (fillMode) {
    if (fillMode === "stretch") {
      drawWidth = width;
      drawHeight = height;
      drawX = x;
      drawY = y;
    } else {
      if (imgAspect > boxAspect) {
        drawHeight = height;
        drawWidth = height * imgAspect;
        drawX = x - (drawWidth - width) / 2;
        drawY = y;
        console.log(3);
      } else {
        console.log(4);
        drawWidth = width;
        drawHeight = width / imgAspect;
        drawX = x;
        drawY = y - (drawHeight - height) / 2;
      }
    }
  } else {
    if (imgAspect > boxAspect) {
      drawWidth = width;
      drawHeight = width / imgAspect;
      drawX = x;
      drawY = y + (height - drawHeight) / 2;
      console.log(1);
    } else {
      drawHeight = height;
      drawWidth = height * imgAspect;
      drawX = x + (width - drawWidth) / 2;
      drawY = y;
      console.log(2);
    }
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

async function drawFrameOverlay(ctx: CanvasRenderingContext2D, svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
}
