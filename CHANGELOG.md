# Changelog

All notable changes to PixCollage will be documented in this file.

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
