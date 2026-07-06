# Paul Frost Portfolio V2

## Project
- **Client:** Paul Frost (creative director / brand builder)
- **Directory:** `/Users/yasin/Desktop/Roamer/Portoflio/public_html/v2/`
- **Type:** Static portfolio site (HTML/CSS/JS, no build step)
- **Server:** Open with any local server (e.g. `python3 -m http.server 8080`)

## Tech Stack
- **Three.js** (v0.160.0 via import map) — 3D bust model in hero
- **GSAP v3** + ScrollTrigger — scroll animations, tweens
- **Lenis** — smooth scrolling
- No framework, no bundler — vanilla JS

## Fonts
- **IvyPresto Headline** — Typekit (`ivypresto-headline`), local OTF fallbacks. Weights: 100i, 300, 400, 400i, 700, 700i
- **Neue Haas Grotesk Display Pro** — cdnfonts. Weights: 100–900 + italics
- **Playfair Display** — Google Fonts. Weights: 400, 700, 900 + italics
- CSS vars: `--font-sans` (Neue Haas), `--font-serif` (IvyPresto/Playfair)

## File Structure
| File | Purpose |
|---|---|
| `index.html` | Main page — hero + works sections |
| `style.css` | All styles (single file) |
| `bust.js` | Three.js bust loader + mouse tracking + scroll parallax/fade |
| `works.js` | Works section — search typing animation, autocomplete, case display, pagination |
| `images/` | Image assets (liberte.jpg, favicon, logo, etc.) |
| `models/bust.glb` | 3D bust model |
| `fonts/` | Local IvyPresto OTF files |

## Current State (Sections Built)
1. **Hero** — Full viewport, 3D bust, headline, subtitle, scroll fade
2. **Works** — Google Search-inspired showcase. Search bar types text, autocomplete suggestions appear one by one, then work case (image, tags, title, description) animates in. Pagination for 8 works. Only Work 1 (Liberte Coffee) is populated; works 2–8 to be added later.

## Key Design Decisions
- Sections are `100vh` / `100svh`
- Bust fades out between 40%–80% of hero scroll
- Search bar has fixed 700px width (auto on mobile)
- Suggestions stagger at 400ms intervals
- Works auto-cycle every 3 seconds after case loads
- Browser subtitle ("a browser that always tells the truth") is ivypresto-headline 600 weight italic with 10vh top padding
- Suggestion text: 16px, 500 weight (bold words: 700)
- Search bar: 20px bottom margin

## Application Pages (per-job sites)

Each job application is its own folder under `public_html/` (e.g. `tictac/`, `zumtobel/`), cloned from a template site and rewritten via `page-config.js`. `zumtobel/` and `tictac/` are the current clone templates.

**Shared 3D bust (do not re-copy per page):**
- The hero bust is a single shared asset at **`/assets/bust.glb`**.
- Every application page loads it in `bust.js` via `loader.load('/assets/bust.glb', ...)` (absolute path, resolves under the web root on roamer.se and a local server rooted at `public_html`).
- When creating a new application page, do **not** add a per-page `models/bust.glb`. If a `cp -R` of a template drags one in, delete it — the template's `bust.js` already points at the shared asset.
- Note: the root portfolio's own `models/bust.glb` is a *different* model used by the main page — leave it alone.
