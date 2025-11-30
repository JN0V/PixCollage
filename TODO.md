# TODO - Future Optimizations

## Performance Optimizations (Not Yet Needed)

These optimizations are documented for future reference if performance becomes an issue with larger collages:

### 1. Virtualization
- **What**: Only render zones/elements visible in the current viewport
- **When**: If zoom < 100% with many off-screen elements
- **Impact**: High for very large canvases

### 2. Web Workers for Image Processing
- **What**: Move crop, filter, and export operations to a Web Worker
- **When**: If image processing blocks the UI
- **Implementation**: Use `OffscreenCanvas` in a worker thread
- **Impact**: Eliminates UI freezes during heavy image operations

### 3. OffscreenCanvas for Filters
- **What**: Apply filters using OffscreenCanvas instead of Konva filters
- **When**: If filter preview is laggy
- **Impact**: Better real-time filter preview performance

### 4. HashMap Index for Elements
- **What**: Maintain a `Map<id, element>` alongside the elements array
- **When**: If element count exceeds 500+
- **Current**: O(n) lookups are fast enough for typical use (< 50 elements)
- **Impact**: O(1) lookups, but adds sync complexity

### 5. Lazy Loading for Grid Templates
- **What**: Load grid template previews on demand
- **When**: If grid selector modal is slow to open
- **Impact**: Faster initial modal render

## Current Optimizations (v1.2.1)

✅ All components memoized with `React.memo()`
✅ Callbacks memoized with `useCallback()`
✅ Expensive calculations memoized with `useMemo()`
✅ Safe area detection for Android navigation bar
✅ Clip path points pre-calculated and cached

## Notes

- Current complexity: O(n) for element searches, O(zones) for rendering
- These are acceptable for typical use cases (< 50 elements, < 20 zones)
- Focus optimizations on actual bottlenecks, not theoretical ones
