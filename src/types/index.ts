// UPDATE: Frame interface moved to services/api.ts
// Import from there instead

export interface AppState {
  currentStep: number;
  selectedFrame: any | null; // UPDATE: Will be Frame from API service
  quantity: number;
  capturedImages: string[];
  capturedVideos: string[]; // UPDATE: Add video support
  selectedFilter: string | null;
  finalImage: string | null;
  paymentMethod: "cash" | "qr" | null;
  paymentStatus: "pending" | "processing" | "success" | "failed";
  language: "en" | "vi";
  totalPrice: number;
  icons: string;
  selectedImg: any | null;
  frames: any;
  session_token: any;
}

// UPDATE: Payment interfaces moved to services/api.ts
