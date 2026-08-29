'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarRendererProps {
  avatarUrl?: string;
  fullName?: string;
  size?: number | string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: number;
  className?: string;
  fallbackBg?: string;
  fallbackTextColor?: string;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatarUrl,
  fullName = 'User',
  size = 88,
  borderRadius = '9999px',
  borderColor = '#e2e8f0',
  borderWidth = 2,
  className = '',
  fallbackBg = '#f1f5f9',
  fallbackTextColor = '#475569',
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name: string): string => {
    if (!name) return 'CV';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const dimensionStyle = typeof size === 'number' ? { width: size, height: size } : { width: size, height: size };

  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center select-none shadow-sm ${className}`}
      style={{
        ...dimensionStyle,
        borderRadius,
        border: `${borderWidth}px solid ${borderColor}`,
        backgroundColor: fallbackBg,
      }}
    >
      {avatarUrl && !hasError ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center font-bold tracking-wider"
          style={{ color: fallbackTextColor }}
        >
          {fullName ? (
            <span className="text-[16px] font-black uppercase">{getInitials(fullName)}</span>
          ) : (
            <User className="w-1/2 h-1/2 opacity-70" />
          )}
        </div>
      )}
    </div>
  );
};
