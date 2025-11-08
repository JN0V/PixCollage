# Changelog

All notable changes to PixCollage will be documented in this file.

## [1.1.0] - 2025-11-08

Major UX improvements for mobile and desktop.

### Added

**Canvas Size Selection**
- 7 predefined canvas formats (Instagram Post/Story, Facebook, Portrait, Landscape, Square, Default)
- Canvas selector in top-right corner
- Size indicator badge shows dimensions and zoom percentage
- Fixed canvas size (no longer auto-resizes on rotation)

**Zoom Controls**
- Zoom in/out buttons (20% to 200% range)
- Reset to 100% (1:1)
- Fit to screen (automatic best zoom)
- Zoom controls floating on left side
- Real-time zoom percentage display

**Responsiveness Improvements**
- Portrait/landscape mode detection
- Mobile toolbar adapts to orientation:
  - Portrait: bottom bar (3 columns)
  - Paysage: right sidebar (2 columns)
- Collapsible mobile toolbar with expand/collapse buttons
- Desktop sidebar hidden on mobile devices

**Canvas Visibility**
- Visible indigo border (4px) around canvas
- Canvas dimensions badge always visible
- Zoom percentage in real-time
- Clear delimitation of work area

**UX Fixes**
- Buttons moved below notch/camera area (safe zone)
- Fixed touch target accessibility on Pixel 9
- Improved mobile toolbar placement

**Filter Performance**
- Filters remain visible during manipulation
- Debounce optimization (300ms)
- No clearCache during drag/transform
- Smooth filter application

### Changed
- Default canvas size: 1080×1080 (Instagram square)
- Canvas no longer auto-resizes on device rotation
- Mobile toolbar can be hidden for full canvas access

### Fixed
- Filters disappearing when moving images
- Buttons hidden by device notch/camera
- Canvas limits not visible
- Mobile toolbar blocking canvas access

## [1.0.0] - 2025-01-07

Initial release of PixCollage - a modern, mobile-first photo collage application.

### Features

**Image Management**
- Add images via drag-and-drop or file picker
- Crop, rotate, and resize images
- Full transform controls (move, scale, rotate)
- Layer management (send forward/backward, delete)

**Filters & Effects** (Images only)
- Brightness (-100 to +100)
- Contrast (-100 to +100)
- Saturation (-100 to +100)
- Blur (0-20px)
- Grayscale (toggle)
- Sepia (toggle)

**Text & Emojis**
- Add editable text elements
  - Double-tap (mobile) or double-click (desktop) to edit
  - Edit button in mobile toolbar
  - Full transform controls
- 500+ emojis organized by categories
  - Smileys, hearts, animals, food, activities, travel, objects, symbols
  - Comprehensive scrollable picker
  - Full transform controls

**Internationalization**
- Auto-detection of browser/system language
- Manual language switcher
- Supported languages: English (en), French (fr)
- All UI elements fully translated

**Export**
- High-quality PNG export (2x pixel ratio)
- Export full canvas or content only
- Share functionality on mobile devices
- Download on desktop

**Mobile Optimization**
- Touch gestures support
- 2-row toolbar layout for better readability
- Context-aware actions based on selected element
- Optimized performance for mobile devices

### Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Canvas**: Konva + react-konva
- **Styling**: TailwindCSS
- **i18n**: i18next + react-i18next
- **Mobile**: Capacitor (Android)
- **Build**: Vite with Rolldown
