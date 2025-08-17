import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAppStore } from "../store/useAppStore";
import styles from "./Capture.module.css";
import { Camera, RefreshCw, Pause, ArrowRight } from "lucide-react";

export const Capture: React.FC = () => {
  const navigate = useNavigate();

  const {
    language,
    selectedFrame,
    capturedImages: storeCapturedImages = [],
    addCapturedImage,
    addCapturedVideo,
    clearCapturedImages,
    clearCapturedVideos,
    setCurrentStep,
  } = useAppStore();

  const t = {
    title: language === "vi" ? "Chụp ảnh" : "Capture",
    hint: language === "vi" ? "Vui lòng tạo dáng" : "Please pose",
  };

  const [requiredPhotos] = useState<number>(8);
  const [isContinuous, setIsContinuous] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cycleCountdown, setCycleCountdown] = useState<number>(0);
  const [capturing, setCapturing] = useState(false);
  const [smoothFilter, setSmoothFilter] = useState<boolean>(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [capturedVideos, setCapturedVideos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const [capturedImages, setCapturedImages] =
    useState<string[]>(storeCapturedImages);
  const [gifs, setGifs] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cycleIntervalRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const smallCountdownRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // sync with store
  useEffect(() => {
    setCapturedImages(storeCapturedImages || []);
  }, [storeCapturedImages]);

  // Start camera
  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // try to play; some browsers require user gesture but we attempt
          try {
            await videoRef.current.play();
          } catch {}
        }
      } catch (err) {
        console.error("Camera start error", err);
      }
    };
    start();

    // prevent page scroll while on capture
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      mounted = false;
      document.documentElement.style.overflow = prevOverflow || "";
      stopStream();
      stopContinuous();
      // clear any pending timeouts
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  // Setup MediaRecorder for video recording
  const setupMediaRecorder = useCallback(() => {
    if (!streamRef.current) return null;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9", // Try VP9 first
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const videoUrl = URL.createObjectURL(blob);

        setCapturedVideos((prev) => [...prev, videoUrl]);
        recordedChunksRef.current = [];
      };

      return mediaRecorder;
    } catch (error) {
      // Fallback to VP8 if VP9 not supported
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current, {
          mimeType: "video/webm;codecs=vp8",
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
          const videoUrl = URL.createObjectURL(blob);

          setCapturedVideos((prev) => [...prev, videoUrl]);
          recordedChunksRef.current = [];
        };

        return mediaRecorder;
      } catch (fallbackError) {
        console.error("MediaRecorder not supported:", fallbackError);
        return null;
      }
    }
  }, []);

  // Start recording video clip
  const startVideoRecording = useCallback(() => {
    if (isRecording) return;

    const mediaRecorder = setupMediaRecorder();
    if (!mediaRecorder) {
      console.warn("Video recording not supported");
      return;
    }

    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    try {
      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 2.5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 2500);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
    }
  }, [isRecording, setupMediaRecorder]);

  // Stop video recording
  const stopVideoRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      // @ts-ignore
      videoRef.current.srcObject = null;
    }
  };

  // ensure video has dimensions before capture
  const ensureVideoReady = useCallback(async (video: HTMLVideoElement) => {
    if (video.videoWidth > 0 && video.videoHeight > 0) return;
    return new Promise<void>((resolve) => {
      const onMeta = () => {
        video.removeEventListener("loadedmetadata", onMeta);
        resolve();
      };
      video.addEventListener("loadedmetadata", onMeta);
      // fallback
      setTimeout(() => {
        try {
          video.removeEventListener("loadedmetadata", onMeta);
        } catch {}
        resolve();
      }, 500);
    });
  }, []);

  // Improved captureShot with video recording
  const captureShot = useCallback(async () => {
    // Prevent multiple captures at the same time
    if (isCapturingPhoto) return null;

    const video = videoRef.current;
    if (!video) return null;

    // Check if we've already reached the limit
    if (capturedImages.length >= requiredPhotos) return null;

    setIsCapturingPhoto(true);

    // Start video recording before taking photo
    startVideoRecording();

    try {
      await ensureVideoReady(video);

      const canvas = canvasRef.current || document.createElement("canvas");
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // apply smoothing filter on canvas capture if enabled
      try {
        ctx.filter = smoothFilter
          ? "blur(0.6px) saturate(1.05) contrast(1.02)"
          : "none";
        ctx.drawImage(video, 0, 0, w, h);
        ctx.filter = "none";
      } catch (err) {
        console.error("drawImage failed", err);
        return null;
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      // Update local state first
      setCapturedImages((prev) => {
        if (prev.length >= requiredPhotos) return prev;
        const next = [...prev, dataUrl];
        return next;
      });

      // Then update store
      try {
        addCapturedImage && addCapturedImage(dataUrl);
      } catch (err) {
        console.error("Failed to add image to store:", err);
      }

      return dataUrl;
    } catch (err) {
      console.error("Capture shot failed:", err);
      return null;
    } finally {
      // Reset capture flag after a short delay to prevent rapid successive captures
      setTimeout(() => {
        setIsCapturingPhoto(false);
      }, 200);
    }
  }, [
    addCapturedImage,
    ensureVideoReady,
    requiredPhotos,
    smoothFilter,
    capturedImages.length,
    isCapturingPhoto,
    startVideoRecording,
  ]);

  const handleSingleCapture = async () => {
    if (capturedImages.length >= requiredPhotos || isCapturingPhoto) return;
    await captureShot();
  };

  // runCycle: show 3..2..1 overlay then capture exactly 1 photo, wait 0.5s before allowing next cycle
  const runCycle = useCallback(() => {
    // Don't start new cycle if already capturing or reached limit
    if (isCapturingPhoto || capturedImages.length >= requiredPhotos) return;

    // clear pending timeouts for this cycle
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    setCycleCountdown(3);
    timeoutsRef.current.push(
      window.setTimeout(() => setCycleCountdown(2), 1000),
    );
    timeoutsRef.current.push(
      window.setTimeout(() => setCycleCountdown(1), 2000),
    );
    timeoutsRef.current.push(
      window.setTimeout(async () => {
        setCycleCountdown(0);

        // capture one photo (up to limit) - await to ensure completion
        await captureShot();

        // small 0.7s pause
        timeoutsRef.current.push(
          window.setTimeout(() => setCycleCountdown(0), 700),
        );
      }, 3000),
    );
  }, [captureShot, isCapturingPhoto, capturedImages.length, requiredPhotos]);

  const startContinuous = () => {
    if (capturing || capturedImages.length >= requiredPhotos) return;
    setIsContinuous(true);
    setCapturing(true);

    runCycle(); // first immediate cycle

    // repeat every 3700ms (3s countdown + 0.7s pause)
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    cycleIntervalRef.current = window.setInterval(() => {
      // stop if reached max (check current state)
      setCapturedImages((current) => {
        if (current.length >= requiredPhotos) {
          stopContinuous();
          return current;
        }
        runCycle();
        return current;
      });
    }, 3700);

    // small UI countdown for counter
    setCountdown(3);
    if (smallCountdownRef.current) {
      clearInterval(smallCountdownRef.current);
      smallCountdownRef.current = null;
    }
    smallCountdownRef.current = window.setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 3));
    }, 1000);
  };

  const stopContinuous = () => {
    setIsContinuous(false);
    setCapturing(false);
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    if (smallCountdownRef.current) {
      clearInterval(smallCountdownRef.current);
      smallCountdownRef.current = null;
    }
    // clear pending timeouts
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    setCountdown(0);
    setCycleCountdown(0);
    setIsCapturingPhoto(false); // Reset capture flag
    stopVideoRecording(); // Stop any ongoing recording
  };

  // stop continuous automatically when reaching max
  useEffect(() => {
    if (capturedImages.length >= requiredPhotos && isContinuous) {
      stopContinuous();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImages.length]);

  const handleReset = () => {
    stopContinuous();
    setCapturedImages([]);
    setCapturedVideos([]);
    try {
      clearCapturedImages && clearCapturedImages();
    } catch {}
    try {
      clearCapturedVideos && clearCapturedVideos();
    } catch {}
  };

  const handleNext = () => {
    setCurrentStep(6);
    for (const video of capturedVideos) {
      addCapturedVideo(video);
    }
    navigate("/preview");
  };

  // Convert video to GIF using canvas frames
  const convertVideoToGif = useCallback(async (videoUrl: string) => {
    return new Promise<string>((resolve, reject) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;
      video.crossOrigin = "anonymous";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      video.onloadedmetadata = () => {
        canvas.width = Math.min(video.videoWidth, 400); // Limit size for GIF
        canvas.height = Math.min(video.videoHeight, 300);

        const frames: ImageData[] = [];
        let currentTime = 0;
        const frameRate = 10; // 10 FPS for GIF
        const frameDuration = 1 / frameRate;

        const captureFrame = () => {
          if (currentTime >= video.duration) {
            // Create simple GIF-like data URL (simplified)
            // In real implementation, you'd use a GIF encoding library
            const gifDataUrl = createSimpleGif(
              frames,
              canvas.width,
              canvas.height,
            );
            resolve(gifDataUrl);
            return;
          }

          video.currentTime = currentTime;
        };

        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
          currentTime += frameDuration;
          captureFrame();
        };

        captureFrame();
      };

      video.onerror = () => reject(new Error("Video load failed"));
    });
  }, []);

  // Simplified GIF creation (for demo - in production use proper GIF encoder)
  const createSimpleGif = (
    frames: ImageData[],
    width: number,
    height: number,
  ) => {
    // This is a simplified version - for real GIF creation, use libraries like gif.js
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx && frames.length > 0) {
      // Use middle frame as static representation
      ctx.putImageData(frames[Math.floor(frames.length / 2)], 0, 0);
      return canvas.toDataURL("image/png");
    }

    return "";
  };

  // Download video as WebM or convert to GIF
  const downloadVideo = useCallback(
    async (videoUrl: string, index: number, asGif: boolean = false) => {
      try {
        if (asGif) {
          const gifUrl = await convertVideoToGif(videoUrl);
          const link = document.createElement("a");
          link.href = gifUrl;
          link.download = `capture_${index + 1}.png`; // Simplified as PNG
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const response = await fetch(videoUrl);
          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `capture_${index + 1}.webm`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      } catch (error) {
        console.error("Download failed:", error);
      }
    },
    [convertVideoToGif],
  );

  // ----------------- JSX layout updated: smaller frameArea + gifs sidebar -----------------
  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
        </header>

        <main className={styles.main}>
          <div className={styles.previewWrap} style={{ position: "relative" }}>
            {/* container: frame on left (smaller), gif/video list on the right (scrollable, max 8) */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                width: "100%",
              }}
            >
              {/* Frame area - reduced size */}
              <div
                className={styles.frameArea}
                style={{
                  width: 390, // reduced width
                  height: 300,
                  maxWidth: "65vw",
                  maxHeight: "75vh",
                  position: "relative",
                  boxSizing: "border-box",
                }}
              >
                <video
                  ref={videoRef}
                  className={styles.video}
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {selectedFrame && (
                  <div className={styles.frameOverlay} aria-hidden />
                )}
                {cycleCountdown > 0 && (
                  <div className={styles.overlayCountdown}>
                    <div className={styles.overlayNumber}>{cycleCountdown}</div>
                  </div>
                )}
              </div>

              {/* Right sidebar: GIF / video clips (max 8), scrollable */}
              <aside
                aria-label="gif-list"
                style={{
                  width: 160,
                  maxHeight: 280, // align with frameArea height
                  overflowY: "auto",
                  padding: 8,
                  background: "rgba(255,255,255,0.98)",
                  borderRadius: 8,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {language === "vi" ? "GIF/Video" : "GIFs / Video"}
                </div>

                {capturedVideos.length === 0 && gifs.length === 0 && (
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: 12,
                      textAlign: "center",
                      padding: "12px 4px",
                    }}
                  >
                    {language === "vi" ? "Chưa có clip" : "No clips yet"}
                  </div>
                )}

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {/* show generated gifs first (if any), then small video previews; limit total to 8 */}
                  {gifs.slice(0, 8).map((gif, idx) =>
                    gif ? (
                      <div
                        key={`gif-${idx}`}
                        style={{
                          width: "100%",
                          height: 80,
                          borderRadius: 6,
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <img
                          src={gif}
                          alt={`gif-${idx}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            right: 6,
                            bottom: 6,
                            display: "flex",
                            gap: 6,
                          }}
                        >
                          <button
                            onClick={() =>
                              downloadVideo(
                                capturedVideos[idx] || "",
                                idx,
                                false,
                              )
                            }
                            title="Download WebM"
                            style={{
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              padding: "4px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                              cursor: "pointer",
                            }}
                          >
                            WebM
                          </button>
                          <button
                            onClick={() =>
                              downloadVideo(
                                capturedVideos[idx] || "",
                                idx,
                                true,
                              )
                            }
                            title="Download GIF"
                            style={{
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              padding: "4px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                              cursor: "pointer",
                            }}
                          >
                            GIF
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={`gif-${idx}`}
                        style={{
                          width: "100%",
                          height: 80,
                          borderRadius: 6,
                          background: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#9ca3af",
                        }}
                      >
                        {language === "vi" ? "Đang xử lý..." : "Processing..."}
                      </div>
                    ),
                  )}

                  {/* video thumbnails (fill up to total 8 items including gifs) */}
                  {capturedVideos
                    .slice(0, 8 - gifs.length)
                    .map((videoUrl, idx) => (
                      <div
                        key={`v-${idx}`}
                        style={{
                          width: "100%",
                          height: 80,
                          borderRadius: 6,
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <video
                          src={videoUrl}
                          muted
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
                        <div
                          style={{
                            position: "absolute",
                            right: 6,
                            bottom: 6,
                            display: "flex",
                            gap: 6,
                          }}
                        >
                          <button
                            onClick={() => downloadVideo(videoUrl, idx, false)}
                            title="Download WebM"
                            style={{
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              padding: "4px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                              cursor: "pointer",
                            }}
                          >
                            WebM
                          </button>
                          <button
                            onClick={() => downloadVideo(videoUrl, idx, true)}
                            title="Download GIF"
                            style={{
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              padding: "4px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                              cursor: "pointer",
                            }}
                          >
                            GIF
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </aside>
            </div>

            {/* action row and thumbs stay below frame+sidebar */}
            <div className={styles.actionRow} style={{ marginTop: 12 }}>
              <button
                className={styles.iconBtn}
                onClick={handleReset}
                title={language === "vi" ? "Reset ảnh" : "Reset"}
              >
                <RefreshCw />
              </button>

              <button
                className={styles.captureBtn}
                onClick={handleSingleCapture}
                disabled={
                  isCapturingPhoto || capturedImages.length >= requiredPhotos
                }
                title={language === "vi" ? "Chụp 1 ảnh" : "Capture"}
              >
                <Camera />
              </button>

              <button
                className={`${styles.iconBtn} ${isContinuous ? styles.active : ""}`}
                onClick={() =>
                  isContinuous ? stopContinuous() : startContinuous()
                }
                disabled={capturedImages.length >= requiredPhotos}
                title={
                  language === "vi"
                    ? "Chụp liên tiếp (1 ảnh sau 3s)"
                    : "Continuous (1 shot after 3s)"
                }
                aria-label="continuous-capture"
              >
                {!isContinuous ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 32 32"
                    fill="#fff"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g transform="translate(-108,-196)">
                      <path d="m121.89453,202.00586c-0.92482,0-1.77586,0.52633-2.18945,1.35351l-0.32227,0.64649H117c-1.64501,0-3,1.35499-3,3v10c0,1.64501,1.35499,3,3,3h14c1.64501,0,3-1.35499,3-3v-10c0-1.64501-1.35499-3-3-3h-2.38281l-0.32227-0.64649c-0.41359-0.82718-1.26463-1.35351-2.18945-1.35351z" />
                      <path d="m124,208.00586c-2.19729,0-4,1.80271-4,4 0,2.19729 1.80271,4 4,4 2.19729,0 4-1.80271 4-4 0-2.19729-1.80271-4-4-4z" />
                    </g>
                  </svg>
                ) : (
                  <Pause />
                )}
              </button>

              <div className={styles.counter}>
                {capturedImages.length} / {requiredPhotos}
                {isContinuous && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {countdown > 0 ? countdown : ""}
                  </div>
                )}
              </div>

              <label className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={smoothFilter}
                  onChange={(e) => setSmoothFilter(e.target.checked)}
                />
                <span>{language === "vi" ? "Làm mịn da" : "Smooth skin"}</span>
              </label>
            </div>

            <div
              className={styles.thumbsWrap}
              aria-label="Captured images"
              style={{ marginTop: 12 }}
            >
              <div className={styles.thumbs}>
                {capturedImages.length === 0 && (
                  <div className={styles.emptyHint}>
                    {language === "vi" ? "Chưa có ảnh" : "No photos yet"}
                  </div>
                )}
                {capturedImages.map((src: string, idx: number) => (
                  <div key={idx} className={styles.thumbItem}>
                    <img
                      src={src}
                      alt={`capture-${idx}`}
                      className={styles.thumbImg}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* next arrow pinned to the right edge of the viewport */}
            {capturedImages.length >= requiredPhotos && (
              <button
                className={styles.nextBtn}
                onClick={handleNext}
                title={language === "vi" ? "Tiếp tục" : "Next"}
                style={{
                  position: "fixed",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 90,
                }}
              >
                <ArrowRight size={20} />
              </button>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </main>
      </div>
    </Layout>
  );
};

export default Capture;
