import React, { useMemo } from 'react';

export default function NatureBackground() {
  // Generate stable random particle positions
  const leaves = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 5.7 + 3) % 96}%`,
      delay: `${(i * 1.3) % 9}s`,
      duration: `${14 + (i % 6) * 2.5}s`,
      size: 16 + (i % 4) * 6,
      opacity: 0.35 + (i % 5) * 0.12,
      rotateStart: (i * 45) % 360,
    }));
  }, []);

  const pollens = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${(i * 4.3 + 7) % 94}%`,
      top: `${(i * 7.1 + 12) % 85}%`,
      delay: `${(i * 0.8) % 7}s`,
      duration: `${7 + (i % 4) * 2}s`,
      size: 3 + (i % 3) * 2,
    }));
  }, []);

  return (
    <div className="nature-ambient-bg" aria-hidden="true">
      {/* Sun Dawn / Golden Hour Radial Glow */}
      <div className="nature-sun-glow" />

      {/* Floating Golden Pollen / Spores */}
      <div className="nature-pollens-container">
        {pollens.map((p) => (
          <span
            key={p.id}
            className="nature-pollen-dot"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Drifting Organic Leaves */}
      <div className="nature-leaves-container">
        {leaves.map((l) => (
          <svg
            key={l.id}
            className="nature-falling-leaf"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              left: l.left,
              width: `${l.size}px`,
              height: `${l.size}px`,
              opacity: l.opacity,
              animationDelay: l.delay,
              animationDuration: l.duration,
              transform: `rotate(${l.rotateStart}deg)`,
            }}
          >
            <path
              d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"
              fill="#22c55e"
              fillOpacity="0.75"
            />
            <line x1="16" y1="8" x2="2" y2="22" stroke="#16a34a" strokeWidth="1.5" />
            <path d="M17.5 15H9" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ))}
      </div>

      {/* Bottom Swaying Wheat / Crop Silhouette Band */}
      <div className="nature-bottom-crop-band">
        <svg
          className="nature-crops-svg"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Back Soft Rolling Hill */}
          <path
            d="M0,130 C320,80 540,160 880,100 C1140,50 1320,110 1440,90 L1440,220 L0,220 Z"
            fill="url(#natureHillGradBack)"
            opacity="0.5"
          />

          {/* Front Rolling Hill */}
          <path
            d="M0,160 C260,120 620,180 960,140 C1220,110 1380,150 1440,135 L1440,220 L0,220 Z"
            fill="url(#natureHillGradFront)"
            opacity="0.85"
          />

          {/* Stalks of Wheat / Crops Swaying in Wind */}
          <g className="nature-swaying-crops">
            {[
              { x: 45, h: 75, d: '0s' },
              { x: 85, h: 90, d: '0.6s' },
              { x: 140, h: 80, d: '1.2s' },
              { x: 195, h: 95, d: '0.3s' },
              { x: 260, h: 85, d: '1.7s' },
              { x: 320, h: 100, d: '0.9s' },
              { x: 380, h: 75, d: '1.4s' },
              { x: 440, h: 90, d: '0.2s' },
              { x: 510, h: 85, d: '1.9s' },
              { x: 575, h: 98, d: '0.8s' },
              { x: 640, h: 78, d: '1.5s' },
              { x: 710, h: 92, d: '0.4s' },
              { x: 780, h: 88, d: '1.8s' },
              { x: 850, h: 96, d: '1.1s' },
              { x: 920, h: 82, d: '0.5s' },
              { x: 990, h: 94, d: '1.6s' },
              { x: 1060, h: 86, d: '0.7s' },
              { x: 1130, h: 95, d: '1.3s' },
              { x: 1200, h: 80, d: '0.2s' },
              { x: 1270, h: 92, d: '1.7s' },
              { x: 1340, h: 84, d: '0.9s' },
              { x: 1400, h: 90, d: '1.4s' },
            ].map((stalk, idx) => (
              <g
                key={idx}
                className="nature-wheat-stalk"
                style={{
                  transformOrigin: `${stalk.x}px 200px`,
                  animationDelay: stalk.d,
                }}
              >
                {/* Stem */}
                <path
                  d={`M${stalk.x},200 Q${stalk.x + 4},${200 - stalk.h / 2} ${stalk.x + 2},${200 - stalk.h}`}
                  stroke="#34d399"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                {/* Wheat Head Grains */}
                <ellipse
                  cx={stalk.x + 2}
                  cy={200 - stalk.h - 8}
                  rx="4.5"
                  ry="9"
                  fill="#fbbf24"
                  opacity="0.8"
                />
                <ellipse
                  cx={stalk.x - 3}
                  cy={200 - stalk.h + 2}
                  rx="3.5"
                  ry="6"
                  fill="#f59e0b"
                  opacity="0.75"
                />
                <ellipse
                  cx={stalk.x + 7}
                  cy={200 - stalk.h + 2}
                  rx="3.5"
                  ry="6"
                  fill="#f59e0b"
                  opacity="0.75"
                />
                <path
                  d={`M${stalk.x + 2},${200 - stalk.h - 17} L${stalk.x + 1},${200 - stalk.h - 26}`}
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
              </g>
            ))}
          </g>

          <defs>
            <linearGradient id="natureHillGradBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14532d" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#052e16" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="natureHillGradFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#166534" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
