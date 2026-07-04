import React from "react";

export default function GlassCard({ className = "", children }) {
  return <div className={`glass-card ${className}`.trim()}>{children}</div>;
}
