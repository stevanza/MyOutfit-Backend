const fs = require('fs');
const path = require('path');

// Path to JSON file that will serve as our local database
const DB_FILE = path.join(__dirname, '../data/clothes.json');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ clothes: [] }));
}

// Get all clothes from the database
const getAllClothes = () => {
  try {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data).clothes;
  } catch (error) {
    console.error('Error reading from local database:', error);
    return [];
  }
};

// Get clothes by category
const getClothesByCategory = (category) => {
  const clothes = getAllClothes();
  return clothes.filter(item => item.category === category);
};

// Add a new clothing item to the database
const addClothing = (clothing) => {
  try {
    const data = fs.readFileSync(DB_FILE);
    const database = JSON.parse(data);
    
    // Generate a simple ID for the new item
    clothing.id = Date.now().toString();
    clothing.createdAt = new Date().toISOString();
    
    database.clothes.push(clothing);
    
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
    return clothing;
  } catch (error) {
    console.error('Error writing to local database:', error);
    return null;
  }
};

// Update a clothing item
const updateClothing = (id, updates) => {
  try {
    const data = fs.readFileSync(DB_FILE);
    const database = JSON.parse(data);
    
    const index = database.clothes.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    database.clothes[index] = { ...database.clothes[index], ...updates };
    
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
    return database.clothes[index];
  } catch (error) {
    console.error('Error updating local database:', error);
    return null;
  }
};

// Delete a clothing item
const deleteClothing = (id) => {
  try {
    const data = fs.readFileSync(DB_FILE);
    const database = JSON.parse(data);
    
    const index = database.clothes.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    database.clothes.splice(index, 1);
    
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting from local database:', error);
    return false;
  }
};

module.exports = {
  getAllClothes,
  getClothesByCategory,
  addClothing,
  updateClothing,
  deleteClothing
};