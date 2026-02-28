# Liberté Mountain Scroll Animation — Design

## Overview

Scroll-driven animation for the Liberté case study page on roamer.se. The centerpiece effect: a light-beige mountain SVG (zoomed into the canyon gap) shrinks and fades to reveal a gold foil mountain silhouette with the Liberté logo.

Stack: Vanilla HTML/CSS/JS, GSAP ScrollTrigger, Lenis smooth scroll. No new dependencies.

## Scroll Sequence

1. **Hero** (existing) — light beige (#F5F4ED), heading + bottle image, 100vh
2. **Top SVG transition** — static full-width `top.svg` filled slate blue, mountains rise from bottom with canyon gap showing light bg. Seamless color bridge into dark sections.
3. **Dark content sections** — slate blue bg, case study content (01/08: the gap, 02/08: the solution, etc.)
4. **Mountain reveal (PINNED)** — bottom.svg shrinks + fades, gold foil revealed, liberté brand fades in
5. **Final state** — light beige bg, gold foil mountain, liberté logo + tagline

## Top SVG (Static Transition)

- `top.svg` (1631x325) placed full-width at bottom of light content section
- Fill: slate blue (same color as dark sections below)
- Path fills below the mountain contour — light bg shows above and through canyon gap
- No animation — scrolls naturally with page
- `line-height: 0` on wrapper kills inline SVG gap
- Seamless color join with dark sections below

## Mountain Reveal Section (Pinned Animation)

### Layer Stack (back to front)

| Layer | Element | z-index | Initial State | Animation |
|-------|---------|---------|---------------|-----------|
| 0 | Background div | 0 | `background-color: slate blue` | Color → `#F5F4ED` (phase 1) |
| 1 | Gold foil mountain PNG | 1 | Centered, static, visible | None (always there, hidden by SVG) |
| 2 | Liberté text + tagline | 2 | `opacity: 0`, centered | Opacity → 1 (phase 2) |
| 3 | Inline bottom.svg | 3 | `scale(5)`, `opacity: 1`, fill `#F5F4ED` | Scale → 1, opacity → 0 (phase 1) |

### CSS

```css
.mountain-reveal {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.mountain-reveal__bg {
  position: absolute;
  inset: 0;
  background-color: #4E5D6C; /* slate blue — match to actual project color */
  z-index: 0;
}

.mountain-reveal__gold {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60%; /* tune to align with SVG at scale(1) */
  z-index: 1;
}

.mountain-reveal__brand {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  opacity: 0;
  z-index: 2;
}

.mountain-reveal__svg {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(5);
  transform-origin: center center;
  width: 100%;
  opacity: 1;
  will-change: transform, opacity;
  z-index: 3;
}
```

### ScrollTrigger Configuration

```javascript
scrollTrigger: {
  trigger: '.mountain-reveal',
  pin: true,
  scrub: 1,                    // 1s smoothing
  start: 'top top',
  end: '+=200%',               // 2x viewport scroll distance while pinned
  invalidateOnRefresh: true    // recalc on resize
}
```

### Animation Timeline

```
Scroll:  0% ──────────────── 80% ────── 100%
         │──── Phase 1 ──────│─ Phase 2 ─│

SVG scale:    5 ────────────→ 1           1
SVG opacity:  1 ────────────→ 0           0
BG color:     slate blue ──→ #F5F4ED      #F5F4ED
Brand opacity: 0              0 ────────→ 1
```

Phase 1 (0%–80%): bottom.svg scale 5→1, opacity 1→0, bg color transitions
Phase 2 (80%–100%): liberté text + tagline fade in

```javascript
const tl = gsap.timeline({ scrollTrigger: { ... } });

tl.to('.mountain-reveal__svg', {
  scale: 1, opacity: 0, duration: 0.8, ease: 'none'
}, 0);

tl.to('.mountain-reveal__bg', {
  backgroundColor: '#F5F4ED', duration: 0.8, ease: 'none'
}, 0);

tl.to('.mountain-reveal__brand', {
  opacity: 1, duration: 0.2, ease: 'none'
}, 0.8);
```

### Alignment

Gold foil PNG and bottom.svg at scale(1) must show identical mountain contours at the same position:
- Both centered via `left: 50%; top: 50%; transform: translate(-50%, -50%)`
- Gold foil `width` tuned to match SVG's rendered width at scale(1)
- Both derived from the same Abisko mountain silhouette

## Responsive (Mobile ≤767px)

Same animation with adjusted values:
- Starting scale: ~3x (instead of 5x) — canyon gap stays visible on portrait screens
- Pin scroll distance: 150vh (instead of 200vh) — less thumb scrolling
- Everything else identical

## Tunable Values

| Parameter | Default | What it controls |
|-----------|---------|------------------|
| Starting scale | 5x (desktop) / 3x (mobile) | How zoomed-in the canyon appears initially |
| `scrub` | 1 | Smoothing between scroll and animation (0.5=snappier, 1.5=cinematic) |
| `end` | +=200% (desktop) / +=150% (mobile) | Total scroll distance while pinned |
| Phase split | 80/20 | When brand text starts fading in |
| Gold foil `width` | 60% | Alignment with SVG at scale(1) |

## Edge Cases

- **Fast scroll**: `scrub: 1` smooths jitter
- **Browser resize**: `invalidateOnRefresh: true` recalculates
- **Lenis + ScrollTrigger**: Already synced in existing liberte.js
- **Snap scroll**: Kept out of snap array or snap disabled for this narrative page
- **SVG at large scale**: Vector — scales cleanly, no pixelation

## Assets Required

- `top.svg` (1631x325) — fill changed to slate blue
- `bottom.svg` (1631x401) — fill changed to #F5F4ED, embedded inline
- `liberte-logo-range.png` — gold foil mountain silhouette
- `liberte logo.svg` (348x147) — liberté wordmark, color #6C2B1B
