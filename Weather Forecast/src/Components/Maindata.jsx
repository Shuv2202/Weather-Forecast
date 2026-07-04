import React, { useState, useEffect } from "react";
import {
  Search,
  Thermometer,
} from "lucide-react";
import moment from "moment";
import { generateMockData } from "./mockData";
import WeatherEffects from "./WeatherEffects";
import SunPosition from "./SunPosition";
import "../Componentstyle/Main.css";
import GlassCard from "./GlassCard";

const Maindata = ({ city, coords, setBackgroundImageURL }) => {
  const [data, setData] = useState();
  /* eslint-disable-next-line no-unused-vars */
  const [cityvalid, setCityvalid] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // State for search input

  // Custom API configuration & demo mode states
  const [isDemoMode, setIsDemoMode] = useState(() => {
    // If an API key exists (in env or local storage), prioritize Live Mode
    const openWeatherKey = process.env.REACT_APP_API_KEY || localStorage.getItem("REACT_APP_API_KEY");
    if (openWeatherKey) {
      localStorage.setItem("isDemoMode", "false");
      return false;
    }
    const storedDemo = localStorage.getItem("isDemoMode");
    if (storedDemo !== null) {
      return storedDemo === "true";
    }
    // Default to demo mode if no key is set
    return true;
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("REACT_APP_API_KEY") || "");
  const [geoKeyInput, setGeoKeyInput] = useState(() => localStorage.getItem("REACT_APP_GEO_API") || "");
  const [errorMsg, setErrorMsg] = useState("");

  const Dweather = async (cityName) => {
    if (!cityName) cityName = "london";
    setErrorMsg("");

    const isCoords = typeof cityName === "object" && cityName !== null;

    // If Demo Mode is active, generate and set mock data
    if (isDemoMode) {
      const resolvedName = isCoords ? "Your Location" : cityName;
      const mockPayload = generateMockData(resolvedName);
      setData(mockPayload);
      setCityvalid(true);
      if (isCoords) {
        setSearchValue("Your Location");
      }
      return;
    }

    // Resolve API keys from env or localStorage
    const openWeatherKey = process.env.REACT_APP_API_KEY || localStorage.getItem("REACT_APP_API_KEY");
    if (!openWeatherKey) {
      setShowConfigModal(true);
      return;
    }

    try {
      let url = "";
      if (isCoords) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityName.lat}&lon=${cityName.lon}&appid=${openWeatherKey}&units=metric&formatted=0`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${openWeatherKey}&units=metric&formatted=0`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid OpenWeatherMap API Key (401). Please check your key configuration.");
        } else if (response.status === 404) {
          setCityvalid(false);
          throw new Error(`City "${isCoords ? "Location" : cityName}" not found.`);
        } else {
          throw new Error(`Failed to fetch weather data: Status ${response.status}`);
        }
      }

      const actualData = await response.json();
      if (actualData.city) {
        setCityvalid(true);
        setData(actualData);
        if (isCoords) {
          setSearchValue(actualData.city.name);
        }
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
    } else if (coords) {
      Dweather(coords);
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
  }, [city, coords, isDemoMode]);

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

  // Function to map weather icon code to the public SVG icon image
  const getWeatherIcon = (iconCode, className = "forecast-icon") => {
    const icon = iconCode || "03d";
    return (
      <img
        src={`icons/${icon}.svg`}
        alt="Weather Icon"
        className={className}
      />
    );
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
  let dt = 0;
  let sunrise = 0;
  let sunset = 0;
  let timezone = 0;

  if (data) {
    dt = data.list[0].dt;
    sunrise = data.city.sunrise;
    sunset = data.city.sunset;
    timezone = data.city.timezone;
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

            {/* 2-Row Horizontal Dashboard Layout */}
            <div className="dashboard-layout">
              {/* Row 1: Daily Forecast Header and Full-Width Glass Card */}
              <div className="dashboard-section">
                <h2 className="section-title">Daily Forcast</h2>
                <GlassCard className="daily-forecast-card">
                  
                  {/* Left block: City, Date, Icon, Temperature, Description */}
                  <div className="daily-left-content">
                    <div className="city-info">
                      <h1 className="city-name">{data.city.name}</h1>
                      <p className="date">
                        {moment
                          .utc(new Date().setTime(data.list[0].dt * 1000))
                          .add(data.city.timezone, "seconds")
                          .format("dddd, MMMM Do YYYY") + ","}
                      </p>
                    </div>
                    
                    <div className="weather-display-row">
                      <div className="weather-large-icon-wrapper">
                        {getWeatherIcon(data.list[0].weather[0].icon, "large-weather-icon")}
                      </div>
                      
                      <div className="temperature-info">
                        <div className="temp-value-row">
                          <h2 className="large-temp">
                            {data.list[0].main.temp.toFixed(1)}
                          </h2>
                          <Thermometer size={32} strokeWidth={1.5} className="temp-thermometer-icon" />
                          <span className="temp-degree-symbol">°</span>
                        </div>
                        <p className="weather-desc-text">
                          {data.list[0].weather[0].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="vertical-divider"></div>

                  {/* Right block: 2x3 Details Grid */}
                  <div className="daily-right-content">
                    <div className="details-grid-cols">
                      
                      {/* Col 1: High & Low */}
                      <div className="details-grid-col">
                        <div className="detail-item">
                          <div className="detail-value-row">
                            <span className="detail-number">{data.list[0].main.temp_max.toFixed(1)}</span>
                            <Thermometer size={18} strokeWidth={1.5} className="detail-therm-icon high-temp" />
                            <span className="detail-degree">°</span>
                          </div>
                          <div className="detail-label">High</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-value-row">
                            <span className="detail-number">{data.list[0].main.temp_min.toFixed(1)}</span>
                            <Thermometer size={18} strokeWidth={1.5} className="detail-therm-icon low-temp" />
                            <span className="detail-degree">°</span>
                          </div>
                          <div className="detail-label">Low</div>
                        </div>
                      </div>

                      {/* Col 2: Wind Speed & Humidity */}
                      <div className="details-grid-col">
                        <div className="detail-item">
                          <div className="detail-value-row">
                            <span className="detail-number">
                              {Math.round(data.list[0].wind.speed).toString().padStart(2, '0')}
                            </span>
                            <span className="detail-unit">_km/h</span>
                          </div>
                          <div className="detail-label">Wind Speed</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-value-row">
                            <span className="detail-number">{data.list[0].main.humidity}</span>
                            <span className="detail-unit">%</span>
                          </div>
                          <div className="detail-label">Humadity</div>
                        </div>
                      </div>

                      {/* Col 3: Sunrise & Sunset */}
                      <div className="details-grid-col">
                        <div className="detail-item">
                          <div className="detail-value-row">
                            <span className="detail-number-time">
                              {moment.utc(sunrise * 1000).add(timezone, "seconds").format("h:mm a")}
                            </span>
                          </div>
                          <div className="detail-label">Sunrise</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-value-row">
                            <span className="detail-number-time">
                              {moment.utc(sunset * 1000).add(timezone, "seconds").format("h:mm a")}
                            </span>
                          </div>
                          <div className="detail-label">Sunset</div>
                        </div>
                      </div>

                    </div>
                  </div>

                </GlassCard>
              </div>

              {/* Row 2: Five Days Forecast Header and Full-Width Glass Card */}
              <div className="dashboard-section" style={{ marginTop: "2rem" }}>
                <h2 className="section-title">Five Days Forecast</h2>
                <GlassCard className="forecast-card-wrapper-full">
                  <div className="forecast-columns-grid">
                    {[7, 15, 23, 31, 39].map((index) => {
                      const forecastItem = data.list[index];
                      return (
                        <div className="forecast-column" key={index}>
                          <div className="forecast-day-name">
                            {moment(new Date().setTime(forecastItem.dt * 1000)).format("ddd")}
                          </div>
                          <div className="forecast-icon-centered">
                            {getWeatherIcon(forecastItem.weather[0].icon, "forecast-icon-svg")}
                          </div>
                          <div className="forecast-stat">
                            Temp {forecastItem.main.temp.toFixed(1)} C°
                          </div>
                          <div className="forecast-stat">
                            Feel like {forecastItem.main.feels_like.toFixed(1)} C°
                          </div>
                          <div className="forecast-stat">
                            Moist {forecastItem.main.humidity} %
                          </div>
                          <div className="forecast-condition-name">
                            {forecastItem.weather[0].description}
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
