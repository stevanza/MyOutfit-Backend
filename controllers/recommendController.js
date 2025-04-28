// Choose one of these imports based on your database choice
// For MongoDB:
// const Clothing = require('../models/Clothing');

// For local JSON database:
const localDb = require('../utils/localDatabase');
const weatherApi = require('../utils/weatherApi');

// Get outfit recommendations based on weather and/or mood
exports.getRecommendations = async (req, res) => {
  try {
    const { lat, lon, mood } = req.query;
    
    // Get current weather if coordinates are provided
    let weather = null;
    let season = 'all';
    
    if (lat && lon) {
      weather = await weatherApi.getCurrentWeather(lat, lon);
      
      // Determine season based on temperature
      const temp = weather.main.temp;
      
      if (temp < 10) {
        season = 'winter';
      } else if (temp < 20) {
        season = 'fall';
      } else if (temp < 30) {
        season = 'spring';
      } else {
        season = 'summer';
      }
    }
    
    // For MongoDB:
    // let tops, bottoms, shoes, accessories;
    // if (season !== 'all') {
    //   tops = await Clothing.find({ 
    //     category: 'tops',
    //     $or: [{ season }, { season: 'all' }]
    //   }).limit(5);
    //   bottoms = await Clothing.find({ 
    //     category: 'bottoms',
    //     $or: [{ season }, { season: 'all' }]
    //   }).limit(5);
    //   shoes = await Clothing.find({ 
    //     category: 'shoes',
    //     $or: [{ season }, { season: 'all' }]
    //   }).limit(5);
    //   accessories = await Clothing.find({ 
    //     category: 'accessories',
    //     $or: [{ season }, { season: 'all' }]
    //   }).limit(5);
    // } else {
    //   tops = await Clothing.find({ category: 'tops' }).limit(5);
    //   bottoms = await Clothing.find({ category: 'bottoms' }).limit(5);
    //   shoes = await Clothing.find({ category: 'shoes' }).limit(5);
    //   accessories = await Clothing.find({ category: 'accessories' }).limit(5);
    // }
    
    // For local JSON database:
    const allClothes = localDb.getAllClothes();
    
    const tops = allClothes
      .filter(item => item.category === 'tops' && (item.season === season || item.season === 'all'))
      .slice(0, 5);
      
    const bottoms = allClothes
      .filter(item => item.category === 'bottoms' && (item.season === season || item.season === 'all'))
      .slice(0, 5);
      
    const shoes = allClothes
      .filter(item => item.category === 'shoes' && (item.season === season || item.season === 'all'))
      .slice(0, 5);
      
    const accessories = allClothes
      .filter(item => item.category === 'accessories' && (item.season === season || item.season === 'all'))
      .slice(0, 5);
    
    // Create outfits by combining items
    const outfits = [];
    
    // Create at least one outfit if we have tops and bottoms
    if (tops.length > 0 && bottoms.length > 0) {
      // Create up to 3 different outfits
      const outfitCount = Math.min(3, tops.length, bottoms.length);
      
      for (let i = 0; i < outfitCount; i++) {
        const outfit = {
          top: tops[i % tops.length],
          bottom: bottoms[i % bottoms.length],
          shoes: shoes.length > 0 ? shoes[i % shoes.length] : null,
          accessory: accessories.length > 0 ? accessories[i % accessories.length] : null,
          weather: weather ? {
            temp: weather.main.temp,
            description: weather.weather[0].description,
            icon: `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`
          } : null
        };
        
        outfits.push(outfit);
      }
    }
    
    res.status(200).json({
      success: true,
      count: outfits.length,
      weather: weather ? {
        temp: weather.main.temp,
        description: weather.weather[0].description
      } : null,
      season,
      data: outfits
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};