# FitKB

FitKB is a free, browser-based JPEG, PNG, and WebP compressor and resizer. The first-version differentiator is **target file size in kilobytes** with honest reporting when that target cannot be reached.

Images are processed with browser APIs on the visitor’s device. This app does not upload selected photos, and it has no database, accounts, or paid APIs.

## Requirements

- Node.js 22+ (the project was developed on Node 22)
- npm 10+

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` only when you have a real public origin. Until then, canonical URLs, Open Graph tags, `robots.txt`, and `sitemap.xml` use the documented placeholder `https://www.example.com`.

```
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

Replace that value with your production origin (no trailing slash) before you care about SEO. Do not invent a brand domain.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest unit tests (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run build` | Production **static export** into `out/` |

`npm start` (`next start`) is not used for this static export. After `npm run build`, serve the `out/` directory with any static host or local static server.

## Static build and Cloudflare Pages

`next.config.ts` sets `output: 'export'` and `images.unoptimized: true` so the site can be hosted without a Node server.

Suggested Cloudflare Pages settings:

- Build command: `npm run build`
- Output directory: `out`
- Environment variable: `NEXT_PUBLIC_SITE_URL` = your real `https://` origin

`public/_headers` is copied into the export for basic browser security headers. Advertisement regions are labelled development placeholders and do **not** load an ad network.

## How compression works

- Files are validated, then decoded with `createImageBitmap`.
- Resize uses a canvas (or `OffscreenCanvas` when available).
- JPEG and WebP use the browser encoder’s quality parameter.
- **Target KB** mode runs a bounded binary search for the **highest** quality whose encoded size is still at or under the target. If the lowest quality is still too large, the UI reports a miss and never labels that run as success.
- PNG is lossless. Quality does not apply. A target size usually requires resizing or a switch to JPEG/WebP.
- JPEG cannot store transparency; transparent pixels are flattened onto white, with a warning first.

## Added dependencies

Runtime: Next.js, React, React DOM, Tailwind CSS (from `create-next-app`). Image work uses built-in browser APIs only — no compression SaaS and no extra encoder packages.

Dev-only tests: Vitest, Testing Library, jsdom, `@vitejs/plugin-react`, and `vite-tsconfig-paths`. `@types/node` is at v22 to match Node 22 and Vitest’s peer range.

## Known limitations

- Encoder quality and WebP support vary by browser.
- Canvas JPEG/WebP is not a professional encoder (limited controls, possible chroma differences).
- Very large pixel counts can fail or exhaust memory; the app enforces file-size and dimension guards.
- GIF, AVIF, HEIC, TIFF, BMP, and SVG are not accepted.
- Enlarging an image cannot invent detail.
- SEO metadata uses a placeholder origin until `NEXT_PUBLIC_SITE_URL` is set. This does not guarantee search ranking.
- Contact details on the site are placeholders, not a real business identity.

## Project layout

- `src/app` — App Router pages, metadata, robots, sitemap
- `src/components/tool` — uploader, settings, comparison, workspace
- `src/lib/image` — validation, resize math, target-size search, encode pipeline
- `src/content` — FAQ copy shared with JSON-LD
