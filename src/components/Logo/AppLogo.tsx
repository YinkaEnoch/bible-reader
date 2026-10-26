import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`app-logo-box ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.26)}px`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(11, 19, 41, 0.4), 0 0 12px rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        flexShrink: 0,
        ...style,
      }}
      title="Bible Reader"
    >
      <img
        src="/icons/icon-192.png"
        alt="Bible Reader Logo"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        onError={(e) => {
          // Fallback to SVG if png not yet loaded
          (e.currentTarget as HTMLImageElement).src = '/icons/icon.svg';
        }}
      />
    </div>
  );
};
