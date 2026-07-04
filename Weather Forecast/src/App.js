import React, { useEffect, useState } from "react";
import "./App.css";
import Maindata from "./Components/Maindata";
/* eslint-disable-next-line no-unused-vars */
import Search from "./Components/Search";

function App() {
  /* eslint-disable-next-line no-unused-vars */
  const [location, setLocation] = useState();
  const [backgroundImageURL, setBackgroundImageURL] = useState("01n");

  const handle = (e) => {
    setBackgroundImageURL(e);
  };

  useEffect(() => {
    async function getCity(position) {
      try {
        const GEOLOCATION_API_KEY = process.env.REACT_APP_GEO_API || localStorage.getItem('REACT_APP_GEO_API');
        if (!GEOLOCATION_API_KEY) {
          console.warn("LocationIQ API key (REACT_APP_GEO_API) is not set. Skipping reverse geocoding.");
          return;
        }
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const response = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=${GEOLOCATION_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
        );
        const json = await response.json();
        if (json?.address?.city) {
          setLocation(json.address.city);
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
      <Maindata city={location} setBackgroundImageURL={handle} />
    </div>
  );
}

export default App;
