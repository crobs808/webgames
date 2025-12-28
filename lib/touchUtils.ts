/**
 * Touch and Swipe Utilities for Mobile Game Controls
 */

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isActive: boolean;
}

const SWIPE_THRESHOLD = 30; // Minimum distance for a swipe
const TAP_THRESHOLD = 10; // Maximum movement for a tap
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity for a swipe

/**
 * Detect swipe direction and distance from touch events
 */
export function detectSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  startTime: number,
  endTime: number
): SwipeEvent | null {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const duration = endTime - startTime;
  const velocity = distance / duration;

  // Check if movement is significant enough
  if (distance < SWIPE_THRESHOLD || velocity < SWIPE_VELOCITY_THRESHOLD) {
    return null;
  }

  // Determine primary direction
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  let direction: SwipeDirection;
  if (absDeltaX > absDeltaY) {
    direction = deltaX > 0 ? 'right' : 'left';
  } else {
    direction = deltaY > 0 ? 'down' : 'up';
  }

  return {
    direction,
    distance,
    duration,
    startX,
    startY,
    endX,
    endY,
  };
}

/**
 * Check if the touch was a tap (minimal movement)
 */
export function isTap(startX: number, startY: number, endX: number, endY: number): boolean {
  const deltaX = Math.abs(endX - startX);
  const deltaY = Math.abs(endY - startY);
  return deltaX < TAP_THRESHOLD && deltaY < TAP_THRESHOLD;
}

/**
 * Get touch position relative to an element
 */
export function getTouchPosition(touch: Touch, element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

/**
 * Normalize touch coordinates for canvas scaling
 */
export function normalizeTouchCoordinates(
  touch: Touch,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  };
}

/**
 * Create touch event handlers for a canvas or element
 */
export function createTouchHandlers(callbacks: {
  onSwipe?: (swipe: SwipeEvent) => void;
  onTap?: (x: number, y: number) => void;
  onTouchStart?: (x: number, y: number) => void;
  onTouchMove?: (x: number, y: number) => void;
  onTouchEnd?: (x: number, y: number) => void;
}) {
  let touchState: TouchState | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const target = e.currentTarget as HTMLElement;
    const pos = getTouchPosition(touch, target);

    touchState = {
      startX: pos.x,
      startY: pos.y,
      startTime: Date.now(),
      isActive: true,
    };

    if (callbacks.onTouchStart) {
      callbacks.onTouchStart(pos.x, pos.y);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!touchState || !touchState.isActive) return;

    const touch = e.touches[0];
    const target = e.currentTarget as HTMLElement;
    const pos = getTouchPosition(touch, target);

    if (callbacks.onTouchMove) {
      callbacks.onTouchMove(pos.x, pos.y);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (!touchState || !touchState.isActive) return;

    const touch = e.changedTouches[0];
    const target = e.currentTarget as HTMLElement;
    const pos = getTouchPosition(touch, target);
    const endTime = Date.now();

    // Check for tap
    if (isTap(touchState.startX, touchState.startY, pos.x, pos.y)) {
      if (callbacks.onTap) {
        callbacks.onTap(pos.x, pos.y);
      }
    } else {
      // Check for swipe
      const swipe = detectSwipe(
        touchState.startX,
        touchState.startY,
        pos.x,
        pos.y,
        touchState.startTime,
        endTime
      );
      if (swipe && callbacks.onSwipe) {
        callbacks.onSwipe(swipe);
      }
    }

    if (callbacks.onTouchEnd) {
      callbacks.onTouchEnd(pos.x, pos.y);
    }

    touchState = null;
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
