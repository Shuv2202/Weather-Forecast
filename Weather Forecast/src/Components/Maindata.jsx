import React, { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  ThermometerSun,
  ThermometerSnowflake,
  Search,
  Moon,
  CloudRain,
  CloudSnow,
} from "lucide-react";
import moment from "moment";
import { generateMockData } from "./mockData";
import WeatherEffects from "./WeatherEffects";
import SunPosition from "./SunPosition";
import "../Componentstyle/Main.css";
import GlassCard from "./GlassCard";

const Maindata = ({ city, setBackgroundImageURL }) => {
  const [data, setData] = useState();
  /* eslint-disable-next-line no-unused-vars */
  const [cityvalid, setCityvalid] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // State for search input

  // Custom API configuration & demo mode states
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const storedDemo = localStorage.getItem("isDemoMode");
    if (storedDemo !== null) {
      return storedDemo === "true";
    }
    // If no saved preference and no env key is set, default to demo mode
    return !process.env.REACT_APP_API_KEY;
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("REACT_APP_API_KEY") || "");
  const [geoKeyInput, setGeoKeyInput] = useState(() => localStorage.getItem("REACT_APP_GEO_API") || "");
  const [errorMsg, setErrorMsg] = useState("");

  const Dweather = async (cityName) => {
    if (!cityName) cityName = "london";
    setErrorMsg("");

    // If Demo Mode is active, generate and set mock data
    const isDemo = localStorage.getItem("isDemoMode") === "true" || isDemoMode;
    if (isDemo) {
      const mockPayload = generateMockData(cityName);
      setData(mockPayload);
      setCityvalid(true);
      return;
    }

    // Resolve API keys from env or localStorage
    const openWeatherKey = process.env.REACT_APP_API_KEY || localStorage.getItem("REACT_APP_API_KEY");
    if (!openWeatherKey) {
      setShowConfigModal(true);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${openWeatherKey}&units=metric&formatted=0`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid OpenWeatherMap API Key (401). Please check your key configuration.");
        } else if (response.status === 404) {
          setCityvalid(false);
          throw new Error(`City "${cityName}" not found.`);
        } else {
          throw new Error(`Failed to fetch weather data: Status ${response.status}`);
        }
      }

      const actualData = await response.json();
      if (actualData.city) {
        setCityvalid(true);
        setData(actualData);
      } else {
        setCityvalid(false);
        setErrorMsg("Invalid data structure received from weather service.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg(err.message || "An unexpected error occurred while fetching weather data.");
      // If unauthorized, open configuration modal
      if (err.message.includes("401")) {
        setShowConfigModal(true);
      }
    }
  };

  useEffect(() => {
    if (city) {
      Dweather(city);
      setSearchValue(city);
    } else {
      const hasKey = process.env.REACT_APP_API_KEY || localStorage.getItem("REACT_APP_API_KEY");
      const isDemo = localStorage.getItem("isDemoMode") === "true" || isDemoMode;
      if (!hasKey && !isDemo) {
        setShowConfigModal(true);
      } else {
        Dweather("london");
        setSearchValue("london");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    if (data?.list?.[0]?.weather?.[0]?.icon) {
      setBackgroundImageURL(data.list[0].weather[0].icon); // Set background in useEffect
    }
  }, [data, setBackgroundImageURL]);

  const handleSearch = () => {
    Dweather(searchValue); // Fetch new data when search icon is clicked
  };

  const handleSaveKeys = (e) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      localStorage.setItem("REACT_APP_API_KEY", apiKeyInput.trim());
    } else {
      localStorage.removeItem("REACT_APP_API_KEY");
    }

    if (geoKeyInput.trim()) {
      localStorage.setItem("REACT_APP_GEO_API", geoKeyInput.trim());
    } else {
      localStorage.removeItem("REACT_APP_GEO_API");
    }

    localStorage.setItem("isDemoMode", "false");
    setIsDemoMode(false);
    setShowConfigModal(false);

    // Trigger fresh load
    const currentCity = searchValue || city || "london";
    Dweather(currentCity);
  };

  const handleEnableDemoMode = () => {
    localStorage.setItem("isDemoMode", "true");
    setIsDemoMode(true);
    setShowConfigModal(false);
    const currentCity = searchValue || city || "london";
    const mockPayload = generateMockData(currentCity);
    setData(mockPayload);
    setCityvalid(true);
  };

  // Function to map weather condition to Lucide icon with customizable stroke weights
  const getWeatherIcon = (weather, strokeWidth = 1.5, className = "forecast-icon") => {
    const desc = data?.list?.[0]?.weather?.[0]?.description?.toLowerCase() || "";
    
    // Map overcast clouds or standard rain/drizzle to CloudRain outline icon
    if (weather === "Rain" || weather === "Drizzle" || desc.includes("overcast") || desc.includes("rain") || desc.includes("drizzle")) {
      return <CloudRain className={className} strokeWidth={strokeWidth} />;
    }
    
    switch (weather) {
      case "Clear":
        return <Sun className={className} strokeWidth={strokeWidth} />;
      case "Clouds":
        return <Cloud className={className} strokeWidth={strokeWidth} />;
      case "Snow":
        return <CloudSnow className={className} strokeWidth={strokeWidth} />;
      default:
        return <Cloud className={className} strokeWidth={strokeWidth} />; // Default to Cloud icon
    }
  };

  const getWeatherThemeClass = (condition) => {
    if (!condition) return "theme-clear";
    const cond = condition.toLowerCase();
    if (cond.includes("rain") || cond.includes("drizzle")) return "theme-rain";
    if (cond.includes("snow")) return "theme-snow";
    if (cond.includes("cloud")) return "theme-clouds";
    if (cond.includes("thunderstorm")) return "theme-thunder";
    return "theme-clear";
  };

  const renderConfigModal = () => {
    return (
      <div className="modal-backdrop">
        <div className="modal-card">
          <h2 className="modal-title">⚙️ Weather Dashboard Setup</h2>
          <p className="modal-description">
            To fetch live weather, please save your API keys. They will be stored securely in your browser's local storage.
          </p>

          <form onSubmit={handleSaveKeys} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                OpenWeatherMap API Key (Required for weather data)
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Paste REACT_APP_API_KEY..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <span className="form-help">
                Get a free key at <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noopener noreferrer">OpenWeatherMap API Keys</a>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                LocationIQ API Key (Optional, for automatic geolocation)
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Paste REACT_APP_GEO_API..."
                value={geoKeyInput}
                onChange={(e) => setGeoKeyInput(e.target.value)}
              />
              <span className="form-help">
                Get a free token at <a href="https://my.locationiq.com/dashboard/" target="_blank" rel="noopener noreferrer">LocationIQ Dashboard</a>
              </span>
            </div>

            {errorMsg && <div className="form-error-msg">{errorMsg}</div>}

            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={!apiKeyInput.trim()}>
                Save & Connect Live
              </button>
              <button type="button" className="btn-secondary" onClick={handleEnableDemoMode}>
                Try Demo Mode (Mock Data)
              </button>
              {data && (
                <button type="button" className="btn-close-modal" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!data && !showConfigModal) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const currentCondition = data ? data.list[0].weather[0].main : "Clear";

  // Solar parameters calculations
  let isDay = true;
  let timeText = "";
  let dt = 0;
  let sunrise = 0;
  let sunset = 0;
  let timezone = 0;

  if (data) {
    dt = data.list[0].dt;
    sunrise = data.city.sunrise;
    sunset = data.city.sunset;
    timezone = data.city.timezone;
    isDay = dt >= sunrise && dt <= sunset;

    const remainingSeconds = isDay 
      ? sunset - dt 
      : (dt > sunset ? (sunrise + 86400) - dt : sunrise - dt);
    
    const duration = moment.duration(remainingSeconds * 1000);
    const durationHours = Math.floor(duration.asHours());
    const durationMinutes = duration.minutes();
    
    timeText = isDay 
      ? `Sunset in ${durationHours}h ${durationMinutes}m` 
      : `Sunrise in ${durationHours}h ${durationMinutes}m`;
  }

  return (
    <div className={`weather-container ${getWeatherThemeClass(currentCondition)}`}>
      {isDemoMode && (
        <div className="demo-banner">
          <span>✨ Running in Demo Mode with Mock Data.</span>
          <button onClick={() => setShowConfigModal(true)} className="demo-config-link">
            Configure Live API Keys
          </button>
        </div>
      )}

      {showConfigModal && renderConfigModal()}

      {data && (
        <>
          {/* Layer 1: Page-wide weather dynamics canvas */}
          <WeatherEffects condition={currentCondition} />
          
          {/* Layer 2: Page-wide solar/lunar position tracking path */}
          <SunPosition
            dt={dt}
            sunrise={sunrise}
            sunset={sunset}
            timezone={timezone}
            isBackground={true}
          />
          
          {/* Layer 3: Glassmorphic dashboard content overlay */}
          <div className="main-content">
            {/* Header Controls */}
            <div className="header-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search location..."
                  className="search-input"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <Search className="search-icon" onClick={handleSearch} strokeWidth={1.5} style={{ cursor: "pointer" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => setShowConfigModal(true)} className="config-button" title="API Configuration">
                  ⚙️
                </button>
              </div>
            </div>

            {/* Responsive 3-Column Grid Layout */}
            <div className="dashboard-grid">
              
              {/* Column 1: Main Weather Card */}
              <div className="dashboard-col left-col">
                <GlassCard className="primary-card">
                  <div className="primary-card-content">
                    <div className="city-info">
                      <h1 className="city-name">{data.city.name}</h1>
                      <p className="date">
                        {moment
                          .utc(new Date().setTime(data.list[0].dt * 1000))
                          .add(data.city.timezone, "seconds")
                          .format("dddd, MMMM Do YYYY")}
                      </p>
                    </div>

                    <div className="current-weather">
                      <div className="weather-main">
                        <div className="weather-display">
                          {getWeatherIcon(currentCondition, 1.2, "primary-weather-icon")}
                          <div className="temperature-container">
                            <h2 className="temperature">
                              {data.list[0].main.temp.toFixed(1)}°C
                            </h2>
                            <p className="weather-description">
                              {data.list[0].weather[0].description}
                            </p>
                            <div className="card-solar-countdown">
                              {isDay ? (
                                <Sun size={14} strokeWidth={1.5} className="solar-countdown-icon sun-spin" />
                              ) : (
                                <Moon size={14} strokeWidth={1.5} className="solar-countdown-icon moon-pulse" />
                              )}
                              {timeText}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Column 2: Details matrix card */}
              <div className="dashboard-col center-col">
                <GlassCard className="details-card-wrapper">
                  <h3 className="forecast-title" style={{ marginBottom: "1.5rem" }}>Weather Details</h3>
                  <div className="weather-details">
                    {[
                      {
                        icon: <ThermometerSun className="detail-icon high-temp" strokeWidth={1.5} />,
                        label: "High",
                        value: `${data.list[0].main.temp_max.toFixed(1)}°C`,
                      },
                      {
                        icon: <ThermometerSnowflake className="detail-icon low-temp" strokeWidth={1.5} />,
                        label: "Low",
                        value: `${data.list[0].main.temp_min.toFixed(1)}°C`,
                      },
                      {
                        icon: <Wind className="detail-icon wind" strokeWidth={1.5} />,
                        label: "Wind",
                        value: `${data.list[0].wind.speed.toFixed(1)} km/h`,
                      },
                      {
                        icon: <Droplets className="detail-icon humidity" strokeWidth={1.5} />,
                        label: "Humidity",
                        value: `${data.list[0].main.humidity}%`,
                      },
                      {
                        icon: <Sunrise className="detail-icon sunrise" strokeWidth={1.5} />,
                        label: "Sunrise",
                        value: moment.utc(sunrise * 1000).add(timezone, "seconds").format("h:mm a"),
                      },
                      {
                        icon: <Sunset className="detail-icon sunset" strokeWidth={1.5} />,
                        label: "Sunset",
                        value: moment.utc(sunset * 1000).add(timezone, "seconds").format("h:mm a"),
                      },
                    ].map((item, index) => (
                      <div key={index} className="detail-card">
                        <div className="detail-header">
                          {item.icon}
                          <span className="detail-label">{item.label}</span>
                        </div>
                        <div className="detail-value">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Column 3: 5-Day Forecast rows with range bars */}
              <div className="dashboard-col right-col">
                <GlassCard className="forecast-card-wrapper">
                  <h3 className="forecast-title">5-Day Forecast</h3>
                  <div className="forecast-list">
                    {[7, 15, 23, 31, 39].map((index) => {
                      const forecastItem = data.list[index];
                      return (
                        <div className="forecast-row" key={index}>
                          <div className="forecast-row-day">
                            {moment(new Date().setTime(forecastItem.dt * 1000)).format("dddd")}
                          </div>
                          <div className="forecast-row-icon-cond">
                            {getWeatherIcon(forecastItem.weather[0].main, 1.5)}
                            <span className="forecast-row-cond">{forecastItem.weather[0].main}</span>
                          </div>
                          <div className="forecast-row-temp-range">
                            <span className="forecast-row-temp-val">{forecastItem.main.temp_min.toFixed(0)}°</span>
                            <div className="forecast-temp-bar-container">
                              <div className="forecast-temp-bar" />
                            </div>
                            <span className="forecast-row-temp-val text-right">{forecastItem.main.temp_max.toFixed(0)}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Maindata;
