const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 3001;

console.log('🚀 Starting MyOutfit Backend Server...');

// ===================================
// LOCAL DATABASE SETUP
// ===================================
const DB_FILE = path.join(__dirname, 'data', 'clothes.json');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ clothes: [] }, null, 2));
  console.log('✅ Created database file');
}

const db = {
  read: () => {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data).clothes || [];
    } catch (error) {
      console.error('Error reading database:', error);
      return [];
    }
  },
  
  write: (clothes) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify({ clothes }, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing database:', error);
      return false;
    }
  },
  
  add: (item) => {
    try {
      const clothes = db.read();
      item.id = Date.now().toString();
      item.createdAt = new Date().toISOString();
      clothes.push(item);
      db.write(clothes);
      return item;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  }
};

// ===================================
// MIDDLEWARE
// ===================================
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================================
// STATIC FILE SERVING
// ===================================
const uploadsPath = path.resolve(__dirname, 'uploads');
console.log(`✅ Serving static files from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

app.use((req, res, next) => {
  if (!req.url.startsWith('/uploads/')) {
    console.log(`📝 ${req.method} ${req.url}`);
  }
  next();
});

// ===================================
// UPLOAD SETUP
// ===================================
const uploadDirs = ['uploads', 'uploads/tops', 'uploads/bottoms', 'uploads/shoes', 'uploads/accessories'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simpan sementara di uploads utama dulu karena req.body.category belum tersedia
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed!'), false);
    }
  }
});

// ===================================
// ROUTES
// ===================================

app.get('/', (req, res) => {
  const totalItems = db.read().length;
  res.json({
    message: 'MyOutfit Backend API',
    status: 'running',
    totalItems,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  console.log('✅ API Test route hit');
  const totalItems = db.read().length;
  
  res.json({ 
    success: true,
    message: 'Backend API is working!', 
    totalItems,
    timestamp: new Date().toISOString()
  });
});

// Upload Route - FIXED
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log('📤 Upload route hit');
  console.log('📋 Body:', req.body);
  console.log('📁 File:', req.file);

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const { name, category, color, brand, size, description } = req.body;

    if (!name || !category) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Name and category required' });
    }

    const validCategories = ['tops', 'bottoms', 'shoes', 'accessories'];
    if (!validCategories.includes(category)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    // FIXED: Pindahkan file dari uploads utama ke folder kategori yang benar
    const tempPath = req.file.path; // File sementara di uploads/
    const finalDir = path.join(__dirname, 'uploads', category);
    const finalPath = path.join(finalDir, req.file.filename);

    console.log(`📂 Moving from: ${tempPath}`);
    console.log(`📂 Moving to: ${finalPath}`);

    // Pastikan direktori kategori ada
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
      console.log(`✅ Created directory: ${finalDir}`);
    }

    // Pindahkan file
    fs.renameSync(tempPath, finalPath);
    console.log(`✅ File moved successfully to: ${finalPath}`);

    const clothingData = {
      name: name || '',
      category: category || '',
      imageUrl: '/uploads/' + category + '/' + req.file.filename,
      color: color || 'unknown',
      brand: brand || '',
      size: size || '',
      description: description || '',
      fileName: req.file.filename,
      fileSize: req.file.size
    };

    console.log('💾 Saving data:', clothingData);

    const saved = db.add(clothingData);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to save to database' });
    }

    console.log('✅ Item saved:', saved.name);
    res.status(201).json({
      success: true,
      message: 'Item uploaded successfully!',
      data: saved
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: 'Upload failed', details: error.message });
  }
});

app.get('/api/clothes', (req, res) => {
  try {
    const clothes = db.read();
    const { category } = req.query;
    
    let filtered = clothes;
    if (category && category !== 'all') {
      filtered = clothes.filter(item => item.category === category);
    }

    console.log(`📥 Sending ${filtered.length} items`);
    
    res.json({
      success: true,
      data: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error getting clothes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get clothes' 
    });
  }
});

// Delete Route - NEW
app.delete('/api/clothes/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Delete request for item ID: ${id}`);
    
    const clothes = db.read();
    const itemIndex = clothes.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }
    
    const item = clothes[itemIndex];
    console.log(`🗑️ Deleting item: ${item.name}`);
    
    // Hapus file gambar jika ada
    if (item.fileName && item.category) {
      const filePath = path.join(__dirname, 'uploads', item.category, item.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ File deleted: ${filePath}`);
      }
    }
    
    // Hapus dari database
    clothes.splice(itemIndex, 1);
    db.write(clothes);
    
    console.log(`✅ Item deleted successfully: ${item.name}`);
    res.json({
      success: true,
      message: 'Item deleted successfully',
      deletedItem: item
    });
    
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete item',
      details: error.message
    });
  }
});

app.get('/api/debug/full', (req, res) => {
  try {
    const clothes = db.read();
    const categories = {
      tops: clothes.filter(c => c.category === 'tops').length,
      bottoms: clothes.filter(c => c.category === 'bottoms').length,
      shoes: clothes.filter(c => c.category === 'shoes').length,
      accessories: clothes.filter(c => c.category === 'accessories').length
    };

    res.json({
      timestamp: new Date().toISOString(),
      server: {
        port: PORT,
        uptime: `${Math.floor(process.uptime())} seconds`
      },
      database: {
        type: 'Local JSON',
        connected: true,
        totalItems: clothes.length,
        isEmpty: clothes.length === 0
      },
      categories,
      recentUploads: clothes.slice(-3)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Debug error',
      details: error.message
    });
  }
});

app.post('/api/debug/clear-all', (req, res) => {
  try {
    db.write([]);
    res.json({
      success: true,
      message: 'All data cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear data'
    });
  }
});

app.post('/api/debug/add-test-data', (req, res) => {
  try {
    const testItems = [
      { name: 'Test Shirt', category: 'tops', color: 'blue' },
      { name: 'Test Pants', category: 'bottoms', color: 'black' }
    ];

    testItems.forEach(item => db.add(item));
    
    res.json({
      success: true,
      message: `Added ${testItems.length} test items`,
      totalItems: db.read().length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add test data'
    });
  }
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Server error',
    details: error.message 
  });
});

app.use('*', (req, res) => {
  if (!req.originalUrl.startsWith('/uploads/')) {
    console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  }
  
  res.status(404).json({ 
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🎉 MyOutfit Backend Server Started!');
  console.log('=======================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`📦 Total items: ${db.read().length}`);
  console.log('=======================================');
  console.log('✅ Ready to accept requests!');
  console.log('');
});