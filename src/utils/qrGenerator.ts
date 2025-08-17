// QR Code Generation Utility
// Generates QR codes for video download links

import QRCode from "qrcode";

export interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}

export interface QRCodeResult {
  dataUrl: string;
  svg: string;
  canvas: HTMLCanvasElement;
}

export class QRGenerator {
  private defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: "#F34B52",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  };

  async generateQR(
    data: string,
    options: Partial<QRCodeOptions> = {},
  ): Promise<QRCodeResult> {
    const finalOptions = { ...this.defaultOptions, ...options };

    try {
      // Generate data URL
      const dataUrl = await QRCode.toDataURL(data, finalOptions);

      // Generate SVG
      const svg = await QRCode.toString(data, {
        ...finalOptions,
        type: "svg",
      });

      // Generate canvas
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, data, finalOptions);

      return {
        dataUrl,
        svg,
        canvas,
      };
    } catch (error) {
      console.error("QR Code generation failed:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  // Generate QR for video download
  async generateVideoQR(
    videoBlob: Blob,
    filename: string = "photobooth-video.webm",
  ): Promise<{ qr: QRCodeResult; downloadUrl: string }> {
    // Create blob URL for download
    const downloadUrl = URL.createObjectURL(videoBlob);

    // TODO: Replace with real upload API
    // const uploadResponse = await uploadVideo(videoBlob, filename);
    // const permanentUrl = uploadResponse.url;

    // For now, use blob URL (temporary)
    const qr = await this.generateQR(downloadUrl, {
      width: 200,
      margin: 1,
    });

    return { qr, downloadUrl };
  }

  // Generate QR with custom styling
  async generateStyledQR(
    data: string,
    style: {
      logo?: string;
      backgroundColor?: string;
      foregroundColor?: string;
      borderRadius?: number;
    } = {},
  ): Promise<QRCodeResult> {
    const options: Partial<QRCodeOptions> = {
      color: {
        dark: style.foregroundColor || "#F34B52",
        light: style.backgroundColor || "#FFFFFF",
      },
      width: 256,
      margin: 2,
    };

    const result = await this.generateQR(data, options);

    // Add logo if provided
    if (style.logo) {
      const canvas = result.canvas;
      const ctx = canvas.getContext("2d")!;

      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = canvas.width * 0.2;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;

        // Draw white background for logo
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);

        // Draw logo
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      };
      logoImg.src = style.logo;
    }

    return result;
  }

  // Cleanup blob URLs to prevent memory leaks
  static cleanup(url: string): void {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
}

// Export singleton instance
export const qrGenerator = new QRGenerator();
