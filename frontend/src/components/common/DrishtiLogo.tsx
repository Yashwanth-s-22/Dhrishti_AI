import React from 'react';

interface DrishtiLogoProps {
  size?: number;
  className?: string;
}

export const DrishtiLogo: React.FC<DrishtiLogoProps> = ({ size = 22, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Cyan to Emerald lens gradient representing foresight */}
        <linearGradient id="drishti-lens" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Golden wheat grain gradient representing agricultural resilience */}
        <linearGradient id="drishti-grain" x1="12" y1="4" x2="12" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#facc15" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Subtle glow filter */}
        <filter id="drishti-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Eye / Strategic Vision Arcs (Drishti) */}
      <path
        d="M2.5 12C5.8 6.8 8.8 4.5 12 4.5C15.2 4.5 18.2 6.8 21.5 12C18.2 17.2 15.2 19.5 12 19.5C8.8 19.5 5.8 17.2 2.5 12Z"
        stroke="url(#drishti-lens)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-95"
      />

      {/* Iris Horizon Guide */}
      <circle
        cx="12"
        cy="12"
        r="4.8"
        stroke="#38bdf8"
        strokeWidth="0.9"
        strokeDasharray="1.5 1.5"
        className="opacity-40"
      />

      {/* Central Agricultural Wheat Stalk rising through the Pupil */}
      {/* Central Stem */}
      <path
        d="M12 18.5V6.5"
        stroke="url(#drishti-grain)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Topmost Grain Awn / Tip */}
      <path
        d="M12 4.8L12 6.5"
        stroke="#fef08a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Upper Wheat Grains */}
      <path
        d="M12 8C10.6 6.8 9.4 7.4 9.4 8.7C9.4 9.7 10.6 10.1 12 10.1"
        fill="url(#drishti-grain)"
      />
      <path
        d="M12 8C13.4 6.8 14.6 7.4 14.6 8.7C14.6 9.7 13.4 10.1 12 10.1"
        fill="url(#drishti-grain)"
      />

      {/* Mid Wheat Grains */}
      <path
        d="M12 11.2C10.3 10 8.8 10.7 8.8 12.1C8.8 13.2 10.3 13.7 12 13.7"
        fill="url(#drishti-grain)"
      />
      <path
        d="M12 11.2C13.7 10 15.2 10.7 15.2 12.1C15.2 13.2 13.7 13.7 12 13.7"
        fill="url(#drishti-grain)"
      />

      {/* Lower Wheat Grains */}
      <path
        d="M12 14.5C10.7 13.6 9.6 14.1 9.6 15.1C9.6 15.9 10.7 16.3 12 16.3"
        fill="url(#drishti-grain)"
      />
      <path
        d="M12 14.5C13.3 13.6 14.4 14.1 14.4 15.1C14.4 15.9 13.3 16.3 12 16.3"
        fill="url(#drishti-grain)"
      />

      {/* Core Optical Focus Point (Foresight Iris) */}
      <circle cx="12" cy="12" r="1.3" fill="#22d3ee" filter="url(#drishti-glow)" />
    </svg>
  );
};
