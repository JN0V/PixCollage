/**
 * Sticker assets as base64 data URIs for cross-platform compatibility
 */

export const STICKER_ASSETS: Record<string, string> = {
  'stars-group-1': `data:image/svg+xml;base64,${btoa(`<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path d="M 100 400 L 120 340 L 80 300 L 145 295 L 170 235 L 195 295 L 260 300 L 220 340 L 240 400 L 170 365 Z" 
        fill="#FFD700" stroke="#FFA500" stroke-width="3"/>
  <path d="M 380 120 L 390 90 L 370 70 L 403 67 L 415 40 L 427 67 L 460 70 L 440 90 L 450 120 L 415 100 Z" 
        fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
  <path d="M 120 80 L 125 65 L 115 55 L 132 53 L 138 40 L 144 53 L 161 55 L 151 65 L 156 80 L 138 68 Z" 
        fill="#FFEB3B" stroke="#FFA500" stroke-width="1.5"/>
  <path d="M 280 250 L 285 235 L 275 225 L 292 223 L 298 210 L 304 223 L 321 225 L 311 235 L 316 250 L 298 238 Z" 
        fill="#FFEB3B" stroke="#FFA500" stroke-width="1.5"/>
  <path d="M 430 280 L 433 270 L 427 264 L 438 263 L 442 255 L 446 263 L 457 264 L 451 270 L 454 280 L 442 273 Z" 
        fill="#FFF9C4" stroke="#FFA500" stroke-width="1"/>
</svg>`)}`,

  'explosion-1': `data:image/svg+xml;base64,${btoa(`<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="60" fill="#FF6B6B" opacity="0.8"/>
  <circle cx="256" cy="256" r="40" fill="#FFE66D" opacity="0.9"/>
  <path d="M 256 256 L 280 180 L 265 240 Z" fill="#FF8787" opacity="0.7"/>
  <path d="M 256 256 L 332 232 L 275 245 Z" fill="#FFA07A" opacity="0.7"/>
  <path d="M 256 256 L 320 310 L 270 265 Z" fill="#FF6B6B" opacity="0.7"/>
  <path d="M 256 256 L 240 340 L 250 270 Z" fill="#FF8787" opacity="0.7"/>
  <path d="M 256 256 L 180 300 L 240 265 Z" fill="#FFA07A" opacity="0.7"/>
  <path d="M 256 256 L 200 200 L 245 245 Z" fill="#FF6B6B" opacity="0.7"/>
  <circle cx="140" cy="160" r="12" fill="#FFD700"/>
  <circle cx="380" cy="190" r="15" fill="#FFE66D"/>
  <circle cx="350" cy="350" r="10" fill="#FFD700"/>
  <circle cx="170" cy="360" r="13" fill="#FFE66D"/>
  <circle cx="390" cy="290" r="8" fill="#FFA07A"/>
  <circle cx="150" cy="270" r="11" fill="#FF8787"/>
  <path d="M 120 120 L 125 105 L 115 95 L 132 93 L 138 80 L 144 93 L 161 95 L 151 105 L 156 120 L 138 108 Z" fill="#FFEB3B"/>
  <path d="M 400 140 L 405 125 L 395 115 L 412 113 L 418 100 L 424 113 L 441 115 L 431 125 L 436 140 L 418 128 Z" fill="#FFD700"/>
</svg>`)}`,

  'hearts-1': `data:image/svg+xml;base64,${btoa(`<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path d="M 256 400 C 256 400 180 340 150 290 C 130 260 130 220 150 200 C 170 180 200 180 220 200 C 230 210 246 225 256 240 C 266 225 282 210 292 200 C 312 180 342 180 362 200 C 382 220 382 260 362 290 C 332 340 256 400 256 400 Z" 
        fill="#FF1744" opacity="0.9"/>
  <path d="M 160 140 C 160 140 110 100 90 70 C 75 50 75 25 90 12 C 105 0 125 0 140 12 C 147 20 157 30 160 38 C 163 30 173 20 180 12 C 195 0 215 0 230 12 C 245 25 245 50 230 70 C 210 100 160 140 160 140 Z" 
        fill="#F50057" opacity="0.85"/>
  <path d="M 400 120 C 400 120 370 95 358 75 C 348 60 348 42 358 32 C 368 22 382 22 392 32 C 397 38 404 45 400 50 C 396 45 403 38 408 32 C 418 22 432 22 442 32 C 452 42 452 60 442 75 C 430 95 400 120 400 120 Z" 
        fill="#FF4081" opacity="0.8"/>
  <path d="M 350 260 C 350 260 330 245 322 232 C 316 223 316 211 322 205 C 328 199 338 199 344 205 C 347 209 351 213 350 216 C 349 213 352 209 356 205 C 362 199 372 199 378 205 C 384 211 384 223 378 232 C 370 245 350 260 350 260 Z" 
        fill="#E91E63" opacity="0.75"/>
</svg>`)}`,

  'sparkles-1': `data:image/svg+xml;base64,${btoa(`<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(256, 256)">
    <path d="M 0 -60 L 8 -8 L 60 0 L 8 8 L 0 60 L -8 8 L -60 0 L -8 -8 Z" fill="#FFD700" opacity="0.95"/>
    <path d="M 0 -40 L 5 -5 L 40 0 L 5 5 L 0 40 L -5 5 L -40 0 L -5 -5 Z" fill="#FFEB3B"/>
  </g>
  <g transform="translate(380, 140)">
    <path d="M 0 -35 L 5 -5 L 35 0 L 5 5 L 0 35 L -5 5 L -35 0 L -5 -5 Z" fill="#FFE082" opacity="0.9"/>
  </g>
  <g transform="translate(150, 360)">
    <path d="M 0 -40 L 6 -6 L 40 0 L 6 6 L 0 40 L -6 6 L -40 0 L -6 -6 Z" fill="#FFF59D" opacity="0.85"/>
  </g>
  <g transform="translate(120, 180)">
    <path d="M 0 -20 L 3 -3 L 20 0 L 3 3 L 0 20 L -3 3 L -20 0 L -3 -3 Z" fill="#FFFDE7" opacity="0.8"/>
  </g>
  <g transform="translate(400, 300)">
    <path d="M 0 -25 L 4 -4 L 25 0 L 4 4 L 0 25 L -4 4 L -25 0 L -4 -4 Z" fill="#FFE082" opacity="0.85"/>
  </g>
  <g transform="translate(320, 100)">
    <path d="M 0 -15 L 2 -2 L 15 0 L 2 2 L 0 15 L -2 2 L -15 0 L -2 -2 Z" fill="#FFF9C4" opacity="0.75"/>
  </g>
  <g transform="translate(180, 420)">
    <path d="M 0 -18 L 3 -3 L 18 0 L 3 3 L 0 18 L -3 3 L -18 0 L -3 -3 Z" fill="#FFECB3" opacity="0.8"/>
  </g>
  <g transform="translate(440, 200)">
    <path d="M 0 -12 L 2 -2 L 12 0 L 2 2 L 0 12 L -2 2 L -12 0 L -2 -2 Z" fill="#FFF59D" opacity="0.7"/>
  </g>
</svg>`)}`
};

export const getStickerAsset = (stickerId: string): string | undefined => {
  return STICKER_ASSETS[stickerId];
};
