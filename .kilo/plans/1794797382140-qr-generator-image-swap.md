# Plan: Replace QR Generator scan image from .webp to .jpg

## Context

The portfolio's Projects section is rendered dynamically by `js/carousel.js`. The QR Generator card currently references `media/projects/prouyo-qr-generator-scan.webp` for its primary image and preview. The user wants this replaced with the existing `media/projects/prouyo-qr-generator-scan.jpg`.

Note: `index.html` only contains an empty `<div id="projectsGrid">` container; the actual image references live in `js/carousel.js`.

## Target file

- `js/carousel.js` — lines 43 and 45

## Changes

1. Line 43: change `img: 'media/projects/prouyo-qr-generator-scan.webp',` → `img: 'media/projects/prouyo-qr-generator-scan.jpg',`
2. Line 45: change `previewImages: ['media/projects/prouyo-qr-generator-scan.webp', 'media/projects/prouyo-qr-generator-icono.webp'],` → `previewImages: ['media/projects/prouyo-qr-generator-scan.jpg', 'media/projects/prouyo-qr-generator-icono.webp'],`

Only the `scan` image changes; the `icono` image stays `.webp` as the user did not request otherwise.

## Verification

- After editing, grep for `prouyo-qr-generator-scan.webp` — expect zero matches.
- Confirm `prouyo-qr-generator-scan.jpg` appears in both `img` and `previewImages`.
- The `.jpg` file already exists at `media/projects/prouyo-qr-generator-scan.jpg`, so no new asset is needed.