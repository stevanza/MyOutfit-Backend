// Choose one of these imports based on your database choice
// For MongoDB:
// const Clothing = require('../models/Clothing');

// For local JSON database:
const localDb = require('../utils/localDatabase');

// Get all clothes
exports.getAllClothes = async (req, res) => {
  try {
    // For MongoDB:
    // const clothes = await Clothing.find().sort({ createdAt: -1 });
    
    // For local JSON database:
    const clothes = localDb.getAllClothes();
    
    res.status(200).json({
      success: true,
      count: clothes.length,
      data: clothes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get clothes by category
exports.getClothesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['tops', 'bottoms', 'shoes', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }
    
    // For MongoDB:
    // const clothes = await Clothing.find({ category }).sort({ createdAt: -1 });
    
    // For local JSON database:
    const clothes = localDb.getClothesByCategory(category);
    
    res.status(200).json({
      success: true,
      count: clothes.length,
      data: clothes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a specific clothing item
exports.getClothingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For MongoDB:
    // const clothing = await Clothing.findById(id);
    
    // For local JSON database:
    const clothes = localDb.getAllClothes();
    const clothing = clothes.find(item => item.id === id);
    
    if (!clothing) {
      return res.status(404).json({
        success: false,
        error: 'Clothing item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: clothing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a clothing item
exports.updateClothing = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For MongoDB:
    // const clothing = await Clothing.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true
    // });
    
    // For local JSON database:
    const updatedClothing = localDb.updateClothing(id, req.body);
    
    if (!updatedClothing) {
      return res.status(404).json({
        success: false,
        error: 'Clothing item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedClothing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a clothing item
exports.deleteClothing = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For MongoDB:
    // const clothing = await Clothing.findByIdAndDelete(id);
    
    // For local JSON database:
    const result = localDb.deleteClothing(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Clothing item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};