# Plan: Unify all card image format/size to match QR Generator card

## Context

In `css/carousel.css`, the Projects grid cards render images in two different ways:

- **Standard cards** (`.project-card-img`): `aspect-ratio: 600/340`, `overflow: hidden`, image `object-fit: cover` (crops to fill, no letterbox).
- **QR Generator card** (`.project-card--qr-generator`): `aspect-ratio: auto; height: auto; min-height: 200px; overflow: visible`, image `object-fit: contain; object-position: center bottom; background: #f5f5f5` (shows full image, bottom-aligned, letterboxed).

Both produce an image area of ~200px height at the 3-column layout width (~353px), so the **size** is already equivalent. The difference is the **format**: `cover` vs `contain`.

The user wants ALL cards' images to use the QR Generator's format and size, while keeping badges/buttons aligned (same line/height) regardless of description text length.

## Constraints already satisfied (do not break)

- Badge/button alignment is handled by flexbox in `.project-card-body`: `.card-btn-container` has `margin-top: auto`, `.card-desc` has `flex-grow: 1`. Buttons stay at the bottom of each card regardless of description length.
- Grid rows give all cards the same height (`height: 100%`), so buttons align across cards in a row.
- Image area height stays fixed via `aspect-ratio`, so changing `cover` → `contain` does NOT change card height (contain keeps the image within the fixed box, letterboxing instead of cropping). No layout shift.

## Target file

- `css/carousel.css`

## Changes

### 1. General image rule (lines ~40-55) — adopt QR format for all cards

`.project-card-img`:
- `overflow: hidden` → `overflow: visible` (allow letterbox/tile scatter, matching QR card)

`.project-card-img > img`:
- `object-fit: cover` → `object-fit: contain`
- add `object-position: center bottom`
- add `background: #f5f5f5` (letterbox color, matching QR card)

### 2. Dark mode (new rule)

Add `:is(.dark-mode) .project-card-img > img { background: #1e2d2f; }` (matching QR card's dark letterbox).

### 3. Single-image dashboard cards (lines ~113-125) — preserve colored bg + fade

`.card--single .project-card-img > img`:
- add `background: var(--primary-color)` so the letterbox and the hover-fade-to-bg still show the primary color (preserves dashboard design) while using `object-fit: contain`.

### 4. Remove QR-specific block (lines ~305-337)

The `.project-card--qr-generator` overrides become redundant once the general rule matches the QR format. Remove the block (including the `min-height: 200px` / `height: auto` / `z-index: 1` specifics and the redundant `.project-image-tiles` rule). This makes the QR card use the same `aspect-ratio: 600/340` + `contain` rule as everyone else — truly uniform.

## Verification

- Grep for `object-fit: cover` in `css/carousel.css` → expect zero matches on card images.
- Grep for `proyecto-qr-generator-scan` in `js/carousel.js` → expect only `.jpg` references (already done).
- Confirm `.project-card-img` keeps `aspect-ratio: 600/340` (size unchanged) and `.card-btn-container` keeps `margin-top: auto` (button alignment unchanged).
- The `.jpg` asset already exists at `media/projects/proyecto-qr-generator-scan.jpg`.