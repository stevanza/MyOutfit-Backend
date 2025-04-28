const express = require('express');
const router = express.Router();
const clothesController = require('../controllers/clothesController');

// Get all clothes
router.get('/', clothesController.getAllClothes);

// Get clothes by category
router.get('/category/:category', clothesController.getClothesByCategory);

// Get a specific clothing item
router.get('/:id', clothesController.getClothingById);

// Update a clothing item
router.put('/:id', clothesController.updateClothing);

// Delete a clothing item
router.delete('/:id', clothesController.deleteClothing);

module.exports = router;