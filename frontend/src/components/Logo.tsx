import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, showText = true, textColor, className = '' }) => {
  return (
    <span className={`d-inline-flex align-items-center gap-2 ${className}`} style={{ textDecoration: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SplitHive logo"
      >
        {/* Hexagon — hive cell */}
        <polygon
          points="20,2 35,10.5 35,29.5 20,38 5,29.5 5,10.5"
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="1.5"
        />
        {/* Split / fork symbol — one path divides into two */}
        <path
          d="M20 26 L20 20 M20 20 L14 13 M20 20 L26 13"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small circle at the merge point */}
        <circle cx="20" cy="20" r="1.8" fill="white" />
      </svg>
      {showText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: size * 0.5,
            letterSpacing: '-0.5px',
            color: textColor || 'inherit',
            lineHeight: 1,
          }}
        >
          Split<span style={{ color: '#f59e0b' }}>Hive</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
