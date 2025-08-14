# PhotoBooth Studio 📸

A modern, responsive PhotoBooth web application built with React, TypeScript, and Vite. Create professional photo memories with beautiful frames, effects, skin smoothing, video generation, and seamless payment integration.

## ✨ Features

- **Multi-step Wizard Flow**: Guided experience from frame selection to final download
- **Real Camera Integration**: Live camera capture with getUserMedia API
- **Video Recording**: 6-second video recording with each photo capture
- **Professional Frames**: 6 unique frame templates (single, strip, grid layouts)
- **Advanced Image Processing**: Canvas-based composition with WebGL skin smoothing
- **Skin Smoothing**: Real-time skin smoothing with face detection and detail preservation
- **Video Generation**: Create short videos from photo sequences with transitions
- **QR Code Sharing**: Generate QR codes for easy video download on mobile devices
- **Payment Simulation**: Mock cash and QR payment system
- **Internationalization**: Full Vietnamese and English support
- **No-Scroll Design**: Optimized for PC screens 24-27" (1920×1080, 2560×1440) without page scrolling
- **Fullscreen Mode**: Kiosk-friendly fullscreen mode with browser tab prevention
- **Accessibility**: ARIA labels, keyboard navigation, and focus management
- **Session Persistence**: Local storage for resuming interrupted sessions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation & Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd photobooth-app
   npm install
   npm run server:install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```
   This runs both frontend (Vite) and backend (Express) concurrently:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── FullscreenButton.tsx # Fullscreen toggle
│   ├── LanguageToggle.tsx
│   ├── SkinSmoothingControl.tsx # Skin smoothing UI
│   ├── VideoPreview.tsx # Video player with controls
│   ├── NumericKeypad.tsx
│   └── QRModal.tsx
├── pages/              # Route components
│   ├── Landing.tsx     # Welcome screen
│   ├── ChooseFrame.tsx # Frame selection
│   ├── ChooseQuantity.tsx
│   ├── Capture.tsx     # Camera interface
│   ├── Filters.tsx     # Image editing
│   ├── Preview.tsx     # Final review
│   ├── Payment.tsx     # Payment methods
│   └── Finish.tsx      # Success & download
├── store/              # State management
│   └── useAppStore.ts  # Zustand store
├── services/           # API services
│   └── api.ts          # Mock API functions
├── utils/              # Utility functions
│   ├── skinSmoothing.ts # WebGL skin smoothing
│   ├── videoGenerator.ts # Video creation
│   ├── qrGenerator.ts  # QR code generation
│   └── fullscreen.ts   # Fullscreen management
├── i18n/               # Internationalization
│   └── translations.ts # Language files
└── types/              # TypeScript definitions
    └── index.ts
```

### Backend API
```
server/
├── index.js            # Express server
├── uploads/            # File storage
└── package.json
```

### Data Files
```
public/data/
├── frames.json         # Frame definitions
├── filters.json        # Filter configurations
├── payment_methods.json # Payment options
└── vouchers.json       # Discount codes
```

## 🎨 Design System

### Colors
- **Primary**: #F34B52 (Red/Pink)
- **Secondary**: #14B8A6 (Teal)
- **Accent**: #F97316 (Orange)
- **Dark**: #05106f (Navy Blue)

### Typography
- **Font**: Poppins (Google Fonts)
- **Weights**: 300-900
- **Line Heights**: 150% body, 120% headings

### Components
- **Buttons**: Rounded pills with hover effects
- **Cards**: Rounded corners with subtle shadows
- **Spacing**: 8px base system
- **Animations**: Framer Motion for smooth transitions

## 📱 User Flow

1. **Landing**: Welcome screen with brand introduction
2. **Choose Frame**: Select from 6 professional frame templates
3. **Choose Quantity**: Set number of copies (1-10)
4. **Capture**: Camera interface or file upload fallback
5. **Filters**: Apply effects, skin smoothing, and position images in frames
6. **Preview**: Review final composition
7. **Print**: High-quality export options (removed quality selection step)
8. **Payment**: Cash insertion or QR code payment
9. **Finish**: Download, share, print with QR codes for mobile access

## 🔧 Configuration

### Frame Templates
Edit `src/data/frames.ts` to add new frame layouts:

```typescript
{
  id: 'custom-frame',
  name: 'Custom Frame',
  price: 95000,
  layout: 'single',
  panels: 1,
  svg: `<svg>...</svg>`,
  thumbnail: '/frames/custom-thumb.svg'
}
```

### Skin Smoothing Configuration
Edit skin smoothing parameters in `src/utils/skinSmoothing.ts`:

```typescript
// Default smoothing options
const defaultOptions = {
  amount: 40,        // 0-100 smoothing intensity
  preserveDetails: true,  // Keep eyes/lips sharp
  faceDetection: true     // Use face detection
};
```

### Video Generation Settings
Configure video output in `src/utils/videoGenerator.ts`:

```typescript
const defaultOptions = {
  duration: 6,      // Video length in seconds
  fps: 30,          // Frames per second
  width: 1920,      // Output width
  height: 1080,     // Output height
  format: 'webm',   // 'webm' or 'mp4'
  quality: 0.9      // 0-1 quality
};
```

### No-Scroll Layout Configuration
The application uses CSS custom properties for responsive scaling:

```css
/* Adjust for different screen sizes */
@media screen and (min-width: 1920px) {
  html { font-size: clamp(14px, 1.2vw, 18px); }
}

@media screen and (min-width: 2560px) {
  html { font-size: clamp(16px, 1.1vw, 20px); }
}
```

### Payment Integration
The current implementation includes mock payment providers. To integrate real payments:

1. Update `/api/payment/create` endpoint in `server/index.js`
2. Replace QR generation with actual payment gateway URLs
3. Implement webhook handlers for payment status updates

### Voucher System
Add voucher codes in `server/index.js`:

```javascript
const vouchers = new Map([
  ['NEWCODE', { valid: true, discountAmount: 25000, message: 'Special discount!' }]
]);
```

## 🌍 Internationalization

Add new languages by extending `src/i18n/translations.ts`:

```typescript
export const translations = {
  en: { /* English */ },
  vi: { /* Vietnamese */ },
  ja: { /* Japanese */ }
};
```

Update the language toggle component to include new options.

## 📊 API Endpoints

### Payment
- `POST /api/payment/create` - Create payment session
- `GET /api/payment/status/:id` - Check payment status

### Vouchers
- `POST /api/voucher/validate` - Validate discount code

### File Upload
- `POST /api/upload` - Upload file (multipart)
- `POST /api/upload/base64` - Upload base64 image

### QR Generation
- `POST /api/qr/generate` - Generate QR codes

## 🧪 Testing

### No-Scroll Layout Testing
Test on target screen sizes:
- 1920×1080 (24" monitors)
- 2560×1440 (27" 2K monitors)
- Ensure no page scrollbars appear
- All content fits within viewport height

### Skin Smoothing Testing
- Test with various face angles and lighting
- Verify eyes/lips remain sharp
- Check performance on different devices

### Video Generation Testing
- Test with 1-9 images
- Verify smooth transitions
- Check output quality and file size

### Fullscreen Mode Testing
- Enter/exit fullscreen works correctly
- ESC key exits fullscreen
- Browser tabs become inaccessible

### Unit Tests
```bash
npm run test
```

### E2E Testing (Planned)
- Cypress setup for full user flow testing
- Camera permission handling
- Payment flow validation

## ♿ Accessibility

- **ARIA Labels**: All interactive elements labeled
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical tab order
- **Screen Readers**: Semantic HTML structure
- **Color Contrast**: WCAG 2.1 AA compliance

## 🔧 Environment Variables

Create `.env` file for configuration:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_ENABLE_CAMERA=true
VITE_ENABLE_SKIN_SMOOTHING=true
VITE_ENABLE_VIDEO_GENERATION=true
VITE_MAX_PHOTOS_PER_SESSION=20
VITE_DEFAULT_SMOOTHING_AMOUNT=40
```

Server configuration:
```env
PORT=4000
QR_SECRET=your-qr-secret
STORAGE_PATH=./uploads
```

## 📈 Performance

- **Bundle Size**: Optimized with Vite
- **Image Processing**: WebGL-accelerated skin smoothing
- **Video Generation**: MediaRecorder API with optimized encoding
- **State Management**: Zustand for minimal overhead
- **Lazy Loading**: Route-based code splitting
- **Caching**: Local storage for session persistence
- **No-Scroll Design**: Eliminates layout shifts and improves UX

## 🐛 Troubleshooting

### Camera Access Issues
1. Ensure HTTPS in production
2. Check browser permissions
3. Fallback to file upload implemented

### Payment Flow
1. Check server connectivity
2. Verify API endpoints
3. Mock data available for testing

### Build Issues
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Update dependencies: `npm update`
3. Check TypeScript errors: `npm run lint`

### Skin Smoothing Issues
1. Check WebGL support: `navigator.gpu` or WebGL context
2. Fallback to canvas-based smoothing if WebGL fails
3. Adjust smoothing amount for different face types

### Video Generation Issues
1. Check MediaRecorder API support
2. Verify codec support (VP9/H.264)
3. Reduce video quality if performance issues occur

### Fullscreen Issues
1. Ensure HTTPS for fullscreen API
2. Check browser permissions
3. Test ESC key functionality

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd server
npm install
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🔮 Roadmap

- [ ] Real payment gateway integration
- [ ] Advanced face detection with MediaPipe
- [ ] Real-time video effects and filters
- [ ] AI-powered photo enhancement
- [ ] Cloud storage for images
- [ ] Social media sharing
- [ ] Multi-language expansion
- [ ] Analytics dashboard
- [ ] Print queue management
- [ ] Customer feedback system
- [ ] Voice commands for accessibility
- [ ] Gesture controls for touchless operation

---

**PhotoBooth Studio** - Creating memories with professional quality and modern technology! 📸✨

## 📋 Files Modified

### New Files Created:
- `src/utils/skinSmoothing.ts` - WebGL-based skin smoothing processor
- `src/utils/videoGenerator.ts` - Video generation from image sequences
- `src/utils/qrGenerator.ts` - QR code generation for sharing
- `src/utils/fullscreen.ts` - Fullscreen mode management
- `src/components/SkinSmoothingControl.tsx` - Skin smoothing UI controls
- `src/components/VideoPreview.tsx` - Video player with custom controls
- `src/components/FullscreenButton.tsx` - Fullscreen toggle button

### Modified Files:
- `src/index.css` - Added no-scroll layout, responsive scaling, custom controls
- `src/components/Layout.tsx` - Added fullscreen button and no-scroll container
- `src/pages/Filters.tsx` - Integrated skin smoothing and fill mode toggle
- `src/pages/Preview.tsx` - Added video generation and enhanced preview
- `README.md` - Updated documentation with new features and configuration

### Key Features Implemented:
✅ No-scroll layout for PC screens 24-27"  
✅ WebGL-based skin smoothing with face detection  
✅ Video generation from photo sequences  
✅ QR code generation for mobile sharing  
✅ Fullscreen mode with browser tab prevention  
✅ High-quality image export (removed quality selection)  
✅ Fill/contain mode toggle for images  
✅ Responsive scaling for different screen sizes  
✅ Enhanced video preview with custom controls  
✅ Safe area guides for proper framing