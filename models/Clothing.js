const mongoose = require('mongoose');

const ClothingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'shoes', 'accessories'],
    lowercase: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'unknown'
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'all'],
    default: 'all'
  },
  style: {
    type: String,
    default: 'casual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Clothing', ClothingSchema);