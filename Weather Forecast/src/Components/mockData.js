/**
 * Mock data generator for the Weather App.
 * Generates realistic forecast payloads mimicking the OpenWeatherMap API format.
 */

export const generateMockData = (cityName) => {
  if (!cityName) cityName = "london";
  const normalizedCity = cityName.toLowerCase().trim();
  
  let cityDetails = {
    name: "London",
    timezone: 3600,
    sunrise: Math.floor(Date.now() / 1000) - 20000,
    sunset: Math.floor(Date.now() / 1000) + 20000,
  };
  
  // Custom mock configurations for select cities
  let baseTemp = 14;
  let weatherCondition = "Clear";
  let weatherDesc = "clear sky";
  let weatherIcon = "01d";
  let windSpeed = 10;
  let humidity = 62;

  if (normalizedCity.includes("new york")) {
    cityDetails.name = "New York";
    cityDetails.timezone = -14400; // EST
    baseTemp = 22;
    weatherCondition = "Clouds";
    weatherDesc = "few clouds";
    weatherIcon = "02d";
    windSpeed = 15;
    humidity = 70;
  } else if (normalizedCity.includes("tokyo")) {
    cityDetails.name = "Tokyo";
    cityDetails.timezone = 32400; // JST
    baseTemp = 25;
    weatherCondition = "Rain";
    weatherDesc = "moderate rain";
    weatherIcon = "10d";
    windSpeed = 12;
    humidity = 85;
  } else if (normalizedCity.includes("paris")) {
    cityDetails.name = "Paris";
    cityDetails.timezone = 7200; // CEST
    baseTemp = 18;
    weatherCondition = "Drizzle";
    weatherDesc = "light intensity drizzle";
    weatherIcon = "09d";
    windSpeed = 8;
    humidity = 75;
  } else if (normalizedCity.includes("sydney")) {
    cityDetails.name = "Sydney";
    cityDetails.timezone = 36000; // AEST
    baseTemp = 16;
    weatherCondition = "Clear";
    weatherDesc = "sunny and clear";
    weatherIcon = "01d";
    windSpeed = 18;
    humidity = 52;
  } else {
    // Dynamic generation for any other city searched
    const hash = normalizedCity.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    cityDetails.name = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    cityDetails.timezone = (hash % 24 - 12) * 3600; // Semi-random timezone
    
    // Choose weather based on hash
    const conditions = ["Clear", "Clouds", "Rain", "Drizzle", "Snow"];
    const descriptions = ["clear sky", "scattered clouds", "heavy intensity rain", "drizzle", "light snow"];
    const icons = ["01d", "03d", "10d", "09d", "13d"];
    
    const condIdx = hash % conditions.length;
    weatherCondition = conditions[condIdx];
    weatherDesc = descriptions[condIdx];
    weatherIcon = icons[condIdx];
    
    baseTemp = 10 + (hash % 20); // Temp from 10 to 30
    windSpeed = 5 + (hash % 25);
    humidity = 40 + (hash % 50);
  }

  const list = [];
  const startDt = Math.floor(Date.now() / 1000);
  
  // Weather list cycles
  const weatherConditions = ["Clear", "Clouds", "Rain", "Snow", "Drizzle"];
  const weatherIcons = {
    "Clear": "01d",
    "Clouds": "03d",
    "Rain": "10d",
    "Snow": "13d",
    "Drizzle": "09d"
  };

  // Build a list of 40 elements (3-hour intervals over 5 days)
  for (let i = 0; i < 40; i++) {
    const dayOffset = Math.floor(i / 8);
    const timeVar = Math.sin(i / 3) * 3;
    const currentTemp = baseTemp + timeVar - dayOffset * 0.4;
    
    let cond = weatherCondition;
    let icon = weatherIcon;
    
    // Add variations for other days
    if (dayOffset > 0 && i % 8 === 0) {
      const condIndex = (weatherConditions.indexOf(weatherCondition) + dayOffset) % weatherConditions.length;
      cond = weatherConditions[condIndex];
      icon = weatherIcons[cond] || "01d";
      // Adjust icon day/night indicator based on cycle
      const isNight = i % 8 >= 5 || i % 8 === 0;
      icon = icon.replace("d", isNight ? "n" : "d");
    }

    list.push({
      dt: startDt + i * 3 * 3600,
      main: {
        temp: currentTemp,
        temp_max: currentTemp + 1.5,
        temp_min: currentTemp - 1.5,
        humidity: Math.min(100, Math.max(10, humidity + Math.floor(timeVar * -2.5))),
        feels_like: currentTemp - 0.3,
      },
      wind: {
        speed: Math.max(1, windSpeed + Math.sin(i) * 2.5),
      },
      weather: [
        {
          main: cond,
          description: i === 0 ? weatherDesc : `${cond.toLowerCase()} weather`,
          icon: icon,
        }
      ]
    });
  }

  return {
    city: cityDetails,
    list: list
  };
};
