import express from 'express';
import cors from 'cors';
import multer from 'multer';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Mock payment data storage
const payments = new Map();
const vouchers = new Map([
  ['12345678', { valid: true, discountAmount: 20000, message: 'Welcome discount applied!' }],
  ['SAVE10K', { valid: true, discountAmount: 10000, message: '10K discount applied!' }],
  ['NEWUSER', { valid: true, discountAmount: 15000, message: 'New user discount!' }]
]);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PhotoBooth server is running' });
});

// Payment endpoints
app.post('/api/payment/create', async (req, res) => {
  try {
    const { amount, currency = 'VND', metadata = {} } = req.body;
    
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Generate QR code for payment
    const paymentUrl = `https://payment.example.com/pay/${paymentId}?amount=${amount}&currency=${currency}`;
    const qrDataUrl = await QRCode.toDataURL(paymentUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#F34B52',
        light: '#FFFFFF'
      }
    });
    
    // Store payment data
    payments.set(paymentId, {
      id: paymentId,
      amount,
      currency,
      status: 'pending',
      receivedAmount: 0,
      createdAt: new Date(),
      expiresAt,
      metadata
    });
    
    // Simulate payment completion after random time (for demo)
    setTimeout(() => {
      const payment = payments.get(paymentId);
      if (payment && payment.status === 'pending') {
        payment.status = 'success';
        payment.receivedAmount = amount;
      }
    }, Math.random() * 10000 + 5000); // 5-15 seconds
    
    res.json({
      paymentId,
      qrDataUrl,
      expiresAt: expiresAt.toISOString(),
      status: 'pending'
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

app.get('/api/payment/status/:paymentId', (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = payments.get(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Check if payment expired
    if (new Date() > payment.expiresAt && payment.status === 'pending') {
      payment.status = 'failed';
    }
    
    res.json({
      status: payment.status,
      receivedAmount: payment.receivedAmount,
      amount: payment.amount,
      currency: payment.currency
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Voucher validation endpoint
app.post('/api/voucher/validate', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Voucher code is required' });
    }
    
    const voucher = vouchers.get(code.toUpperCase());
    
    if (voucher) {
      res.json({
        valid: true,
        discountAmount: voucher.discountAmount,
        message: voucher.message
      });
    } else {
      res.json({
        valid: false,
        discountAmount: 0,
        message: 'Invalid voucher code'
      });
    }
  } catch (error) {
    console.error('Voucher validation error:', error);
    res.status(500).json({ error: 'Failed to validate voucher' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Base64 image upload endpoint
app.post('/api/upload/base64', (req, res) => {
  try {
    const { image, filename = 'photo.jpg' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(filename) || '.jpg';
    const newFilename = `photo-${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadsDir, newFilename);
    
    // Save file
    fs.writeFileSync(filepath, buffer);
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${newFilename}`;
    
    res.json({
      url: fileUrl,
      filename: newFilename,
      size: buffer.length
    });
  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Generate share QR code
app.post('/api/qr/generate', async (req, res) => {
  try {
    const { data, options = {} } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }
    
    const qrOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#F34B52',
        light: '#FFFFFF'
      },
      ...options
    };
    
    const qrDataUrl = await QRCode.toDataURL(data, qrOptions);
    
    res.json({
      qrDataUrl,
      data
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`PhotoBooth server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;