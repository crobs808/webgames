/**
 * Utilities for responsive canvas sizing
 */

/**
 * Calculate responsive canvas dimensions based on viewport
 */
export function getResponsiveCanvasDimensions(
  maxWidth: number = 400,
  maxHeight: number = 400,
  aspectRatio: number = 1
): { width: number; height: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Leave some padding for UI elements
  const availableWidth = Math.min(viewportWidth * 0.9, maxWidth);
  const availableHeight = Math.min(viewportHeight * 0.7, maxHeight);
  
  // Calculate dimensions maintaining aspect ratio
  let width = availableWidth;
  let height = width / aspectRatio;
  
  if (height > availableHeight) {
    height = availableHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.floor(width), height: Math.floor(height) };
}

/**
 * Setup canvas for responsive rendering with proper pixel ratio
 */
export function setupResponsiveCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Get device pixel ratio for sharp rendering on retina displays
  const dpr = window.devicePixelRatio || 1;
  
  // Set display size (CSS pixels)
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  // Set actual size in memory (scaled to account for extra pixel density)
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Scale all drawing operations by the dpr
  ctx.scale(dpr, dpr);
  
  return ctx;
}

/**
 * Check if device is in portrait orientation
 */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

/**
 * Check if device is mobile-sized
 */
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}

/**
 * Get optimal canvas dimensions for current device
 */
export function getOptimalCanvasDimensions(): { width: number; height: number } {
  const isMobile = isMobileDevice();
  const portrait = isPortrait();
  
  if (isMobile) {
    if (portrait) {
      // Mobile portrait: smaller square or taller canvas
      return getResponsiveCanvasDimensions(350, 500, 0.8);
    } else {
      // Mobile landscape: wider canvas
      return getResponsiveCanvasDimensions(500, 300, 1.5);
    }
  } else {
    // Desktop/tablet: use standard dimensions
    return getResponsiveCanvasDimensions(400, 400, 1);
  }
}
