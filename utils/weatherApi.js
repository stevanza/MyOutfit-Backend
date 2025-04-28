const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather by coordinates
exports.getCurrentWeather = async (lat, lon) => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('OpenWeatherMap API key is not defined');
    }

    const response = await axios.get(`${WEATHER_API_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric' // Use metric units (Celsius)
      }
    });

    return response.data;
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw error;
  }
};

// Get weather forecast by coordinates
exports.getWeatherForecast = async (lat, lon) => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('OpenWeatherMap API key is not defined');
    }

    const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric', // Use metric units (Celsius)
        cnt: 8 // Get forecast for next 24 hours (8 x 3-hour intervals)
      }
    });

    return response.data;
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw error;
  }
};