import React from 'react';

interface OpenLipiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const OpenLipiLogo: React.FC<OpenLipiLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-white',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-sm font-semibold tracking-tight' },
    md: { box: 'w-8 h-8', text: 'text-base font-semibold tracking-tight' },
    lg: { box: 'w-12 h-12', text: 'text-2xl font-bold tracking-tight' },
    xl: { box: 'w-20 h-20', text: 'text-4xl font-extrabold tracking-tight' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Emblem */}
      <svg
        viewBox="0 0 512 512"
        className={`${current.box} shrink-0 drop-shadow-sm select-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="logoPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Shield background */}
        <rect width="512" height="512" rx="112" fill="url(#logoBgGrad)" />
        <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#f59e0b" strokeWidth="6" strokeOpacity="0.4" />

        {/* Script Page Behind */}
        <g transform="translate(136, 96)">
          <rect x="24" y="-8" width="216" height="300" rx="12" fill="#334155" opacity="0.6" transform="rotate(6, 132, 142)" />
          <rect x="0" y="0" width="240" height="320" rx="14" fill="url(#logoPageGrad)" />
          {/* Fastener brads */}
          <circle cx="28" cy="48" r="6" fill="#94a3b8" />
          <circle cx="28" cy="160" r="6" fill="#94a3b8" />
          <circle cx="28" cy="272" r="6" fill="#94a3b8" />
          {/* Script lines */}
          <rect x="56" y="44" width="140" height="8" rx="4" fill="#0f172a" />
          <rect x="56" y="66" width="160" height="6" rx="3" fill="#64748b" />
          <rect x="56" y="78" width="144" height="6" rx="3" fill="#64748b" />
          <rect x="100" y="102" width="72" height="7" rx="3.5" fill="#0f172a" />
          <rect x="76" y="117" width="120" height="6" rx="3" fill="#64748b" />
        </g>

        {/* Golden Nib Lipi Emblem */}
        <g transform="translate(256, 300)">
          <path d="M 0,-150 L 54,-40 L 40,70 L -40,70 L -54,-40 Z" fill="url(#logoGoldGrad)" />
          <path d="M 0,-150 L 54,-40 L 44,-36 L 0,-140 L -44,-36 L -54,-40 Z" fill="#fef3c7" opacity="0.8" />
          <circle cx="0" cy="-35" r="9" fill="#0f172a" />
          <line x1="0" y1="-150" x2="0" y2="-26" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M -26,16 Q 0,-2 26,16" fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
          <rect x="-34" y="70" width="68" height="24" rx="6" fill="#0f172a" stroke="#d97706" strokeWidth="3" />
        </g>

        {/* Cinema Clapper bottom bar */}
        <g transform="translate(146, 420)">
          <rect x="0" y="0" width="220" height="20" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
          <path d="M 20,2 L 35,18 M 55,2 L 70,18 M 90,2 L 105,18 M 125,2 L 140,18 M 160,2 L 175,18 M 195,2 L 210,18" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>

      {/* Wordmark */}
      {showText && (
        <span className={`${current.text} ${textColor} flex items-center`}>
          <span>Open</span>
          <span className="text-amber-400 font-bold ml-0.5">Lipi</span>
        </span>
      )}
    </div>
  );
};
