import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppState } from "../types";
import { Frame, Filter } from "../services/api";

interface AppStore extends AppState {
  setCurrentStep: (step: number) => void;
  setSelectedFrame: (frame: Frame | null) => void;
  setQuantity: (quantity: number) => void;
  setPhotoCount: (count: number) => void;
  addCapturedImage: (image: string) => void;
  // UPDATE: Add video support
  addCapturedVideo: (video: string) => void;
  clearCapturedImages: () => void;
  clearCapturedVideos: () => void;
  setSelectedFilter: (filter: string | null) => void;
  setFinalImage: (image: string | null) => void;
  setPaymentMethod: (method: "cash" | "qr" | null) => void;
  setPaymentStatus: (
    status: "pending" | "processing" | "success" | "failed"
  ) => void;
  setLanguage: (language: "en" | "vi") => void;
  calculateTotalPrice: () => void;
  resetSession: () => void;
  // UPDATE: Payment guard for capture access
  canAccessCapture: () => boolean;
  // UPDATE: Video support
  capturedVideos: string[];
  // UPDATE: Fullscreen state management
  isFullscreen: boolean;
  setFullscreen: (isFullscreen: boolean) => void;
  setIcons: (icon: string) => void;
  setFrame: (frame: string | null) => void;
  setSelectedImg: (img: any) => void;
  setSessionToken: (token: string) => void;
}

const initialState: AppState = {
  currentStep: 0,
  selectedFrame: null,
  quantity: 1,
  photoCount: 8, // Mặc định chụp 8 ảnh từ API config
  capturedImages: [],
  capturedVideos: [], // UPDATE: Add video array
  selectedFilter: "original",
  finalImage: null,
  paymentMethod: null,
  paymentStatus: "pending",
  language: "vi",
  totalPrice: 0,
  selectedImg: null,
  frames: [],
  session_token: "",
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      setSelectedFrame: (frame) => {
        set({ selectedFrame: frame });
        get().calculateTotalPrice();
      },

      setQuantity: (quantity) => {
        set({ quantity });
        get().calculateTotalPrice();
      },

      setPhotoCount: (photoCount) => set({ photoCount }),

      addCapturedImage: (image) =>
        set((state) => ({
          capturedImages: [...state.capturedImages, image],
        })),

      // UPDATE: Add video capture support
      addCapturedVideo: (video) =>
        set((state) => ({
          capturedVideos: [...state.capturedVideos, video],
        })),

      clearCapturedImages: () => set({ capturedImages: [] }),

      clearCapturedVideos: () => set({ capturedVideos: [] }),

      setSelectedFilter: (filter) => set({ selectedFilter: filter }),

      setFinalImage: (image) => set({ finalImage: image }),
      setIcons: (icon) => set({ icons: icon }),
      setFrame: (frame) => set({ frames: frame }),
      setSelectedImg: (img) => {
        set({ selectedImg: img });
      },
      setPaymentMethod: (method) => set({ paymentMethod: method }),

      setPaymentStatus: (status) => set({ paymentStatus: status }),

      setLanguage: (language) => set({ language }),

      calculateTotalPrice: () => {
        const { selectedFrame, quantity } = get();
        const totalPrice = selectedFrame ? selectedFrame.price * quantity : 0;
        set({ totalPrice });
      },

      resetSession: () =>
        set((state) => ({
          ...initialState,
          session_token: state.session_token,
        })),

      // UPDATE: Payment guard implementation
      canAccessCapture: () => {
        const { paymentStatus } = get();
        return paymentStatus === "success";
      },

      // UPDATE: Video support
      capturedVideos: [],

      // UPDATE: Fullscreen state
      isFullscreen: false,

      setFullscreen: (isFullscreen) => set({ isFullscreen }),
      setSessionToken: (sessionToken) => set({ session_token: sessionToken }),
    }),
    {
      name: "photobooth-store",
      partialize: (state) => ({
        selectedFrame: state.selectedFrame,
        quantity: state.quantity,
        photoCount: state.photoCount,
        capturedImages: state.capturedImages,
        capturedVideos: state.capturedVideos,
        language: state.language,
        // UPDATE: Persist fullscreen state across navigation
        isFullscreen: state.isFullscreen,
      }),
    }
  )
);
