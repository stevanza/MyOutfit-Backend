const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Get the category from the request body
    const category = req.body.category || 'others';
    const uploadPath = path.join(__dirname, `../uploads/${category}`);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer with the configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

router.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Upload API is available. Please use POST method to upload files.',
      instructions: {
        method: 'POST',
        endpoint: '/api/upload',
        formData: {
          image: 'file (required)',
          name: 'string (required)',
          category: 'string (required: tops, bottoms, shoes, accessories)',
          color: 'string (optional)',
          season: 'string (optional)',
          style: 'string (optional)'
        }
      }
    });
  });

// Upload a clothing item
router.post('/', upload.single('image'), uploadController.uploadClothing);

module.exports = router;