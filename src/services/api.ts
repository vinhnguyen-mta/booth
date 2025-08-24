// PhotoBooth API Service
// Mock API functions that will be replaced with real API calls later

export interface AppConfig {
  defaultPhotoCount: number;
  maxPhotoCount: number;
  minPhotoCount: number;
  maxQuantity: number;
  minQuantity: number;
}

export interface Frame {
  image: string;
  id: string;
  name: string;
  name_vi: string;
  price: number;
  layout: string;
  panels: number;
  aspect_ratio: string;
  svg: string;
  thumbnail: string;
  description: string;
  description_vi: string;
}

export interface Filter {
  id: string;
  name: string;
  name_vi: string;
  type: string;
  css_filter: string;
  preview_filter: string;
  description: string;
  description_vi: string;
  icon: string;
}

export interface Icons {
  file_path: string;
  id: string;
  name: string;
  type: string;
  uuid: string;
}

export interface PaymentCompany {
  id: string;
  name: string;
  name_vi: string;
  type: string;
  icon: string;
  color: string;
  description: string;
  description_vi: string;
  enabled: boolean;
  processing_time: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  name_vi: string;
  type: string;
  icon: string;
  color: string;
  description: string;
  description_vi: string;
  enabled: boolean;
  processing_time: string;
}

export interface Voucher {
  code: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  min_amount: number;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  description: string;
  description_vi: string;
  active: boolean;
}

export interface PaymentResponse {
  paymentId: string;
  qrDataUrl?: string;
  expiresAt: string;
  status: "pending" | "processing" | "success" | "failed";
}

export interface PaymentStatus {
  status: "pending" | "processing" | "success" | "failed";
  receivedAmount: number;
  amount: number;
  currency: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export interface VoucherValidation {
  valid: boolean;
  discountAmount: number;
  message: string;
  type?: "fixed" | "percentage";
}

// TODO: Replace with real API call
export async function getAppConfig(): Promise<AppConfig> {
  // Mock config - in real app, this would come from API
  return {
    defaultPhotoCount: 8,
    maxPhotoCount: 10,
    minPhotoCount: 1,
    maxQuantity: 10,
    minQuantity: 1,
  };
}

const token = "429b4811";

export async function login(code: string): Promise<any[]> {
  try {
    const response = await fetch(import.meta.env.VITE_API_LOGIN + "password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: code,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading filters:", error);
    return [];
  }
}

// TODO: Replace with real API call
export async function getFrames(): Promise<Frame[]> {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "layouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
      }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading frames:", error);
    return [];
  }
}

export async function getIcons(): Promise<Icons[]> {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "icons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
      }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading frames:", error);
    return [];
  }
}

// TODO: Replace with real API call
export async function getFilters(): Promise<Filter[]> {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "filter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
      }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading filters:", error);
    return [];
  }
}

export async function print(img): Promise<any[]> {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL_PRINT + "print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_base64: img,
        print_size: "6x4",
        copies: 1,
        token: token,
      }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading filters:", error);
    return [];
  }
}

export async function printFilters(img): Promise<any[]> {
  try {
    const response = await fetch(
      import.meta.env.VITE_API_URL_PRINT + "filters",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_path: img,
          print_size: "6x4",
          cut_2inch: true,
          copies: 1,
          token: token,
        }),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading filters:", error);
    return [];
  }
}

export async function getFiltersFrame(layout_code: any): Promise<Filter[]> {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "frames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        layout_code,
        token: token,
      }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading filters:", error);
    return [];
  }
}

// TODO: Replace with real API call
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const response = await fetch("/data/payment_methods.json");
    const data = await response.json();
    return data.payment_methods.filter((method) => method.enabled);
  } catch (error) {
    console.error("Error loading payment methods:", error);
    return [];
  }
}

export async function getPaymentCompany(): Promise<PaymentCompany[]> {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
      }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading payment methods:", error);
    return [];
  }
}

// TODO: Replace with real API call
export async function createPayment(
  amount: number,
  currency: string = "VND"
): Promise<PaymentResponse> {
  // Mock payment creation
  const paymentId = `pay_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  // Mock QR code generation
  let qrDataUrl = "";
  try {
    const QRCode = await import("qrcode");
    const paymentUrl = `https://payment.example.com/pay/${paymentId}?amount=${amount}&currency=${currency}`;
    qrDataUrl = await QRCode.default.toDataURL(paymentUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: "#F34B52",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
  }

  return {
    paymentId,
    qrDataUrl,
    expiresAt,
    status: "pending",
  };
}

// TODO: Replace with real API call
export async function checkPaymentStatus(
  paymentId: string
): Promise<PaymentStatus> {
  // Mock payment status check
  // In real implementation, this would check with payment gateway

  // Simulate random payment completion after some time
  const isCompleted = Math.random() > 0.3; // 70% chance of completion

  return {
    status: isCompleted ? "success" : "pending",
    receivedAmount: isCompleted ? 100000 : 0,
    amount: 100000,
    currency: "VND",
  };
}

// TODO: Replace with real API call
export async function uploadPhoto(file: File): Promise<UploadResponse> {
  // Mock photo upload
  // In real implementation, this would upload to cloud storage

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        filename: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
}

// TODO: Replace with real API call
export async function uploadVideo(
  blob: Blob,
  filename: string = "video.webm"
): Promise<UploadResponse> {
  // Mock video upload
  // In real implementation, this would upload to cloud storage

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        filename,
        size: blob.size,
      });
    };
    reader.readAsDataURL(blob);
  });
}

// TODO: Replace with real API call
export async function validateVoucher(
  code: string
): Promise<VoucherValidation> {
  try {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "voucher/checkin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          token: token,
        }),
      }
    );
    const dataJson = await response.json();
    const data = dataJson?.data;
    console.log("data", data);
    if (data) {
      // Check if voucher is still valid
      const now = new Date();
      const validFrom = new Date(data.start_date);
      const validUntil = new Date(data.end_date);

      if (now >= validFrom && now <= validUntil && data.status === "active") {
        return {
          valid: true,
          discountAmount: data.value,
          message: data.description,
          type: data.discount_type,
        };
      }
    }

    return {
      valid: false,
      discountAmount: 0,
      message: "Invalid or expired voucher code",
    };
  } catch (error) {
    console.error("Error validating voucher:", error);
    return {
      valid: false,
      discountAmount: 0,
      message: "Error validating voucher",
    };
  }
}

// Utility function to format price
export function formatPrice(price: number, currency: string = "VND"): string {
  return new Intl.NumberFormat("vi-VN").format(price);
}

// Utility function to calculate discount
export function calculateDiscount(
  originalAmount: number,
  voucher: { discount_type: string; discount_value: number }
): number {
  if (voucher.discount_type === "percentage") {
    return Math.round(originalAmount * (voucher.discount_value / 100));
  } else {
    return voucher.discount_value;
  }
}
