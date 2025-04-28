// Choose one of these imports based on your database choice
// For MongoDB:
// const Clothing = require('../models/Clothing');

// For local JSON database:
const localDb = require('../utils/localDatabase');

// Upload a clothing item
exports.uploadClothing = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image'
      });
    }

    // Extract data from request
    const { name, category, color, season, style } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and category'
      });
    }

    // Create image URL
    // This URL should be accessible from the frontend
    const imageUrl = `/uploads/${category}/${req.file.filename}`;

    // Create clothing data
    const clothingData = {
      name,
      category,
      imageUrl,
      color: color || 'unknown',
      season: season || 'all',
      style: style || 'casual'
    };

    // For MongoDB:
    // const clothing = await Clothing.create(clothingData);
    
    // For local JSON database:
    const clothing = localDb.addClothing(clothingData);

    res.status(201).json({
      success: true,
      data: clothing
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};