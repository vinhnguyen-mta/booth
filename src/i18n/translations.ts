export const translations = {
  en: {
    // Navigation
    back: "Back",
    next: "Next",
    continue: "Continue",
    start: "Start",
    finish: "Finish",

    // Landing Page
    welcomeTitle: "PhotoBooth Studio",
    welcomeSubtitle: "Create amazing photo memories",
    startButton: "Start Photo Session",

    // Frame Selection
    chooseFrameTitle: "Choose Your Frame",
    chooseFrameSubtitle: "Select a frame style for your photos",

    // Quantity Selection
    chooseQuantityTitle: "How Many Copies?",
    chooseQuantitySubtitle: "Select the number of copies you want",
    photoCount: "Number of Photos",
    photoCountSubtitle: "How many photos to take",
    quantity: "Quantity",
    totalPrice: "Total Price",

    // Camera
    cameraTitle: "Take Your Photos",
    cameraSubtitle: "Position yourself and smile!",
    captureButton: "Capture",
    switchCamera: "Switch Camera",
    uploadInstead: "Upload Photos Instead",
    photosTaken: "Photos taken",

    // Filters
    filtersTitle: "Apply Filters & Effects",
    filtersSubtitle: "Choose your favorite style",
    filters: "Filters",

    // Preview
    previewTitle: "Preview Your Photos",
    previewSubtitle: "Review and make final adjustments",

    // Payment
    paymentTitle: "Payment",
    paymentSubtitle: "Choose your payment method",
    paymentAmount: "Amount to Pay",
    paymentCash: "Pay with Cash",
    paymentQR: "Pay with QR Code",
    voucherCode: "Voucher Code",
    applyVoucher: "Apply",
    insertMoney: "Please insert money",
    moneyInserted: "Money Inserted",
    scanQRToPay: "Scan QR Code to Pay",

    // Final
    finalTitle: "Your Photos Are Ready!",
    finalSubtitle: "Download or share your photos",
    downloadPhotos: "Download Photos",
    sharePhotos: "Share Photos",
    printPhotos: "Print Photos",
    newSession: "Start New Session",

    // Common
    loading: "Loading...",
    error: "Error occurred",
    success: "Success!",
    currency: "₫",
  },
  vi: {
    // Navigation
    back: "Quay lại",
    next: "Tiếp theo",
    continue: "Tiếp tục",
    start: "Bắt đầu",
    finish: "Hoàn thành",

    // Landing Page
    welcomeTitle: "PhotoBooth Studio",
    welcomeSubtitle: "Tạo kỷ niệm ảnh tuyệt vời",
    startButton: "Bắt đầu chụp ảnh",

    // Frame Selection
    chooseFrameTitle: "Chọn khung ảnh",
    chooseFrameSubtitle: "Chọn kiểu khung cho ảnh của bạn",

    // Quantity Selection
    chooseQuantityTitle: "Chọn số lượng",
    chooseQuantitySubtitle: "Chọn số lượng bản in bạn muốn",
    photoCount: "Số lượng ảnh",
    photoCountSubtitle: "Số ảnh cần chụp",
    quantity: "Số lượng",
    totalPrice: "Tổng tiền",

    // Camera
    cameraTitle: "Chụp ảnh của bạn",
    cameraSubtitle: "Tạo dáng và cười tươi nhé!",
    captureButton: "Chụp ảnh",
    switchCamera: "Đổi camera",
    uploadInstead: "Tải ảnh lên thay thế",
    photosTaken: "Ảnh đã chụp",

    // Filters
    filtersTitle: "Áp dụng bộ lọc & hiệu ứng",
    filtersSubtitle: "Chọn phong cách yêu thích",
    filters: "Bộ lọc",

    // Preview
    previewTitle: "Xem trước ảnh",
    previewSubtitle: "Kiểm tra và điều chỉnh cuối cùng",

    // Payment
    paymentTitle: "Thanh toán",
    paymentSubtitle: "Chọn phương thức thanh toán",
    paymentAmount: "Số tiền cần thanh toán",
    paymentCash: "Thanh toán tiền mặt",
    paymentQR: "Thanh toán QR Code",
    voucherCode: "Mã giảm giá",
    applyVoucher: "Áp dụng",
    insertMoney: "Vui lòng cho tiền vào",
    moneyInserted: "Tiền đã nhận",
    scanQRToPay: "Quét mã QR để thanh toán",

    // Final
    finalTitle: "Ảnh của bạn đã sẵn sàng!",
    finalSubtitle: "Tải về hoặc chia sẻ ảnh của bạn",
    downloadPhotos: "Tải xuống ảnh",
    sharePhotos: "Chia sẻ ảnh",
    printPhotos: "In ảnh",
    newSession: "Bắt đầu phiên mới",

    // Common
    loading: "Đang tải...",
    error: "Có lỗi xảy ra",
    success: "Thành công!",
    currency: "₫",
  },
};

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  return translations[language];
};
