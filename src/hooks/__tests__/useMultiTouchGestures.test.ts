import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useMultiTouchGestures } from '../useMultiTouchGestures';
import Konva from 'konva';

describe('useMultiTouchGestures', () => {
  let mockNode: Record<string, Mock>;
  let mockLayer: Record<string, Mock>;
  let nodeRef: React.RefObject<Konva.Image>;
  let onTransformEnd: Mock;

  beforeEach(() => {
    // Mock Konva node
    mockLayer = {
      batchDraw: vi.fn(),
    };

    mockNode = {
      x: vi.fn().mockReturnValue(100),
      y: vi.fn().mockReturnValue(100),
      scaleX: vi.fn().mockReturnValue(1),
      scaleY: vi.fn().mockReturnValue(1),
      rotation: vi.fn().mockReturnValue(0),
      getLayer: vi.fn().mockReturnValue(mockLayer),
    };

    nodeRef = { current: mockNode as unknown as Konva.Image } as React.RefObject<Konva.Image>;
    onTransformEnd = vi.fn();
  });

  describe('Multi-touch state management', () => {
    it('should activate multi-touch when 2 fingers touch', () => {
      const { result } = renderHook(() =>
        useMultiTouchGestures({
          nodeRef,
          onTransformEnd,
          snapRotation: false,
          enabled: true,
        })
      );

      expect(result.current.isMultiTouchActive).toBe(false);

      // Simulate 2-finger touch
      const touchEvent = {
        evt: {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
          preventDefault: vi.fn(),
        },
        cancelBubble: false,
      } as any;

      act(() => {
        result.current.handlers.onTouchStart(touchEvent);
      });

      expect(result.current.isMultiTouchActive).toBe(true);
    });

    it('should deactivate multi-touch when going below 2 fingers', () => {
      const { result } = renderHook(() =>
        useMultiTouchGestures({
          nodeRef,
          onTransformEnd,
          snapRotation: false,
          enabled: true,
        })
      );

      // Start with 2 fingers
      const touchStartEvent = {
        evt: {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
          preventDefault: vi.fn(),
        },
        cancelBubble: false,
      } as any;

      act(() => {
        result.current.handlers.onTouchStart(touchStartEvent);
      });

      expect(result.current.isMultiTouchActive).toBe(true);

      // Lift one finger (1 finger remaining)
      const touchEndEvent = {
        evt: {
          touches: [{ clientX: 100, clientY: 100 }],
        },
      } as any;

      act(() => {
        result.current.handlers.onTouchEnd(touchEndEvent);
      });

      // Multi-touch should be deactivated immediately
      expect(result.current.isMultiTouchActive).toBe(false);
      expect(onTransformEnd).toHaveBeenCalled();
    });

    it('should allow drag after multi-touch ends', () => {
      const { result } = renderHook(() =>
        useMultiTouchGestures({
          nodeRef,
          onTransformEnd,
          snapRotation: false,
          enabled: true,
        })
      );

      // Multi-touch sequence
      const touchStart2Fingers = {
        evt: {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
          preventDefault: vi.fn(),
        },
        cancelBubble: false,
      } as any;

      act(() => {
        result.current.handlers.onTouchStart(touchStart2Fingers);
      });

      // Lift one finger
      const touchEnd1Finger = {
        evt: {
          touches: [{ clientX: 100, clientY: 100 }],
        },
      } as any;

      act(() => {
        result.current.handlers.onTouchEnd(touchEnd1Finger);
      });

      // After multi-touch ends, should be ready for drag
      expect(result.current.isMultiTouchActive).toBe(false);

      // New single touch should work (drag)
      const touchStart1Finger = {
        evt: {
          touches: [{ clientX: 150, clientY: 150 }],
          preventDefault: vi.fn(),
        },
        cancelBubble: false,
      } as any;

      act(() => {
        result.current.handlers.onTouchStart(touchStart1Finger);
      });

      // Should NOT activate multi-touch for single finger
      expect(result.current.isMultiTouchActive).toBe(false);
    });

    it('should snap rotation when enabled', () => {
      const { result } = renderHook(() =>
        useMultiTouchGestures({
          nodeRef,
          onTransformEnd,
          snapRotation: true,
          enabled: true,
        })
      );

      mockNode.rotation.mockReturnValue(85); // Close to 90 (within 15°)

      // Start and end multi-touch
      const touchStart = {
        evt: {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
          preventDefault: vi.fn(),
        },
        cancelBubble: false,
      } as unknown as Konva.KonvaEventObject<TouchEvent>;

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      const touchEnd = {
        evt: {
          touches: [],
        },
      } as unknown as Konva.KonvaEventObject<TouchEvent>;

      act(() => {
        result.current.handlers.onTouchEnd(touchEnd);
      });

      // Should have snapped rotation to 90 (snap angles are 0, 90, 180, 270, 360)
      expect(mockNode.rotation).toHaveBeenCalledWith(90);
    });
  });

  describe('Edge cases', () => {
    it('should not activate when disabled', () => {
      const { result } = renderHook(() =>
        useMultiTouchGestures({
          nodeRef,
          onTransformEnd,
          snapRotation: false,
          enabled: false,
        })
      );

      const touchEvent = {
        evt: {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
          preventDefault: vi.fn(),
        },
        cancelBubble: false,
      } as any;

      act(() => {
        result.current.handlers.onTouchStart(touchEvent);
      });

      expect(result.current.isMultiTouchActive).toBe(false);
    });

    it('should handle null nodeRef gracefully', () => {
      const nullRef = { current: null };

      const { result } = renderHook(() =>
        useMultiTouchGestures({
          nodeRef: nullRef as any,
          onTransformEnd,
          snapRotation: false,
          enabled: true,
        })
      );

      const touchEvent = {
        evt: {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
          preventDefault: vi.fn(),
        },
        cancelBubble: false,
      } as any;

      expect(() => {
        act(() => {
          result.current.handlers.onTouchStart(touchEvent);
        });
      }).not.toThrow();
    });
  });
});
