import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Hook to detect and provide safe area insets for:
 * - iOS notch and home indicator
 * - Android 3-button navigation bar
 * - Android gesture navigation
 */
export const useSafeArea = (): SafeAreaInsets => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      // Get CSS environment variables for safe area
      const computedStyle = getComputedStyle(document.documentElement);
      
      // Parse safe area inset values
      const parseInset = (value: string): number => {
        const match = value.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      // Try to get from CSS env() variables
      const safeTop = parseInset(computedStyle.getPropertyValue('--safe-area-top') || '0');
      const safeRight = parseInset(computedStyle.getPropertyValue('--safe-area-right') || '0');
      const safeBottom = parseInset(computedStyle.getPropertyValue('--safe-area-bottom') || '0');
      const safeLeft = parseInset(computedStyle.getPropertyValue('--safe-area-left') || '0');

      // Fallback: detect Android navigation bar height
      // On Android with 3-button nav, window.innerHeight is smaller than screen.height
      const screenHeight = window.screen.height;
      const windowHeight = window.innerHeight;
      const navBarHeight = Math.max(0, screenHeight - windowHeight - (safeTop || 0));
      
      // Use detected nav bar height if no safe-area-inset-bottom is set
      const bottomInset = safeBottom > 0 ? safeBottom : (navBarHeight > 20 ? navBarHeight : 0);

      setInsets({
        top: safeTop,
        right: safeRight,
        bottom: bottomInset,
        left: safeLeft,
      });
    };

    // Initial update
    updateInsets();

    // Update on resize (orientation change, keyboard, etc.)
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    // Also check when the page becomes visible (in case of Android nav changes)
    document.addEventListener('visibilitychange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
      document.removeEventListener('visibilitychange', updateInsets);
    };
  }, []);

  return insets;
};
