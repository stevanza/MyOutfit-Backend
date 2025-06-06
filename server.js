const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // ✅ Fixed fallback port

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // ✅ Updated to port 3000
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/tops', 'uploads/bottoms', 'uploads/shoes', 'uploads/accessories'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.body.category || 'accessories';
    const uploadPath = path.join(__dirname, 'uploads', category);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Simple in-memory storage for clothes data
let clothesData = [];
let nextId = 1;

// Routes

// Root route - ✅ Added missing root route
app.get('/', (req, res) => {
  res.json({
    message: 'MyOutfit Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      test: 'GET /api/test',
      upload: 'POST /api/upload',
      clothes: 'GET /api/clothes',
      clothesById: 'GET /api/clothes/:id',
      deleteClothes: 'DELETE /api/clothes/:id',
      recommend: 'GET /api/recommend'
    },
    timestamp: new Date().toISOString()
  });
});

// API root route
app.get('/api', (req, res) => {
  res.json({
    message: 'MyOutfit API v1.0',
    status: 'ready',
    documentation: 'Available endpoints listed in root route',
    timestamp: new Date().toISOString()
  });
});

// Add preflight OPTIONS handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Upload clothing item
app.post('/api/upload', (req, res, next) => {
  console.log('🔵 Upload route hit!');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  next();
}, upload.single('image'), (req, res) => {
  try {
    console.log('✅ Upload middleware passed');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        error: 'No image file uploaded' 
      });
    }

    const { name, category, color, brand, size, description } = req.body;

    if (!name || !category) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'Name and category are required' 
      });
    }

    // Create clothing item object
    const clothingItem = {
      id: nextId++,
      name,
      category,
      color: color || '',
      brand: brand || '',
      size: size || '',
      description: description || '',
      imagePath: `/uploads/${category}/${req.file.filename}`,
      fileName: req.file.filename,
      uploadDate: new Date().toISOString()
    };

    // Save to memory (in real app, save to database)
    clothesData.push(clothingItem);

    console.log('✅ Clothing item created:', clothingItem);

    const response = {
      success: true,
      message: 'Clothing item uploaded successfully',
      data: clothingItem
    };

    console.log('✅ Sending response:', response);
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get all clothes
app.get('/api/clothes', (req, res) => {
  try {
    const { category } = req.query;
    
    let filteredClothes = clothesData;
    if (category && category !== 'all') {
      filteredClothes = clothesData.filter(item => item.category === category);
    }

    res.json({
      success: true,
      data: filteredClothes,
      total: filteredClothes.length
    });
  } catch (error) {
    console.error('Get clothes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific clothing item
app.get('/api/clothes/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = clothesData.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Clothing item not found' });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get clothing item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete clothing item
app.delete('/api/clothes/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = clothesData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Clothing item not found' });
    }

    const item = clothesData[itemIndex];
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, 'uploads', item.category, item.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from memory
    clothesData.splice(itemIndex, 1);

    res.json({
      success: true,
      message: 'Clothing item deleted successfully'
    });
  } catch (error) {
    console.error('Delete clothing item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basic outfit recommendations
app.get('/api/recommend', (req, res) => {
  try {
    const { mood, weather } = req.query;
    
    // Simple recommendation logic
    const tops = clothesData.filter(item => item.category === 'tops');
    const bottoms = clothesData.filter(item => item.category === 'bottoms');
    const shoes = clothesData.filter(item => item.category === 'shoes');
    const accessories = clothesData.filter(item => item.category === 'accessories');

    if (tops.length === 0 || bottoms.length === 0) {
      return res.json({
        success: false,
        message: 'Not enough clothes to create recommendations. Add more tops and bottoms.'
      });
    }

    // Generate a simple outfit
    const randomOutfit = {
      top: tops[Math.floor(Math.random() * tops.length)],
      bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
      shoes: shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : null,
      accessory: accessories.length > 0 ? accessories[Math.floor(Math.random() * accessories.length)] : null
    };

    res.json({
      success: true,
      data: {
        outfit: randomOutfit,
        mood: mood || 'casual',
        weather: weather || 'normal'
      }
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 10MB.' });
    }
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!', 
    details: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directories checked/created`);
  console.log(`🌐 CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
  console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/test`);
});