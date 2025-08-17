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
    const { selectedFrame, selectedFilter, setFinalImage } = useAppStore();

    useEffect(() => {
        if (selectedFrame && selectedImages.length > 0) {
            renderCanvas();
        }
    }, [selectedImages, selectedFilter, fillMode, selectedFrame]);

    const renderCanvas = async () => {
        if (!canvasRef.current || !selectedFrame) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // setup size
        canvas.width = 800;
        canvas.height = selectedFrame.layout === "strip-4" ? 1200 : 800;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // apply filter
        ctx.filter =
            selectedFilter && selectedFilter !== "original"
                ? filters[selectedFilter] || "none"
                : "none";

        await drawImagesWithLayout(ctx, selectedImages, selectedFrame.layout, fillMode);

        // reset filter for frame
        ctx.filter = "none";

        await drawFrameOverlay(ctx, selectedFrame.svg);

        // callback + store
        if (onImageProcessed) onImageProcessed(canvas);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setFinalImage(dataUrl);
    };

    return (
        <canvas
            ref={canvasRef}
            className={`w-[400px] border rounded shadow ${selectedFrame.layout === "strip-4" ? "h-[600px]" : "h-[400px]"}`}
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

    switch (layout) {
        case "single":
            if (loadedImages[0]) {
                drawImageFit(ctx, loadedImages[0], 50, 50, 700, 700, fillMode);
            }
            break;
        case "strip-4":
            loadedImages.slice(0, 4).forEach((img, index) => {
                const y = 50 + index * 275;
                drawImageFit(ctx, img, 100, y, 600, 250, fillMode);
            });
            break;
        case "grid-2x2":
            loadedImages.slice(0, 4).forEach((img, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const x = 50 + col * 350;
                const y = 50 + row * 350;
                drawImageFit(ctx, img, x, y, 300, 300, fillMode);
            });
            break;
        case "grid-3x3":
            loadedImages.slice(0, 9).forEach((img, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const x = 50 + col * 233;
                const y = 50 + row * 233;
                drawImageFit(ctx, img, x, y, 200, 200, fillMode);
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
    fillMode: boolean
) {
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = width / height;

    let drawWidth, drawHeight, drawX, drawY;

    if (fillMode) {
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
