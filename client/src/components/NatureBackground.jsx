import React from 'react';

/**
 * Enterprise Ambient Atmosphere Background
 * Clean, subtle and professional gradient mesh without clutter, falling leaves, or distracting bottom animations.
 */
export default function NatureBackground() {
  return (
    <div className="nature-ambient-bg" aria-hidden="true">
      {/* Subtle diffused emerald ambient aura in upper left */}
      <div className="ambient-mesh-glow ambient-glow-top" />
      
      {/* Subtle diffused cyan/sky ambient aura in lower right */}
      <div className="ambient-mesh-glow ambient-glow-bottom" />
    </div>
  );
}
