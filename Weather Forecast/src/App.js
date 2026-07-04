import React, { useEffect, useState } from "react";
import "./App.css";
import Maindata from "./Components/Maindata";

function App() {
  const [location, setLocation] = useState();
  const [coords, setCoords] = useState(null);
  const [backgroundImageURL, setBackgroundImageURL] = useState("01n");

  const handle = (e) => {
    setBackgroundImageURL(e);
  };

  useEffect(() => {
    async function getCity(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      // Capture coordinates so we can query OpenWeatherMap directly if reverse geocoding is unavailable
      setCoords({ lat: latitude, lon: longitude });

      try {
        const GEOLOCATION_API_KEY = process.env.REACT_APP_GEO_API || localStorage.getItem('REACT_APP_GEO_API');
        if (!GEOLOCATION_API_KEY) {
          return;
        }
        const response = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=${GEOLOCATION_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
        );
        const json = await response.json();
        const city = json?.address?.city || json?.address?.town || json?.address?.village;
        if (city) {
          setLocation(city);
        }
      } catch (error) {
        console.error("Error geocoding location:", error);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getCity, (err) => {
        console.warn("Geolocation access denied or failed:", err.message);
      });
    }
  }, []);

  return (
    <div
      className="mainpage"
      style={{
        backgroundImage: `url("./pics/${backgroundImageURL}.jpg")`,
        backgroundSize: "cover",
      }}
    >
      <Maindata city={location} coords={coords} setBackgroundImageURL={handle} />
    </div>
  );
}

export default App;
