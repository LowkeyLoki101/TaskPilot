import React from 'react';

interface LogoEmergentProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LogoEmergent({ className = '', size = 'md' }: LogoEmergentProps) {
  const dimensions = {
    sm: { height: 32, fontSize: 14 },
    md: { height: 40, fontSize: 16 },
    lg: { height: 48, fontSize: 20 }
  };

  const { height, fontSize } = dimensions[size];

  return (
    <div className={`flex items-center ${className}`} style={{ height }}>
      {/* EE Logo Mark */}
      <div className="relative mr-3" style={{ height, width: height * 1.2 }}>
        {/* Glow effect behind the logo */}
        <div className="absolute inset-0 blur-xl opacity-60">
          <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full" />
        </div>
        
        {/* The EE logo */}
        <svg
          viewBox="0 0 48 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full"
        >
          {/* First E - with three lines */}
          <g>
            {/* Three horizontal lines of the E */}
            <rect x="4" y="8" width="14" height="3" fill="url(#gradient1)" />
            <rect x="4" y="18.5" width="11" height="3" fill="url(#gradient1)" />
            <rect x="4" y="29" width="14" height="3" fill="url(#gradient1)" />
            
            {/* Vertical bar of the E */}
            <rect x="4" y="8" width="3" height="24" fill="url(#gradient1)" />
          </g>

          {/* Second E - stylized with glow */}
          <g transform="translate(20, 0)">
            {/* Three horizontal lines of the second E */}
            <rect x="4" y="8" width="14" height="3" fill="url(#gradient2)" />
            <rect x="4" y="18.5" width="11" height="3" fill="url(#gradient2)" />
            <rect x="4" y="29" width="14" height="3" fill="url(#gradient2)" />
            
            {/* Vertical bar of the second E */}
            <rect x="4" y="8" width="3" height="24" fill="url(#gradient2)" />
            
            {/* Lightning bolt accent */}
            <path 
              d="M 18 8 L 22 18 L 19 18 L 22 32 L 18 22 L 21 22 Z" 
              fill="url(#gradient3)"
              opacity="0.8"
            />
          </g>

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span 
          className="font-bold tracking-wider bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ fontSize: fontSize * 1.1, lineHeight: 1.2 }}
        >
          EMERGENT
        </span>
        <span 
          className="text-muted-foreground tracking-widest"
          style={{ fontSize: fontSize * 0.75, lineHeight: 1 }}
        >
          INTELLIGENCE
        </span>
      </div>
    </div>
  );
}