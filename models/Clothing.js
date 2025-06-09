// models/Clothing.js - MongoDB Model for Clothing Items
const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide clothing name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide clothing category'],
    enum: {
      values: ['tops', 'bottoms', 'shoes', 'accessories'],
      message: 'Category must be either tops, bottoms, shoes, or accessories'
    }
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide image URL']
  },
  color: {
    type: String,
    default: 'unknown',
    trim: true
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'all'],
    default: 'all'
  },
  style: {
    type: String,
    enum: ['casual', 'formal', 'sporty', 'party', 'business'],
    default: 'casual'
  },
  // Additional fields for better tracking
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  size: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  // File tracking fields
  originalFileName: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: ''
  },
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
clothingSchema.index({ category: 1 });
clothingSchema.index({ color: 1 });
clothingSchema.index({ season: 1 });
clothingSchema.index({ style: 1 });
clothingSchema.index({ createdAt: -1 });

// Virtual for full image URL (if needed)
clothingSchema.virtual('fullImageUrl').get(function() {
  return `${process.env.BACKEND_URL || 'http://localhost:3001'}${this.imageUrl}`;
});

// Method to increment usage count
clothingSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Static method to get clothes by category
clothingSchema.statics.getByCategory = function(category) {
  return this.find({ category }).sort({ createdAt: -1 });
};

// Static method to get popular clothes (most used)
clothingSchema.statics.getPopular = function(limit = 10) {
  return this.find().sort({ usageCount: -1 }).limit(limit);
};

// Static method to get recent clothes
clothingSchema.statics.getRecent = function(limit = 10) {
  return this.find().sort({ createdAt: -1 }).limit(limit);
};

// Pre-save middleware to validate image URL
clothingSchema.pre('save', function(next) {
  if (this.imageUrl && !this.imageUrl.startsWith('/uploads/')) {
    this.imageUrl = `/uploads/${this.category}/${this.fileName || 'default.jpg'}`;
  }
  next();
});

// Post-save middleware for logging
clothingSchema.post('save', function(doc) {
  console.log(`✅ Clothing item saved: ${doc.name} (${doc.category})`);
});

// Post-remove middleware for cleanup
clothingSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    console.log(`🗑️ Clothing item deleted: ${doc.name} (${doc.category})`);
  }
});

const Clothing = mongoose.model('Clothing', clothingSchema);

module.exports = Clothing;