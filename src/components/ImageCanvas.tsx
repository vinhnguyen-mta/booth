import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { TEXT_IMG_SIZE } from "../constant/constant";

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
  }, [selectedImages, selectedFilter, fillMode, selectedFrame, frames]);

  const getImgSize = (type: string) => {
    let width = 0;
    let height = 0;
    switch (type) {
      case TEXT_IMG_SIZE.IMG_1X1:
        width = scale(2400);
        height = scale(3600);
        break;
      case TEXT_IMG_SIZE.IMG_1X2_VERTICAL:
        width = scale(2400);
        height = scale(3600);
        break;
      case TEXT_IMG_SIZE.IMG_2X2_VERTICAL:
        width = scale(2400);
        height = scale(3600);
        break;
      case TEXT_IMG_SIZE.IMG_1X4_VERTICAL:
        width = scale(1200, 1.2);
        height = scale(3600, 1.2);
        break;
      case TEXT_IMG_SIZE.IMG_1X4_HORIZONTAL:
        width = scale(3600);
        height = scale(2400);
        break;
      case TEXT_IMG_SIZE.IMG_2X3_VERTICAL:
        width = scale(2400);
        height = scale(3600);
        break;
      case TEXT_IMG_SIZE.IMG_2X4_VERTICAL:
        width = scale(2400);
        height = scale(3600);
        break;
      case TEXT_IMG_SIZE.IMG_1X3_HORIZONTAL:
        width = scale(3600);
        height = scale(1200);
        break;
      default:
        width = scale(3600);
        height = scale(2400);
        break;
    }
    return {
      width,
      height,
    };
  };

  const renderCanvas = async () => {
    if (!canvasRef.current || !selectedFrame) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // setup size
    canvas.width = getImgSize(selectedFrame.code).width;
    canvas.height = getImgSize(selectedFrame.code).height;

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

    // load frame PNG
    const frame = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = frames?.image;
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.error("Failed to load frame PNG", err);
        resolve(null);
      };
    });

    await drawFrameOverlay(ctx, selectedFrame.svg, frame);

    // callback + store
    if (onImageProcessed) onImageProcessed(canvas);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setFinalImage(dataUrl);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`border rounded shadow w-[${
        getImgSize(selectedFrame.code).width
      }px] h-[${getImgSize(selectedFrame.code).height}px]`}
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
    images?.map(
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
        await drawBase64CoverIntoCanvas(
          convertRatioCanva({
            ctx: ctx,
            base64: loadedImages[0] as any,
            dx: 136,
            dy: 463,
            frameW: 2128,
            frameH: 2897,
            focusX: 0.5,
            focusY: 1,
            pdTopImg: 0,
            pdLeftImg: 0,
          })
        );
      }
      break;
    case "1x2_vertical_large":
      loadedImages.slice(0, 2).forEach(async (img, index) => {
        if (img) {
          await drawBase64CoverIntoCanvas(
            convertRatioCanva({
              ctx: ctx,
              base64: img as any,
              dx: 130,
              dy: 514 + index * 1393,
              frameW: 2140,
              frameH: 1393,
              focusX: 0.5,
              focusY: 1,
              pdTopImg: index > 0 ? 60 : 0,
              pdLeftImg: 0,
            })
          );
        }
      });
      break;
    case "2x2_vertical_large":
      loadedImages.slice(0, 4).forEach(async (img, index) => {
        if (img) {
          await drawBase64CoverIntoCanvas(
            convertRatioCanva({
              ctx: ctx,
              base64: img as any,
              dx: 122 + (index % 2 !== 0 ? 1048 : 0),
              dy: 462 + (index > 1 ? 1419 : 0),
              frameW: 1048,
              frameH: 1419,
              focusX: 0.5,
              focusY: 1,
              pdTopImg: index > 1 ? 60 : 0,
              pdLeftImg: index % 2 !== 0 ? 60 : 0,
            })
          );
        }
      });
      break;
    case "1x4_vertical_small":
      loadedImages.slice(0, 4).forEach(async (img, index) => {
        if (img) {
          await drawBase64CoverIntoCanvas(
            convertRatioCanva({
              ctx: ctx,
              base64: img as any,
              dx: 77,
              dy: 473 + index * 671,
              frameW: 1045,
              frameH: 671,
              focusX: 0.5,
              focusY: 1,
              pdTopImg: index > 0 ? 65 : 0,
              pdLeftImg: 0,
              multiplication: 1.2,
            })
          );
        }
      });
      break;
    case "1x4_horizontal_large":
      loadedImages.slice(0, 4).forEach(async (img, index) => {
        if (img) {
          await drawBase64CoverIntoCanvas(
            convertRatioCanva({
              ctx: ctx,
              base64: img as any,
              dx: 133 + (index % 2 !== 0 ? 1637 : 0),
              dy: 424 + (index > 1 ? 900 : 0),
              frameW: 1637,
              frameH: 900,
              focusX: 0.5,
              focusY: 1,
              pdTopImg: index > 1 ? 60 : 0,
              pdLeftImg: index % 2 !== 0 ? 60 : 0,
            })
          );
        }
      });
      break;
    case "2x3_vertical_large":
      loadedImages.slice(0, 6).forEach(async (img, index) => {
        if (img) {
          await drawBase64CoverIntoCanvas(
            convertRatioCanva({
              ctx: ctx,
              base64: img as any,
              dx: 121 + (index % 2 !== 0 ? 1062 : 0),
              dy: 424 + (index > 1 ? Math.floor(index / 2) * 988 : 0),
              frameW: 1062,
              frameH: 988,
              focusX: 0.5,
              focusY: 1,
              pdTopImg: index > 1 ? 33 : 0,
              pdLeftImg: index % 2 !== 0 ? 33 : 0,
            })
          );
        }
      });
      break;
    case "2x4_vertical_large":
      loadedImages.slice(0, 8).forEach(async (img, index) => {
        if (img) {
          await drawBase64CoverIntoCanvas(
            convertRatioCanva({
              ctx: ctx,
              base64: img as any,
              dx: 129 + (index % 2 !== 0 ? 1058 : 0),
              dy: 331 + (index > 1 ? Math.floor(index / 2) * 738 : 0),
              frameW: 1058,
              frameH: 738,
              focusX: 0.5,
              focusY: 1,
              pdTopImg: index > 1 ? 25 : 0,
              pdLeftImg: index % 2 !== 0 ? 25 : 0,
            })
          );
        }
      });
      break;
    case "1x3_horizontal_small":
      loadedImages.slice(0, 3).forEach(async (img, index) => {
        if (img) {
          await drawBase64CoverIntoCanvas(
            convertRatioCanva({
              ctx: ctx,
              base64: img as any,
              dx: 97 + (index > 0 ? index * 1095 : 0),
              dy: 295,
              frameW: 1095,
              frameH: 821,
              focusX: 0.5,
              focusY: 1,
              pdTopImg: 0,
              pdLeftImg: index > 0 ? 60 : 0,
            })
          );
        }
      });
      break;
  }
}

function scale(value: number, multiplication: number = 1) {
  return (value / 10) * 1.5 * multiplication;
}

const convertRatioCanva = (options: {
  ctx: CanvasRenderingContext2D;
  base64: any;
  dx: number;
  dy: number;
  frameW: number;
  frameH: number;
  focusX?: number;
  focusY?: number;
  pdTopImg?: number;
  pdLeftImg?: number;
  multiplication?: number;
}) => {
  const {
    ctx,
    base64,
    dx,
    dy,
    frameW,
    frameH,
    focusX = 0.5,
    focusY = 0.5,
    pdTopImg = 0,
    pdLeftImg = 0,
    multiplication = 1,
  } = options;
  return {
    ctx,
    base64,
    dx: scale(dx, multiplication),
    dy: scale(dy, multiplication),
    frameW: scale(frameW, multiplication),
    frameH: scale(frameH, multiplication),
    focusX,
    focusY,
    pdTopImg: scale(pdTopImg, multiplication),
    pdLeftImg: scale(pdLeftImg, multiplication),
  };
};

export function calcCoverSrcRect(
  imgW: number,
  imgH: number,
  frameW: number,
  frameH: number,
  focusX = 0.5,
  focusY = 0.5
) {
  const srcAR = imgW / imgH;
  const dstAR = frameW / frameH;

  let sx = 0,
    sy = 0,
    sWidth = imgW,
    sHeight = imgH;

  if (srcAR > dstAR) {
    sHeight = imgH;
    sWidth = Math.round(imgH * dstAR);
    sx = Math.round((imgW - sWidth) * focusX);
    sx = Math.max(0, Math.min(imgW - sWidth, sx));
    sy = 0;
  } else {
    sWidth = imgW;
    sHeight = Math.round(imgW / dstAR);
    sy = Math.round((imgH - sHeight) * focusY);
    sy = Math.max(0, Math.min(imgH - sHeight, sy));
    sx = 0;
  }

  return { sx, sy, sWidth, sHeight };
}

export async function drawBase64CoverIntoCanvas(options: {
  ctx: CanvasRenderingContext2D;
  base64: any;
  dx: number;
  dy: number;
  frameW: number;
  frameH: number;
  focusX?: number;
  focusY?: number;
  pdTopImg?: number;
  pdLeftImg?: number;
}) {
  const {
    ctx,
    base64,
    dx,
    dy,
    frameW,
    frameH,
    focusX = 0.5,
    focusY = 0.5,
    pdTopImg = 0,
    pdLeftImg = 0,
  } = options;
  console.log("options", options);
  if (!ctx) return;

  const dpr = Math.max(1, Math.round(1));

  const { sx, sy, sWidth, sHeight } = calcCoverSrcRect(
    base64.width,
    base64.height,
    frameW,
    frameH,
    focusX,
    focusY
  );

  const DDx = Math.round(dx * dpr);
  const DDy = Math.round(dy * dpr);
  const DDw = Math.round(frameW * dpr);
  const DDh = Math.round(frameH * dpr);

  ctx.imageSmoothingEnabled = true;

  ctx.save();
  ctx.beginPath();
  ctx.rect(DDx, DDy, DDw, DDh);
  ctx.clip();

  ctx.drawImage(
    base64,
    sx,
    sy,
    sWidth,
    sHeight,
    DDx + pdLeftImg,
    DDy + pdTopImg,
    DDw,
    DDh
  );
  ctx.restore();
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
      } else {
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
    } else {
      drawHeight = height;
      drawWidth = height * imgAspect;
      drawX = x + (width - drawWidth) / 2;
      drawY = y;
    }
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

async function drawFrameOverlay(
  ctx: CanvasRenderingContext2D,
  svg: string,
  frame?: any
) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const svgImg = new Image();
  svgImg.src = url;

  await new Promise<void>((resolve) => {
    svgImg.onload = () => {
      ctx.drawImage(svgImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
      URL.revokeObjectURL(url);
      resolve();
    };
    svgImg.onerror = (err) => {
      console.error("Failed to load SVG", err);
      URL.revokeObjectURL(url);
      resolve();
    };
  });

  if (frame) {
    if (frame.complete) {
      ctx.drawImage(frame, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      await new Promise<void>((resolve) => {
        frame.onload = () => {
          ctx.drawImage(frame, 0, 0, ctx.canvas.width, ctx.canvas.height);
          resolve();
        };
        frame.onerror = () => {
          console.error("Failed to draw frame PNG");
          resolve();
        };
      });
    }
  }
}
