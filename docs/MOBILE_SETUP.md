# Mobile Packaging with Capacitor

This project can be embedded into native shells using Capacitor.

## 1) Install dependencies

```bash
npm i @capacitor/core
npm i -D @capacitor/cli
```

Optionally add platforms:

```bash
npx cap add android
npx cap add ios
```

## 2) Configuration

A `capacitor.config.ts` is provided at repo root:

```ts
const config = {
  appId: 'com.jn0v.pixcollage',
  appName: 'Pix Collage',
  webDir: 'dist',
  server: { androidScheme: 'https' },
};
export default config;
```

Vite builds to `dist` by default. No extra config required.

## 3) Build and sync

```bash
npm run build
npx cap sync
```

## 4) Open native projects

```bash
npx cap open android
npx cap open ios
```

## Notes
- For mobile gestures, the canvas container disables browser gestures to improve UX.
- If you need file system or camera access later, install corresponding Capacitor plugins and request permissions in native projects.
- For production builds, run `npm run build` first, then `npx cap copy`/`npx cap sync`.
