# PixCollage

A modern, mobile-first photo collage application built with React, TypeScript, and Konva.

## Features

- 📸 **Image Management**: Add, crop, rotate, and resize images
- 🎨 **Filters & Effects**: Apply brightness, contrast, saturation, blur, grayscale, and sepia
- ✏️ **Text & Emojis**: Add customizable text and 500+ emojis to your collages
- 🌍 **Internationalization**: Full support for English and French
- 📱 **Mobile-First**: Optimized UI for mobile devices with touch gestures
- 💾 **Export**: Export your collages as high-quality PNG images
- 🎯 **Layer Management**: Control z-order (send forward/backward)

## Tech Stack

- **React** 18 + **TypeScript** - Modern UI framework with type safety
- **Vite** - Lightning-fast build tool
- **Konva** + **react-konva** - Canvas manipulation and rendering
- **TailwindCSS** - Utility-first CSS framework
- **i18next** - Internationalization framework
- **Capacitor** - Native mobile app capabilities
- **React Dropzone** - Drag-and-drop file uploads

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Android SDK (for mobile build)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Mobile Build (Android)

```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Build APK
cd android && ./gradlew assembleDebug

# Install on device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Project Structure

```
src/
├── components/
│   └── PixCollage.tsx      # Main collage component
├── i18n/
│   ├── config.ts           # i18next configuration
│   └── locales/            # Translation files (en, fr)
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions

resources/
└── icon.svg               # App icon

android/                   # Android native project
```

## Key Features Details

### Canvas Elements

The application supports three types of elements:
- **Images**: Full editing capabilities (crop, filters, transforms)
- **Text**: Editable text with custom styling
- **Emojis**: 500+ emojis as decorative elements

### Filters

Available filters for images:
- Brightness (-100 to +100)
- Contrast (-100 to +100)
- Saturation (-100 to +100)
- Blur (0-20px)
- Grayscale (toggle)
- Sepia (toggle)

### Internationalization

- Auto-detection of browser/system language
- Manual language switcher
- Supported languages: English (en), French (fr)
- All UI elements fully translated

## License

MIT License - See LICENSE file for details
