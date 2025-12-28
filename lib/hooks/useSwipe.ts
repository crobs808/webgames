/**
 * Custom React hooks for touch and swipe interactions
 */

import { useEffect, useRef, RefObject } from 'react';
import { SwipeEvent, createTouchHandlers } from '../touchUtils';

export interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: (x: number, y: number) => void;
  onTouchStart?: (x: number, y: number) => void;
  onTouchMove?: (x: number, y: number) => void;
  onTouchEnd?: (x: number, y: number) => void;
}

/**
 * Hook for handling swipe gestures on a ref element
 */
export function useSwipe<T extends HTMLElement>(
  ref: RefObject<T>,
  options: UseSwipeOptions
) {
  const optionsRef = useRef(options);
  
  // Keep options up to date
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handlers = createTouchHandlers({
      onSwipe: (swipe: SwipeEvent) => {
        const opts = optionsRef.current;
        switch (swipe.direction) {
          case 'left':
            opts.onSwipeLeft?.();
            break;
          case 'right':
            opts.onSwipeRight?.();
            break;
          case 'up':
            opts.onSwipeUp?.();
            break;
          case 'down':
            opts.onSwipeDown?.();
            break;
        }
      },
      onTap: optionsRef.current.onTap,
      onTouchStart: optionsRef.current.onTouchStart,
      onTouchMove: optionsRef.current.onTouchMove,
      onTouchEnd: optionsRef.current.onTouchEnd,
    });

    element.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handlers.handleTouchMove, { passive: false });
    element.addEventListener('touchend', handlers.handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handlers.handleTouchStart);
      element.removeEventListener('touchmove', handlers.handleTouchMove);
      element.removeEventListener('touchend', handlers.handleTouchEnd);
    };
  }, [ref]);
}

/**
 * Hook for handling touch drag on canvas for paddle/slider controls
 */
export function useTouchDrag<T extends HTMLElement>(
  ref: RefObject<T>,
  onDrag: (x: number, y: number) => void
) {
  const onDragRef = useRef(onDrag);

  useEffect(() => {
    onDragRef.current = onDrag;
  }, [onDrag]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isDragging = false;

    const handlers = createTouchHandlers({
      onTouchStart: (x, y) => {
        isDragging = true;
        onDragRef.current(x, y);
      },
      onTouchMove: (x, y) => {
        if (isDragging) {
          onDragRef.current(x, y);
        }
      },
      onTouchEnd: () => {
        isDragging = false;
      },
    });

    element.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handlers.handleTouchMove, { passive: false });
    element.addEventListener('touchend', handlers.handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handlers.handleTouchStart);
      element.removeEventListener('touchmove', handlers.handleTouchMove);
      element.removeEventListener('touchend', handlers.handleTouchEnd);
    };
  }, [ref]);
}
