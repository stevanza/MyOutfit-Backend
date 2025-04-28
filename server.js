const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/tops', 'uploads/bottoms', 'uploads/shoes', 'uploads/accessories'];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Connect to MongoDB (uncomment if using MongoDB)
/*
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));
*/

// Basic route for testing
app.get('/', (req, res) => {
  res.send('MyOutfit API is running');
});

console.log('Setting up routes...');

// Import and use Routes - Uncomment these lines after creating the route files

const clothesRoutes = require('./routes/clothes');
const uploadRoutes = require('./routes/upload');
const recommendRoutes = require('./routes/recommend');

// Use Routes
app.use('/api/clothes', clothesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/recommend', recommendRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});