import React from "react";
import moment from "moment";
import { Sun, Moon } from "lucide-react";

const SunPosition = ({ dt, sunrise, sunset, timezone, isBackground }) => {
  const isDay = dt >= sunrise && dt <= sunset;
  let pct = 0;
  
  if (isDay) {
    pct = (dt - sunrise) / (sunset - sunrise);
  } else {
    // Night calculation
    const nextSunrise = sunrise + 86400;
    const prevSunset = sunset - 86400;
    if (dt > sunset) {
      pct = (dt - sunset) / (nextSunrise - sunset);
    } else {
      pct = (dt - prevSunset) / (sunrise - prevSunset);
    }
  }
  
  pct = Math.min(Math.max(pct, 0), 1);

  // Arc path sizing: width 260, height 100
  const p0 = isBackground ? { x: 15, y: 15 } : { x: 15, y: 85 };
  const p1 = isBackground ? { x: 130, y: 85 } : { x: 130, y: 15 };
  const p2 = isBackground ? { x: 245, y: 15 } : { x: 245, y: 85 };

  const t = pct;
  const currentX = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
  const currentY = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;

  if (isBackground) {
    return (
      <div className="solar-tracker-bg-overlay">
        <svg viewBox="0 0 260 100" width="100%" className="solar-svg">
          {/* Background curve */}
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
            fill="none"
            stroke={isDay ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.08)"}
            strokeWidth="1.75"
            strokeDasharray={isDay ? "0" : "3 3"}
          />
          
          {/* Active progress curve */}
          {isDay && (
            <path
              d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
              fill="none"
              stroke="url(#solarGradientBg)"
              strokeWidth="1.75"
              strokeDasharray={`${pct * 240} 1000`}
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="solarGradientBg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Sun/Moon Indicator with Beams */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            {isDay ? (
              <g>
                <circle
                  r="14"
                  fill="rgba(251, 191, 36, 0.25)"
                  className="solar-indicator-glow"
                />
                <circle r="5" fill="#fef08a" />
                {/* 8 Radiating Beams */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1="-8"
                    x2="0"
                    y2="-11"
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    transform={`rotate(${angle})`}
                  />
                ))}
              </g>
            ) : (
              <g>
                <circle
                  r="10"
                  fill="rgba(168, 85, 247, 0.2)"
                  className="solar-indicator-glow"
                />
                <circle r="4" fill="#d8b4fe" />
              </g>
            )}
          </g>
        </svg>
      </div>
    );
  }

  // Fallback / Standard Layout
  const remainingSeconds = isDay 
    ? sunset - dt 
    : (dt > sunset ? (sunrise + 86400) - dt : sunrise - dt);
  
  const duration = moment.duration(remainingSeconds * 1000);
  const durationHours = Math.floor(duration.asHours());
  const durationMinutes = duration.minutes();
  
  const timeText = isDay 
    ? `Sunset in ${durationHours}h ${durationMinutes}m` 
    : `Sunrise in ${durationHours}h ${durationMinutes}m`;

  const sunriseTimeText = moment.utc(sunrise * 1000).add(timezone, "seconds").format("h:mm a");
  const sunsetTimeText = moment.utc(sunset * 1000).add(timezone, "seconds").format("h:mm a");

  return (
    <div className="solar-tracker">
      <div className="solar-tracker-title">Solar Position Tracker</div>
      
      <div className="solar-tracker-svg-container">
        <svg viewBox="0 0 260 100" width="100%" className="solar-svg">
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
            fill="none"
            stroke={isDay ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)"}
            strokeWidth="2"
            strokeDasharray={isDay ? "0" : "4 4"}
          />
          {isDay && (
            <path
              d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
              fill="none"
              stroke="url(#solarGradient)"
              strokeWidth="2"
              strokeDasharray={`${pct * 240} 1000`}
            />
          )}
          <defs>
            <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <line x1="0" y1="85" x2="260" y2="85" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <g transform={`translate(${currentX}, ${currentY})`}>
            <circle
              r="12"
              fill={isDay ? "rgba(245, 158, 11, 0.2)" : "rgba(168, 85, 247, 0.2)"}
              className="solar-indicator-glow"
            />
            {isDay ? (
              <circle r="6" fill="#fbbf24" className="solar-indicator-core" />
            ) : (
              <circle r="5" fill="#a855f7" className="solar-indicator-core" />
            )}
          </g>
        </svg>
      </div>

      <div className="solar-footer">
        <div className="solar-time-checkpoint">
          <span className="solar-label">Sunrise</span>
          <span className="solar-value">{sunriseTimeText}</span>
        </div>
        <div className="solar-countdown-text">
          {isDay ? (
            <Sun size={14} className="solar-countdown-icon sun-spin" />
          ) : (
            <Moon size={14} className="solar-countdown-icon moon-pulse" />
          )}
          {timeText}
        </div>
        <div className="solar-time-checkpoint">
          <span className="solar-label">Sunset</span>
          <span className="solar-value">{sunsetTimeText}</span>
        </div>
      </div>
    </div>
  );
};

export default SunPosition;
