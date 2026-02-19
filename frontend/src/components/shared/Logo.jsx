import React from "react";

const Logo = ({ size = 40, showText = false, className = "", textColor = "var(--color-primary-dark)" }) => {
  return (
    <div className={`logo-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="premium-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Ring - Dynamic Fragment */}
        <path
          d="M60 160 A 80 80 0 1 1 160 160"
          fill="none"
          stroke="url(#mainGradient)"
          strokeWidth="24"
          strokeLinecap="round"
        />

        {/* Inner 'S' Curve - Representing Flow */}
        <path
          d="M80 80 C 100 60, 140 100, 120 140"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#premium-glow)"
        />

        {/* The 'Q' Tail - Sharp Edge */}
        <path
          d="M145 145 L185 185"
          stroke="#2563EB"
          strokeWidth="24"
          strokeLinecap="round"
        />

        {/* Professional Accents */}
        <circle cx="100" cy="100" r="10" fill="#2563EB" />
        <circle cx="180" cy="20" r="8" fill="#60A5FA" opacity="0.4" />
      </svg>
      {showText && (
        <span style={{
          fontSize: `${size * 0.5}px`,
          fontWeight: '900',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.05em',
          background: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingLeft: '2px'
        }}>
          Smart'Q
        </span>
      )}
    </div>
  );
};

export default Logo;
