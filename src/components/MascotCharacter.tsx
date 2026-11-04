import React from 'react';

interface MascotCharacterProps {
  className?: string;
  size?: number;
}

/**
 * Clean, minimal, cute vector mascot figure.
 * Pure transparent figure, zero background box/frame, friendly expression with waving hand.
 */
export const MascotCharacter: React.FC<MascotCharacterProps> = ({
  className = '',
  size = 42,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-visible transition-transform duration-200 hover:scale-108 active:scale-95 ${className}`}
    >
      <defs>
        <linearGradient id="figureBodyGrad" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="earphonesGrad" x1="15" y1="20" x2="85" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Headphone Arc */}
      <path
        d="M23 44 C 21 16, 79 16, 77 44"
        stroke="url(#earphonesGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cute Antennas */}
      <line x1="36" y1="22" x2="31" y2="12" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="11" r="3.2" fill="#22d3ee" />

      <line x1="64" y1="22" x2="69" y2="12" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="11" r="3.2" fill="#22d3ee" />

      {/* Ear Cups */}
      <rect x="18" y="38" width="8" height="15" rx="4" fill="#1d4ed8" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="74" y="38" width="8" height="15" rx="4" fill="#1d4ed8" stroke="#38bdf8" strokeWidth="1.5" />

      {/* Cute Body */}
      <rect
        x="30"
        y="62"
        width="40"
        height="26"
        rx="13"
        fill="url(#figureBodyGrad)"
      />
      {/* Belly Play Button / Heart */}
      <path
        d="M48 71 L 55 75 L 48 79 Z"
        fill="#ffffff"
      />

      {/* Feet */}
      <ellipse cx="40" cy="88" rx="6" ry="4" fill="#1e3a8a" />
      <ellipse cx="60" cy="88" rx="6" ry="4" fill="#1e3a8a" />

      {/* Left Arm (Relaxed) */}
      <path
        d="M30 68 Q 23 74 27 80"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="27" cy="80" r="3" fill="#38bdf8" />

      {/* Right Arm: Playful Waving Hand */}
      <path
        d="M70 68 Q 80 62 82 50"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="82" cy="49" r="4.5" fill="#38bdf8" />

      {/* Friendly Head */}
      <circle cx="50" cy="43" r="23" fill="url(#figureBodyGrad)" />

      {/* Eyes: Happy Curved / Kawaii */}
      <circle cx="41" cy="41" r="3.8" fill="#0f172a" />
      <circle cx="42.5" cy="39.8" r="1.4" fill="#ffffff" />

      <circle cx="59" cy="41" r="3.8" fill="#0f172a" />
      <circle cx="60.5" cy="39.8" r="1.4" fill="#ffffff" />

      {/* Cute Cheek Blushes */}
      <circle cx="35" cy="47" r="2.8" fill="#f43f5e" opacity="0.5" />
      <circle cx="65" cy="47" r="2.8" fill="#f43f5e" opacity="0.5" />

      {/* Big Friendly Smile :D */}
      <path
        d="M44 47 Q 50 54 56 47"
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
