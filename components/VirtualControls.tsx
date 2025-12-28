/**
 * Virtual on-screen buttons for mobile game controls
 */

'use client';

import { ReactNode } from 'react';

interface VirtualButtonProps {
  onPress: () => void;
  children: ReactNode;
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
}

export function VirtualButton({
  onPress,
  children,
  className = '',
  position = 'bottom-center',
  size = 'md',
}: VirtualButtonProps) {
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    onPress();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onPress();
  };

  const positionClasses = {
    'bottom-left': 'left-4 bottom-4',
    'bottom-right': 'right-4 bottom-4',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      className={`
        fixed z-10 
        ${positionClasses[position]} 
        ${sizeClasses[size]}
        bg-blue-500/80 hover:bg-blue-600/80 active:bg-blue-700/80
        rounded-full shadow-lg
        flex items-center justify-center
        font-bold text-white
        touch-none select-none
        transition-colors
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </button>
  );
}

interface VirtualDPadProps {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  position?: 'bottom-left' | 'bottom-right';
  visible?: boolean;
}

export function VirtualDPad({
  onUp,
  onDown,
  onLeft,
  onRight,
  position = 'bottom-left',
  visible = true,
}: VirtualDPadProps) {
  if (!visible) return null;

  const handleButtonPress = (callback?: () => void) => {
    if (callback) callback();
  };

  const positionClass = position === 'bottom-left' ? 'left-4 bottom-4' : 'right-4 bottom-4';

  return (
    <div className={`fixed z-10 ${positionClass} w-32 h-32 md:hidden`}>
      <div className="relative w-full h-full">
        {/* Up */}
        {onUp && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress(onUp);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress(onUp);
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-500/80 hover:bg-blue-600/80 active:bg-blue-700/80 rounded-full shadow-lg flex items-center justify-center touch-none select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="text-white font-bold">↑</span>
          </button>
        )}
        
        {/* Down */}
        {onDown && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress(onDown);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress(onDown);
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-500/80 hover:bg-blue-600/80 active:bg-blue-700/80 rounded-full shadow-lg flex items-center justify-center touch-none select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="text-white font-bold">↓</span>
          </button>
        )}
        
        {/* Left */}
        {onLeft && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress(onLeft);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress(onLeft);
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500/80 hover:bg-blue-600/80 active:bg-blue-700/80 rounded-full shadow-lg flex items-center justify-center touch-none select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="text-white font-bold">←</span>
          </button>
        )}
        
        {/* Right */}
        {onRight && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress(onRight);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress(onRight);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500/80 hover:bg-blue-600/80 active:bg-blue-700/80 rounded-full shadow-lg flex items-center justify-center touch-none select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="text-white font-bold">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
