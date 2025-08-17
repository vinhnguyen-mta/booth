// Video Generation Utility
// Creates short videos from images with transitions and effects

export interface VideoGenerationOptions {
  duration: number; // seconds
  fps: number;
  width: number;
  height: number;
  format: "webm" | "mp4";
  quality: number; // 0-1
}

export interface VideoFrame {
  image: HTMLCanvasElement | HTMLImageElement;
  duration: number; // seconds
  transition?: "fade" | "slide" | "zoom" | "none";
}

export class VideoGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
  }

  async generateVideo(
    frames: VideoFrame[],
    options: VideoGenerationOptions = {
      duration: 6,
      fps: 30,
      width: 1920,
      height: 1080,
      format: "webm",
      quality: 0.9,
    },
  ): Promise<Blob> {
    this.canvas.width = options.width;
    this.canvas.height = options.height;

    // Setup MediaRecorder for canvas stream
    const stream = this.canvas.captureStream(options.fps);

    const mimeType =
      options.format === "webm"
        ? "video/webm;codecs=vp9"
        : "video/mp4;codecs=h264";

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond:
        options.width * options.height * options.fps * options.quality,
    });

    this.recordedChunks = [];

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"));
        return;
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error("MediaRecorder error"));
      };

      // Start recording
      this.mediaRecorder.start();

      // Render frames
      this.renderFrames(frames, options)
        .then(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
            this.mediaRecorder.stop();
          }
        })
        .catch(reject);
    });
  }

  private async renderFrames(
    frames: VideoFrame[],
    options: VideoGenerationOptions,
  ): Promise<void> {
    const frameInterval = 1000 / options.fps; // ms per frame
    let currentTime = 0;
    const totalDuration = options.duration * 1000; // convert to ms

    while (currentTime < totalDuration) {
      const progress = currentTime / totalDuration;
      await this.renderFrame(frames, progress, options);

      // Wait for next frame
      await new Promise((resolve) => setTimeout(resolve, frameInterval));
      currentTime += frameInterval;
    }
  }

  private async renderFrame(
    frames: VideoFrame[],
    progress: number,
    options: VideoGenerationOptions,
  ): Promise<void> {
    // Clear canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, options.width, options.height);

    // Calculate which frame(s) to show based on progress
    const totalFrameDuration = frames.reduce(
      (sum, frame) => sum + frame.duration,
      0,
    );
    let currentFrameTime = 0;
    let activeFrameIndex = 0;
    let frameProgress = 0;

    for (let i = 0; i < frames.length; i++) {
      const frameEndTime = currentFrameTime + frames[i].duration;
      if (progress * totalFrameDuration <= frameEndTime) {
        activeFrameIndex = i;
        frameProgress =
          (progress * totalFrameDuration - currentFrameTime) /
          frames[i].duration;
        break;
      }
      currentFrameTime = frameEndTime;
    }

    const currentFrame = frames[activeFrameIndex];
    const nextFrame = frames[activeFrameIndex + 1];

    // Apply transition effects
    if (nextFrame && frameProgress > 0.8) {
      const transitionProgress = (frameProgress - 0.8) / 0.2; // Last 20% of frame
      this.applyTransition(
        currentFrame,
        nextFrame,
        transitionProgress,
        options,
      );
    } else {
      this.drawFrame(currentFrame.image, options);
    }
  }

  private applyTransition(
    currentFrame: VideoFrame,
    nextFrame: VideoFrame,
    progress: number,
    options: VideoGenerationOptions,
  ): void {
    switch (currentFrame.transition || "fade") {
      case "fade":
        this.ctx.globalAlpha = 1 - progress;
        this.drawFrame(currentFrame.image, options);
        this.ctx.globalAlpha = progress;
        this.drawFrame(nextFrame.image, options);
        this.ctx.globalAlpha = 1;
        break;

      case "slide":
        const slideOffset = progress * options.width;
        this.ctx.save();
        this.ctx.translate(-slideOffset, 0);
        this.drawFrame(currentFrame.image, options);
        this.ctx.translate(options.width, 0);
        this.drawFrame(nextFrame.image, options);
        this.ctx.restore();
        break;

      case "zoom":
        const scale = 1 + progress * 0.2;
        this.ctx.save();
        this.ctx.translate(options.width / 2, options.height / 2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-options.width / 2, -options.height / 2);
        this.ctx.globalAlpha = 1 - progress;
        this.drawFrame(currentFrame.image, options);
        this.ctx.restore();

        this.ctx.globalAlpha = progress;
        this.drawFrame(nextFrame.image, options);
        this.ctx.globalAlpha = 1;
        break;

      default:
        this.drawFrame(currentFrame.image, options);
    }
  }

  private drawFrame(
    image: HTMLCanvasElement | HTMLImageElement,
    options: VideoGenerationOptions,
  ): void {
    // Calculate aspect ratio and fit image
    const imageWidth = image.width || (image as HTMLCanvasElement).width;
    const imageHeight = image.height || (image as HTMLCanvasElement).height;

    const scaleX = options.width / imageWidth;
    const scaleY = options.height / imageHeight;
    const scale = Math.min(scaleX, scaleY); // contain mode

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const x = (options.width - scaledWidth) / 2;
    const y = (options.height - scaledHeight) / 2;

    this.ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }

  // Create video from single image with effects
  async createSlideshow(
    images: (HTMLCanvasElement | HTMLImageElement)[],
    options: Partial<VideoGenerationOptions> = {},
  ): Promise<Blob> {
    const defaultOptions: VideoGenerationOptions = {
      duration: Math.max(6, images.length * 1.5),
      fps: 30,
      width: 1920,
      height: 1080,
      format: "webm",
      quality: 0.9,
      ...options,
    };

    const frameDuration = defaultOptions.duration / images.length;
    const frames: VideoFrame[] = images.map((image, index) => ({
      image,
      duration: frameDuration,
      transition: index < images.length - 1 ? "fade" : "none",
    }));

    return this.generateVideo(frames, defaultOptions);
  }
}

// Export singleton instance
export const videoGenerator = new VideoGenerator();
